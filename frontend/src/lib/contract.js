// VoteChain contract ABI and address
// ABI is manually synced from contracts/artifacts/contracts/VoteChain.sol/VoteChain.json
// after running: cd contracts && npx hardhat compile

export const VOTECHAIN_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

export const VOTECHAIN_ABI = [
  // ── Read functions ──────────────────────────────────────────
  {
    name: "admin",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
  {
    name: "election",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      { name: "title", type: "string" },
      { name: "description", type: "string" },
      { name: "startTime", type: "uint256" },
      { name: "endTime", type: "uint256" },
      { name: "exists", type: "bool" },
    ],
  },
  {
    name: "getCandidates",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "",
        type: "tuple[]",
        components: [
          { name: "id", type: "uint256" },
          { name: "name", type: "string" },
          { name: "party", type: "string" },
          { name: "voteCount", type: "uint256" },
        ],
      },
    ],
  },
  {
    name: "getCandidateCount",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "getCandidate",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "_candidateId", type: "uint256" }],
    outputs: [
      {
        name: "",
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "name", type: "string" },
          { name: "party", type: "string" },
          { name: "voteCount", type: "uint256" },
        ],
      },
    ],
  },
  {
    name: "getElectionStatus",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "string" }],
  },
  {
    name: "isElectionActive",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "getWinner",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [
      {
        name: "winner",
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "name", type: "string" },
          { name: "party", type: "string" },
          { name: "voteCount", type: "uint256" },
        ],
      },
    ],
  },
  {
    name: "hasVoted",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "isWhitelisted",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    name: "votedFor",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "totalVotes",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  // ── Write functions ──────────────────────────────────────────
  {
    name: "createElection",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_title", type: "string" },
      { name: "_description", type: "string" },
      { name: "_startTime", type: "uint256" },
      { name: "_endTime", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "addCandidate",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "_name", type: "string" },
      { name: "_party", type: "string" },
    ],
    outputs: [],
  },
  {
    name: "whitelistVoter",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_voter", type: "address" }],
    outputs: [],
  },
  {
    name: "whitelistVotersBatch",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_voters", type: "address[]" }],
    outputs: [],
  },
  {
    name: "castVote",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "_candidateId", type: "uint256" }],
    outputs: [],
  },
  {
    name: "endElection",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  // ── Events ──────────────────────────────────────────────────
  {
    name: "ElectionCreated",
    type: "event",
    inputs: [
      { name: "title", type: "string", indexed: false },
      { name: "startTime", type: "uint256", indexed: false },
      { name: "endTime", type: "uint256", indexed: false },
    ],
  },
  {
    name: "CandidateAdded",
    type: "event",
    inputs: [
      { name: "candidateId", type: "uint256", indexed: true },
      { name: "name", type: "string", indexed: false },
      { name: "party", type: "string", indexed: false },
    ],
  },
  {
    name: "VoterWhitelisted",
    type: "event",
    inputs: [{ name: "voter", type: "address", indexed: true }],
  },
  {
    name: "VoteCast",
    type: "event",
    inputs: [
      { name: "voter", type: "address", indexed: true },
      { name: "candidateId", type: "uint256", indexed: true },
      { name: "timestamp", type: "uint256", indexed: false },
    ],
  },
  {
    name: "ElectionEnded",
    type: "event",
    inputs: [{ name: "timestamp", type: "uint256", indexed: false }],
  },
];