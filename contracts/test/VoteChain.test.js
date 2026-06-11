const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("VoteChain", function () {
  let voteChain;
  let admin, voter1, voter2, voter3, nonVoter;

  async function getTimestamps(startOffsetSecs = 60, durationSecs = 3600) {
    const now = await time.latest();
    return {
      startTime: now + startOffsetSecs,
      endTime: now + startOffsetSecs + durationSecs,
    };
  }

  beforeEach(async function () {
    [admin, voter1, voter2, voter3, nonVoter] = await ethers.getSigners();
    const VoteChain = await ethers.getContractFactory("VoteChain");
    voteChain = await VoteChain.deploy();
    await voteChain.waitForDeployment();
  });

  describe("Deployment", function () {
    it("should set deployer as admin", async function () {
      expect(await voteChain.admin()).to.equal(admin.address);
    });
    it("should start with no election", async function () {
      expect(await voteChain.getElectionStatus()).to.equal("NO_ELECTION");
    });
  });

  describe("createElection", function () {
    it("admin can create an election", async function () {
      const { startTime, endTime } = await getTimestamps();
      await voteChain.createElection("CS Society 2026", "Annual election", startTime, endTime);
      const election = await voteChain.election();
      expect(election.title).to.equal("CS Society 2026");
      expect(election.exists).to.equal(true);
    });
    it("non-admin cannot create an election", async function () {
      const { startTime, endTime } = await getTimestamps();
      await expect(
        voteChain.connect(voter1).createElection("Fake", "Fake", startTime, endTime)
      ).to.be.revertedWith("VoteChain: caller is not admin");
    });
    it("start time must be in the future", async function () {
      const now = await time.latest();
      await expect(
        voteChain.createElection("Test", "Test", now - 1, now + 3600)
      ).to.be.revertedWith("VoteChain: start must be in the future");
    });
    it("end time must be after start time", async function () {
      const now = await time.latest();
      await expect(
        voteChain.createElection("Test", "Test", now + 100, now + 50)
      ).to.be.revertedWith("VoteChain: end must be after start");
    });
  });

  describe("addCandidate", function () {
    beforeEach(async function () {
      const { startTime, endTime } = await getTimestamps();
      await voteChain.createElection("CS Society 2026", "Annual", startTime, endTime);
    });
    it("admin can add candidates before election starts", async function () {
      await voteChain.addCandidate("Ali Raza", "Tech Party");
      await voteChain.addCandidate("Sara Khan", "Progress Party");
      expect(await voteChain.getCandidateCount()).to.equal(2);
    });
    it("candidates get sequential IDs starting from 1", async function () {
      await voteChain.addCandidate("Ali Raza", "Tech Party");
      const candidate = await voteChain.getCandidate(1);
      expect(candidate.id).to.equal(1n);
      expect(candidate.name).to.equal("Ali Raza");
    });
    it("cannot add candidate after election starts", async function () {
      const { startTime } = await getTimestamps();
      await time.increaseTo(startTime + 1);
      await expect(
        voteChain.addCandidate("Late Candidate", "No Party")
      ).to.be.revertedWith("VoteChain: election already started");
    });
  });

  describe("whitelisting", function () {
    it("admin can whitelist a single voter", async function () {
      await voteChain.whitelistVoter(voter1.address);
      expect(await voteChain.isWhitelisted(voter1.address)).to.equal(true);
    });
    it("admin can batch whitelist voters", async function () {
      await voteChain.whitelistVotersBatch([voter1.address, voter2.address, voter3.address]);
      expect(await voteChain.isWhitelisted(voter1.address)).to.equal(true);
      expect(await voteChain.isWhitelisted(voter2.address)).to.equal(true);
      expect(await voteChain.isWhitelisted(voter3.address)).to.equal(true);
    });
    it("non-admin cannot whitelist voters", async function () {
      await expect(
        voteChain.connect(voter1).whitelistVoter(voter2.address)
      ).to.be.revertedWith("VoteChain: caller is not admin");
    });
  });

  describe("castVote", function () {
    let startTime, endTime;
    beforeEach(async function () {
      ({ startTime, endTime } = await getTimestamps(60, 3600));
      await voteChain.createElection("CS Society 2026", "Annual", startTime, endTime);
      await voteChain.addCandidate("Ali Raza", "Tech Party");
      await voteChain.addCandidate("Sara Khan", "Progress Party");
      await voteChain.whitelistVotersBatch([voter1.address, voter2.address, voter3.address]);
      await time.increaseTo(startTime + 1);
    });
    it("whitelisted voter can cast a vote", async function () {
      await voteChain.connect(voter1).castVote(1);
      expect(await voteChain.hasVoted(voter1.address)).to.equal(true);
      expect(await voteChain.votedFor(voter1.address)).to.equal(1n);
      expect(await voteChain.totalVotes()).to.equal(1n);
    });
    it("vote count on candidate increases", async function () {
      await voteChain.connect(voter1).castVote(1);
      await voteChain.connect(voter2).castVote(1);
      const candidate = await voteChain.getCandidate(1);
      expect(candidate.voteCount).to.equal(2n);
    });
    it("voter cannot vote twice", async function () {
      await voteChain.connect(voter1).castVote(1);
      await expect(
        voteChain.connect(voter1).castVote(2)
      ).to.be.revertedWith("VoteChain: you have already voted");
    });
    it("non-whitelisted voter cannot vote", async function () {
      await expect(
        voteChain.connect(nonVoter).castVote(1)
      ).to.be.revertedWith("VoteChain: you are not whitelisted to vote");
    });
    it("invalid candidate ID is rejected", async function () {
      await expect(
        voteChain.connect(voter1).castVote(99)
      ).to.be.revertedWith("VoteChain: invalid candidate ID");
    });
    it("emits VoteCast event", async function () {
      await expect(voteChain.connect(voter1).castVote(1))
        .to.emit(voteChain, "VoteCast");
    });
  });

  describe("results", function () {
    let startTime, endTime;
    beforeEach(async function () {
      ({ startTime, endTime } = await getTimestamps(60, 3600));
      await voteChain.createElection("CS Society 2026", "Annual", startTime, endTime);
      await voteChain.addCandidate("Ali Raza", "Tech Party");
      await voteChain.addCandidate("Sara Khan", "Progress Party");
      await voteChain.whitelistVotersBatch([voter1.address, voter2.address, voter3.address]);
      await time.increaseTo(startTime + 1);
    });
    it("getWinner returns candidate with most votes", async function () {
      await voteChain.connect(voter1).castVote(2);
      await voteChain.connect(voter2).castVote(2);
      await voteChain.connect(voter3).castVote(1);
      const winner = await voteChain.getWinner();
      expect(winner.name).to.equal("Sara Khan");
    });
    it("getCandidates returns full array with vote counts", async function () {
      await voteChain.connect(voter1).castVote(1);
      const candidates = await voteChain.getCandidates();
      expect(candidates.length).to.equal(2);
      expect(candidates[0].voteCount).to.equal(1n);
    });
    it("election status is ENDED after endTime passes", async function () {
      await time.increaseTo(endTime + 1);
      expect(await voteChain.getElectionStatus()).to.equal("ENDED");
    });
    it("admin can manually end election early", async function () {
      await voteChain.endElection();
      // mine one block so timestamp advances past the endTime we just set
      await ethers.provider.send("evm_mine", []);
      expect(await voteChain.getElectionStatus()).to.equal("ENDED");
    });
  });
});