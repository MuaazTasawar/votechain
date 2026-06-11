// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title VoteChain
 * @author MuaazTasawar
 * @notice Tamper-proof on-chain voting for university elections.
 *         Admin whitelists voters, adds candidates, opens/closes
 *         a time-boxed election window. Every vote is a permanent
 *         on-chain transaction — publicly auditable, one vote per wallet.
 */
contract VoteChain {
    // ─────────────────────────────────────────────
    // Structs
    // ─────────────────────────────────────────────

    struct Candidate {
        uint256 id;
        string name;
        string party;
        uint256 voteCount;
    }

    struct ElectionInfo {
        string title;
        string description;
        uint256 startTime;
        uint256 endTime;
        bool exists;
    }

    // ─────────────────────────────────────────────
    // State
    // ─────────────────────────────────────────────

    address public admin;

    ElectionInfo public election;

    Candidate[] public candidates;

    // voter address => has voted
    mapping(address => bool) public hasVoted;

    // voter address => is whitelisted
    mapping(address => bool) public isWhitelisted;

    // voter address => which candidate id they voted for (0 = not voted)
    mapping(address => uint256) public votedFor;

    uint256 public totalVotes;

    // ─────────────────────────────────────────────
    // Events
    // ─────────────────────────────────────────────

    event ElectionCreated(
        string title,
        uint256 startTime,
        uint256 endTime
    );

    event CandidateAdded(
        uint256 indexed candidateId,
        string name,
        string party
    );

    event VoterWhitelisted(address indexed voter);

    event VoteCast(
        address indexed voter,
        uint256 indexed candidateId,
        uint256 timestamp
    );

    event ElectionEnded(uint256 timestamp);

    // ─────────────────────────────────────────────
    // Modifiers
    // ─────────────────────────────────────────────

    modifier onlyAdmin() {
        require(msg.sender == admin, "VoteChain: caller is not admin");
        _;
    }

    modifier electionActive() {
        require(election.exists, "VoteChain: no election created");
        require(
            block.timestamp >= election.startTime,
            "VoteChain: election has not started yet"
        );
        require(
            block.timestamp <= election.endTime,
            "VoteChain: election has ended"
        );
        _;
    }

    modifier electionNotStarted() {
        require(
            !election.exists || block.timestamp < election.startTime,
            "VoteChain: election already started"
        );
        _;
    }

    // ─────────────────────────────────────────────
    // Constructor
    // ─────────────────────────────────────────────

    constructor() {
        admin = msg.sender;
    }

    // ─────────────────────────────────────────────
    // Admin Functions
    // ─────────────────────────────────────────────

    /**
     * @notice Create a new election. Can only be called before any
     *         previous election has started.
     * @param _title       Short title (e.g. "CS Society Election 2026")
     * @param _description Longer description shown to voters
     * @param _startTime   Unix timestamp when voting opens
     * @param _endTime     Unix timestamp when voting closes
     */
    function createElection(
        string calldata _title,
        string calldata _description,
        uint256 _startTime,
        uint256 _endTime
    ) external onlyAdmin {
        require(
            !election.exists || block.timestamp > election.endTime,
            "VoteChain: an active election already exists"
        );
        require(_startTime > block.timestamp, "VoteChain: start must be in the future");
        require(_endTime > _startTime, "VoteChain: end must be after start");

        // Reset state for new election
        delete candidates;
        totalVotes = 0;

        election = ElectionInfo({
            title: _title,
            description: _description,
            startTime: _startTime,
            endTime: _endTime,
            exists: true
        });

        emit ElectionCreated(_title, _startTime, _endTime);
    }

    /**
     * @notice Add a candidate. Must be called before election starts.
     */
    function addCandidate(
        string calldata _name,
        string calldata _party
    ) external onlyAdmin electionNotStarted {
        require(election.exists, "VoteChain: create an election first");
        uint256 newId = candidates.length + 1; // IDs start at 1
        candidates.push(
            Candidate({
                id: newId,
                name: _name,
                party: _party,
                voteCount: 0
            })
        );
        emit CandidateAdded(newId, _name, _party);
    }

    /**
     * @notice Whitelist a single voter address.
     */
    function whitelistVoter(address _voter) external onlyAdmin {
        require(_voter != address(0), "VoteChain: invalid address");
        isWhitelisted[_voter] = true;
        emit VoterWhitelisted(_voter);
    }

    /**
     * @notice Whitelist multiple voters in one transaction (gas efficient).
     */
    function whitelistVotersBatch(address[] calldata _voters) external onlyAdmin {
        for (uint256 i = 0; i < _voters.length; i++) {
            require(_voters[i] != address(0), "VoteChain: invalid address in batch");
            isWhitelisted[_voters[i]] = true;
            emit VoterWhitelisted(_voters[i]);
        }
    }

    /**
     * @notice Manually end the election before its scheduled end time.
     */
    function endElection() external onlyAdmin {
        require(election.exists, "VoteChain: no election exists");
        require(block.timestamp >= election.startTime, "VoteChain: election not started yet");
        election.endTime = block.timestamp;
        emit ElectionEnded(block.timestamp);
    }

    // ─────────────────────────────────────────────
    // Voter Functions
    // ─────────────────────────────────────────────

    /**
     * @notice Cast a vote for a candidate by their ID.
     * @param _candidateId 1-indexed candidate ID
     */
    function castVote(uint256 _candidateId) external electionActive {
        require(isWhitelisted[msg.sender], "VoteChain: you are not whitelisted to vote");
        require(!hasVoted[msg.sender], "VoteChain: you have already voted");
        require(_candidateId >= 1 && _candidateId <= candidates.length, "VoteChain: invalid candidate ID");

        hasVoted[msg.sender] = true;
        votedFor[msg.sender] = _candidateId;
        candidates[_candidateId - 1].voteCount += 1;
        totalVotes += 1;

        emit VoteCast(msg.sender, _candidateId, block.timestamp);
    }

    // ─────────────────────────────────────────────
    // View Functions
    // ─────────────────────────────────────────────

    /**
     * @notice Get all candidates with their current vote counts.
     */
    function getCandidates() external view returns (Candidate[] memory) {
        return candidates;
    }

    /**
     * @notice Get the total number of candidates.
     */
    function getCandidateCount() external view returns (uint256) {
        return candidates.length;
    }

    /**
     * @notice Get a single candidate by ID.
     */
    function getCandidate(uint256 _candidateId)
        external
        view
        returns (Candidate memory)
    {
        require(_candidateId >= 1 && _candidateId <= candidates.length, "VoteChain: invalid candidate ID");
        return candidates[_candidateId - 1];
    }

    /**
     * @notice Returns true if the election is currently accepting votes.
     */
    function isElectionActive() external view returns (bool) {
        if (!election.exists) return false;
        return block.timestamp >= election.startTime && block.timestamp <= election.endTime;
    }

    /**
     * @notice Returns the winning candidate (highest votes).
     *         In case of a tie, returns the first candidate with max votes.
     */
    function getWinner() external view returns (Candidate memory winner) {
        require(candidates.length > 0, "VoteChain: no candidates");
        uint256 maxVotes = 0;
        for (uint256 i = 0; i < candidates.length; i++) {
            if (candidates[i].voteCount > maxVotes) {
                maxVotes = candidates[i].voteCount;
                winner = candidates[i];
            }
        }
    }

    /**
     * @notice Get election status as a string for easy frontend display.
     */
    function getElectionStatus() external view returns (string memory) {
        if (!election.exists) return "NO_ELECTION";
        if (block.timestamp < election.startTime) return "PENDING";
        if (block.timestamp <= election.endTime) return "ACTIVE";
        return "ENDED";
    }
}