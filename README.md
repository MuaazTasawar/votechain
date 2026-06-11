# VoteChain 🗳️

> **Tamper-proof, publicly auditable on-chain voting for university elections.**
> Every ballot is a permanent Ethereum transaction — no middleman, no manipulation, no trust required.

**🌐 Live Demo:** https://votechain-mu.vercel.app
**📜 Contract:** [0x431D66de6e87766be6f07DCd30477d1E5B4465B0](https://sepolia.etherscan.io/address/0x431D66de6e87766be6f07DCd30477d1E5B4465B0) *(Ethereum Sepolia Testnet)*
**👨‍💻 Author:** [MuaazTasawar](https://github.com/MuaazTasawar)

---

## Table of Contents

- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [How It Works](#how-it-works)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Smart Contract](#smart-contract)
- [Frontend](#frontend)
- [Local Development](#local-development)
- [Deploying the Contract](#deploying-the-contract)
- [Deploying the Frontend](#deploying-the-frontend)
- [How to Use](#how-to-use)
- [Running Tests](#running-tests)
- [Security Considerations](#security-considerations)
- [Roadmap](#roadmap)
- [License](#license)

---

## The Problem

University society and student council elections in Pakistan — and across many emerging markets — are routinely manipulated:

- **Physical ballots** are stuffed or miscounted
- **Google Form polls** allow the same person to vote multiple times
- **Results are announced** with zero transparency or verifiability
- **Students have no recourse** — there is no public audit trail, no independent verification, and disputes almost always favor whoever controls the counting process

Existing digital voting tools either require trusting a central authority, rely on easily-gamed client-side checks, or are too complex for everyday use.

---

## The Solution

VoteChain replaces opaque election systems with a **permissioned smart contract deployed on Ethereum**. The core insight is simple:

> If every vote is a blockchain transaction, it is permanently recorded, publicly visible, cryptographically verifiable, and impossible to alter — by anyone, including the admin.

The admin whitelists eligible voter wallets, publishes candidates, and opens a time-boxed election window. Every vote is an on-chain transaction — pseudonymous, publicly auditable, and automatically tallied by the contract with no manual counting. Results are live and verifiable by anyone with the contract address, no account required.

---

## How It Works

```
Admin                          Smart Contract                    Voter
  │                                  │                              │
  │── createElection() ─────────────>│                              │
  │── addCandidate() ───────────────>│                              │
  │── whitelistVotersBatch() ───────>│                              │
  │                                  │                              │
  │              [Election start time passes]                       │
  │                                  │                              │
  │                                  │<─── castVote(candidateId) ───│
  │                                  │                              │
  │                                  │──── emit VoteCast event ────>│ (Etherscan)
  │                                  │                              │
  │              [Election end time passes]                         │
  │                                  │                              │
  │                           Results final                         │
  │                     (anyone can call getWinner())               │
```

1. **Admin deploys** the contract — their wallet address is permanently stored as the admin
2. **Admin creates** an election with a title, description, start time, and end time
3. **Admin adds candidates** (name + party/platform) before the election starts
4. **Admin whitelists** voter wallet addresses (single or batch)
5. **Election opens** automatically when `block.timestamp >= startTime`
6. **Voters connect** MetaMask, verify their whitelist status, and cast one vote
7. **Each vote** triggers a MetaMask transaction — the voter pays a tiny gas fee (~$0.01 on mainnet)
8. **Results update live** as each transaction confirms — the frontend streams `VoteCast` events via WebSocket
9. **Anyone** can visit `/results` or go directly to Etherscan to audit every single vote independently

---

## Features

### Core Voting
- ✅ **On-chain ballot recording** — every vote is a permanent, immutable blockchain transaction
- ✅ **Double-vote prevention** — enforced at the EVM level, not the UI — impossible to bypass
- ✅ **Permissioned whitelist** — only admin-approved wallets can participate
- ✅ **Time-boxed elections** — start and end timestamps enforced by the smart contract
- ✅ **Automatic winner calculation** — `getWinner()` returns the leading candidate at any time

### Admin Tools
- ✅ **Create elections** with custom title, description, start/end time
- ✅ **Add candidates** with name and party/platform fields
- ✅ **Single voter whitelisting** — add one address at a time
- ✅ **Batch voter whitelisting** — add hundreds of addresses in a single gas-efficient transaction
- ✅ **Early election termination** — admin can end the election before its scheduled end time
- ✅ **Admin access control** — all admin functions revert if called by non-admin address

### Frontend
- ✅ **MetaMask wallet integration** — connect, disconnect, wrong network detection
- ✅ **Real-time vote counts** — live bar charts update as votes come in
- ✅ **Live vote feed** — every `VoteCast` event streams to the UI in real time with Etherscan links
- ✅ **Voter status display** — shows if connected wallet is whitelisted, has voted, and who they voted for
- ✅ **Public results** — no wallet connection needed to view live results
- ✅ **Transaction feedback** — pending → confirming → confirmed states with Etherscan link
- ✅ **Responsive design** — works on desktop and mobile

### Transparency
- ✅ **Public contract** — deployed on Ethereum Sepolia, readable by anyone
- ✅ **Etherscan audit link** — every page links directly to the contract on Etherscan
- ✅ **No backend** — zero server-side code, no database, no API — just the blockchain

---

## Tech Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Smart Contract Language | Solidity | 0.8.24 | Contract logic |
| Contract Development | Hardhat | 2.28.0 | Compile, test, deploy |
| Contract Testing | Mocha + Chai | latest | 22-test suite |
| Contract Helpers | hardhat-toolbox | 5.0.0 | ethers, chai-matchers, coverage |
| Frontend Framework | Next.js | 14.2.35 | App Router, SSR/SSG |
| Blockchain Client | wagmi | v2 | React hooks for Ethereum |
| Low-level EVM | viem | v2 | ABI encoding, RPC calls |
| State Management | TanStack Query | v5 | Async data fetching/caching |
| Wallet Connector | MetaMask | via wagmi | Browser wallet integration |
| Styling | Tailwind CSS | v3 | Utility-first CSS |
| Node Provider | Alchemy | — | Ethereum Sepolia RPC + WebSocket |
| Testnet | Ethereum Sepolia | — | Free ETH, Etherscan support |
| Frontend Hosting | Vercel | — | Auto-deploy from GitHub |
| Contract Hosting | Ethereum Sepolia | — | Decentralized, permanent |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        User's Browser                           │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    Next.js Frontend                      │   │
│  │  (Vercel CDN — votechain-mu.vercel.app)                  │   │
│  │                                                          │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────────────┐ │   │
│  │  │  /         │  │  /admin    │  │  /vote  /results   │ │   │
│  │  │  Home      │  │  Admin     │  │  Vote   Results    │ │   │
│  │  └────────────┘  └────────────┘  └────────────────────┘ │   │
│  │                                                          │   │
│  │  wagmi v2 hooks: useReadContract, useWriteContract,      │   │
│  │  useWatchContractEvent, useAccount, useConnect           │   │
│  └───────────────────────────┬──────────────────────────────┘   │
│                              │                                  │
│  ┌───────────────────────────▼──────────────────────────────┐   │
│  │                  MetaMask Extension                      │   │
│  │  Signs transactions, manages private keys locally        │   │
│  └───────────────────────────┬──────────────────────────────┘   │
└──────────────────────────────┼──────────────────────────────────┘
                               │ JSON-RPC (HTTPS + WebSocket)
                               ▼
                ┌──────────────────────────────┐
                │     Alchemy Node Provider    │
                │   (eth-sepolia.g.alchemy.com)│
                └──────────────┬───────────────┘
                               │
                               ▼
                ┌──────────────────────────────┐
                │    Ethereum Sepolia           │
                │    Testnet                   │
                │                              │
                │  ┌────────────────────────┐  │
                │  │   VoteChain.sol        │  │
                │  │   0x431D66de...4465B0  │  │
                │  │                        │  │
                │  │  - Election state      │  │
                │  │  - Candidate registry  │  │
                │  │  - Voter whitelist     │  │
                │  │  - Vote tallies        │  │
                │  │  - Event log           │  │
                │  └────────────────────────┘  │
                └──────────────────────────────┘
```

---

## Project Structure

```
votechain/
│
├── contracts/                              # Hardhat smart contract project
│   ├── contracts/
│   │   └── VoteChain.sol                   # Main voting smart contract
│   ├── scripts/
│   │   └── deploy.js                       # Deployment script (local + Sepolia)
│   ├── test/
│   │   └── VoteChain.test.js               # 22 comprehensive tests
│   ├── hardhat.config.js                   # Network config, Solidity version
│   ├── package.json
│   └── .env                                # NEVER committed (gitignored)
│                                           # ALCHEMY_SEPOLIA_URL
│                                           # DEPLOYER_PRIVATE_KEY
│                                           # ETHERSCAN_API_KEY
│
└── frontend/                               # Next.js 14 App Router frontend
    ├── src/
    │   ├── app/
    │   │   ├── layout.jsx                  # Root layout, providers, Navbar
    │   │   ├── globals.css                 # Tailwind directives + base styles
    │   │   ├── page.jsx                    # Home — election status, CTAs
    │   │   ├── admin/
    │   │   │   └── page.jsx                # Admin panel — create/manage election
    │   │   ├── vote/
    │   │   │   └── page.jsx                # Voting page — candidates, cast vote
    │   │   └── results/
    │   │       └── page.jsx                # Results — chart, winner, live feed
    │   │
    │   ├── components/
    │   │   ├── Navbar.jsx                  # Sticky nav with active link + wallet
    │   │   ├── WalletConnect.jsx           # Connect/disconnect + network switcher
    │   │   ├── CandidateCard.jsx           # Candidate with vote bar + vote button
    │   │   ├── ResultsChart.jsx            # Horizontal bar chart, live vote counts
    │   │   └── LiveFeed.jsx                # Real-time VoteCast event stream
    │   │
    │   ├── lib/
    │   │   ├── contract.js                 # Contract address + full ABI
    │   │   └── wagmiConfig.js              # Chain config (Sepolia + local Hardhat)
    │   │
    │   └── providers/
    │       └── WagmiProvider.jsx           # WagmiProvider + QueryClientProvider
    │
    ├── public/
    │   └── logo.svg                        # VoteChain SVG logo
    ├── jsconfig.json                       # Path alias (@/ → src/)
    ├── next.config.js                      # Webpack fallbacks, ESM config
    ├── tailwind.config.js                  # Brand colors, font config
    ├── postcss.config.js                   # Tailwind + autoprefixer
    ├── package.json
    └── .env.local                          # NEVER committed (gitignored)
                                            # NEXT_PUBLIC_CONTRACT_ADDRESS
                                            # NEXT_PUBLIC_ALCHEMY_SEPOLIA_URL
```

---

## Smart Contract

### Overview

`VoteChain.sol` is a self-contained, ownerless voting contract. The deployer becomes the permanent admin. All election logic, access control, and vote tallying happen on-chain.

### State Variables

```solidity
address public admin;                           // Deployer address, immutable after deploy
ElectionInfo public election;                   // Current election metadata
Candidate[] public candidates;                  // Dynamic array of candidates
mapping(address => bool) public hasVoted;       // Prevents double voting
mapping(address => bool) public isWhitelisted;  // Voter eligibility
mapping(address => uint256) public votedFor;    // Which candidate each voter chose
uint256 public totalVotes;                      // Running vote count
```

### Structs

```solidity
struct Candidate {
    uint256 id;         // 1-indexed
    string name;        // Candidate full name
    string party;       // Party or platform
    uint256 voteCount;  // Votes received (updates on every castVote)
}

struct ElectionInfo {
    string title;
    string description;
    uint256 startTime;  // Unix timestamp
    uint256 endTime;    // Unix timestamp
    bool exists;
}
```

### Functions

#### Admin Functions

| Function | Parameters | Description |
|---|---|---|
| `createElection` | title, description, startTime, endTime | Creates a new election. Resets candidates and totalVotes. Requires startTime in future. |
| `addCandidate` | name, party | Adds a candidate. Can only be called before election starts. |
| `whitelistVoter` | address | Whitelists a single voter address. |
| `whitelistVotersBatch` | address[] | Whitelists multiple voters in one transaction. Gas efficient. |
| `endElection` | — | Sets endTime to now, immediately closing the election. Admin only. |

#### Voter Functions

| Function | Parameters | Description |
|---|---|---|
| `castVote` | candidateId (uint256) | Casts a vote for a candidate by 1-indexed ID. Requires: active election, whitelisted, not already voted, valid candidateId. |

#### View Functions

| Function | Returns | Description |
|---|---|---|
| `getCandidates` | Candidate[] | Full candidate array with live vote counts. |
| `getCandidate` | Candidate | Single candidate by ID. |
| `getCandidateCount` | uint256 | Number of candidates. |
| `getElectionStatus` | string | `NO_ELECTION` / `PENDING` / `ACTIVE` / `ENDED` |
| `isElectionActive` | bool | True if currently accepting votes. |
| `getWinner` | Candidate | Candidate with most votes. First to reach max in case of tie. |

#### Events

```solidity
event ElectionCreated(string title, uint256 startTime, uint256 endTime);
event CandidateAdded(uint256 indexed candidateId, string name, string party);
event VoterWhitelisted(address indexed voter);
event VoteCast(address indexed voter, uint256 indexed candidateId, uint256 timestamp);
event ElectionEnded(uint256 timestamp);
```

### Security

- All state-changing functions use modifiers (`onlyAdmin`, `electionActive`, `electionNotStarted`)
- `hasVoted` mapping prevents double voting at EVM level — cannot be bypassed by UI
- `isWhitelisted` mapping ensures only authorized voters participate
- Candidate IDs start at 1 — `castVote(0)` always reverts with `invalid candidate ID`
- `delete candidates` on `createElection` resets state for fresh elections

---

## Frontend

### Pages

#### `/` — Home
- Reads `getElectionStatus()`, `election()`, and `totalVotes()` from the contract
- Shows live election status badge (NO_ELECTION / PENDING / ACTIVE / ENDED)
- Displays election title, description, total votes, and status card
- CTAs: Cast Your Vote (only when ACTIVE), View Results, Admin Panel (only when connected)
- Shows truncated contract address linking to Etherscan

#### `/vote` — Vote
- Reads all candidates with live vote counts (refetches every 5 seconds)
- Checks if connected wallet is whitelisted (`isWhitelisted`)
- Checks if connected wallet has voted (`hasVoted`, `votedFor`)
- Renders `CandidateCard` for each candidate with vote percentage bars
- Vote button triggers `castVote()` via MetaMask transaction
- Transaction status: waiting → confirming → confirmed + Etherscan link
- Live feed of incoming `VoteCast` events via WebSocket

#### `/results` — Results
- Live bar chart via `ResultsChart` component — updates in real time
- Winner banner shown after election ends
- Stats: total votes, candidate count, end date
- Live feed during active elections
- Public Etherscan audit link at the bottom

#### `/admin` — Admin Panel
- Access controlled: only the deployer wallet can see the full panel
- Others see an "Access Denied" message with their address vs admin address
- Create Election form with datetime pickers
- Add Candidate form (auto-lists current candidates below)
- Single + batch voter whitelisting
- Danger Zone: End Election button (only shown when ACTIVE)
- All transactions show pending/confirming/confirmed status

### Key Components

**`WalletConnect.jsx`**
Handles connect/disconnect flow, shows truncated address with green/yellow status dot, and shows "Switch to Sepolia" button if connected to wrong network.

**`CandidateCard.jsx`**
Displays candidate avatar (initial letter), name, party, animated vote percentage bar, live vote count, and vote button. Highlights the card if the connected wallet voted for this candidate.

**`ResultsChart.jsx`**
Sorts candidates by vote count, renders horizontal progress bars with percentage and vote count. Shows "Leading" badge on the top candidate.

**`LiveFeed.jsx`**
Uses `useWatchContractEvent` from wagmi to subscribe to `VoteCast` events via WebSocket. Renders each event as a row: shortened voter address → candidate name → time ago → Etherscan link. Keeps last 20 events.

---

## Local Development

### Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **MetaMask** browser extension
- **Git**

### Clone

```bash
git clone https://github.com/MuaazTasawar/votechain.git
cd votechain
```

### Contracts Setup

```bash
cd contracts
npm install
```

Create `contracts/.env`:
```env
ALCHEMY_SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
DEPLOYER_PRIVATE_KEY=your_64_char_hex_private_key
ETHERSCAN_API_KEY=optional_for_verification
```

Compile the contract:
```bash
npx hardhat compile
```

Run the test suite:
```bash
npx hardhat test
```

Expected output:
```
VoteChain
  Deployment
    ✔ should set deployer as admin
    ✔ should start with no election
  createElection
    ✔ admin can create an election
    ✔ non-admin cannot create an election
    ✔ start time must be in the future
    ✔ end time must be after start time
  addCandidate
    ✔ admin can add candidates before election starts
    ✔ candidates get sequential IDs starting from 1
    ✔ cannot add candidate after election starts
  whitelisting
    ✔ admin can whitelist a single voter
    ✔ admin can batch whitelist voters
    ✔ non-admin cannot whitelist voters
  castVote
    ✔ whitelisted voter can cast a vote
    ✔ vote count on candidate increases
    ✔ voter cannot vote twice
    ✔ non-whitelisted voter cannot vote
    ✔ invalid candidate ID is rejected
    ✔ emits VoteCast event
  results
    ✔ getWinner returns candidate with most votes
    ✔ getCandidates returns full array with vote counts
    ✔ election status is ENDED after endTime passes
    ✔ admin can manually end election early

22 passing (4s)
```

### Frontend Setup

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_CONTRACT_ADDRESS=0x431D66de6e87766be6f07DCd30477d1E5B4465B0
NEXT_PUBLIC_ALCHEMY_SEPOLIA_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
```

Start the dev server:
```bash
npm run dev
```

Open **http://localhost:3000**

---

## Deploying the Contract

### To Sepolia Testnet

1. Get free Sepolia ETH from https://cloud.google.com/application/web3/faucet/ethereum/sepolia
2. Get a free Alchemy API key from https://dashboard.alchemy.com (create app on Ethereum Sepolia)
3. Export your MetaMask private key: Account Details → Private Keys → Unlock to reveal
4. Fill `contracts/.env` with your values

```bash
cd contracts
npx hardhat run scripts/deploy.js --network sepolia
```

Output:
```
🗳️  Deploying VoteChain...
Deployer address: 0xYourAddress
Deployer balance: 0.05 ETH
✅ VoteChain deployed to: 0xYourContractAddress
```

5. Copy the contract address into `frontend/.env.local` as `NEXT_PUBLIC_CONTRACT_ADDRESS`

### Verify on Etherscan (Optional but Recommended)

```bash
npx hardhat verify --network sepolia YOUR_CONTRACT_ADDRESS
```

This makes the contract source code publicly readable on Etherscan — a strong trust signal.

---

## Deploying the Frontend

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to https://vercel.com/new
3. Import `MuaazTasawar/votechain`
4. Set **Root Directory** to `frontend`
5. Add environment variables:
   - `NEXT_PUBLIC_CONTRACT_ADDRESS` = your deployed contract address
   - `NEXT_PUBLIC_ALCHEMY_SEPOLIA_URL` = your Alchemy Sepolia URL
6. Click **Deploy**

Every push to `main` triggers an automatic redeployment.

---

## How to Use

### As Admin (Contract Deployer)

1. Open https://votechain-mu.vercel.app
2. Click **Connect Wallet** — connect the wallet that deployed the contract
3. Navigate to **Admin**
4. **Create Election**: fill in title, description, start and end datetime → click Create Election → confirm MetaMask
5. **Add Candidates**: enter name and party for each candidate → Add Candidate → confirm MetaMask
6. **Whitelist Voters**: paste voter wallet addresses (one per line for batch) → confirm MetaMask
7. Election opens automatically at the start time you set

### As Voter

1. Open https://votechain-mu.vercel.app
2. Make sure MetaMask is on **Sepolia** network
3. Click **Connect Wallet**
4. Navigate to **Vote**
5. Check your whitelist status (shown in a banner)
6. Click **Vote** on your chosen candidate
7. Confirm the MetaMask transaction
8. Wait ~15 seconds for on-chain confirmation
9. Your vote appears permanently on Etherscan

### As a Public Observer (No Wallet Needed)

1. Open https://votechain-mu.vercel.app/results
2. View live vote counts and bar charts
3. Click **"Audit all votes on Etherscan"** at the bottom
4. See every single VoteCast transaction, voter address, and timestamp independently

---

## Running Tests

```bash
cd contracts
npx hardhat test                    # run all 22 tests
npx hardhat test --grep "castVote"  # run specific test group
npx hardhat coverage                # generate coverage report
```

Test coverage spans:
- Contract deployment and admin assignment
- Election creation validation (future timestamps, start < end)
- Candidate management and ID sequencing
- Access control (admin-only functions)
- Voter whitelisting (single + batch)
- Vote casting (success path + all failure modes)
- Double-vote prevention
- Event emission verification
- Winner calculation
- Election status transitions
- Manual election termination

---

## Security Considerations

| Concern | Mitigation |
|---|---|
| Double voting | `hasVoted` mapping checked in `castVote` modifier — EVM-level enforcement |
| Unauthorized admin actions | `onlyAdmin` modifier on all state-changing admin functions |
| Voting outside window | `electionActive` modifier checks `block.timestamp` against start/end |
| Adding candidates mid-election | `electionNotStarted` modifier prevents post-start candidate additions |
| Invalid candidate selection | Bounds check on `_candidateId` in `castVote` |
| Private key exposure | `.env` and `.env.local` are gitignored — never committed |
| Reentrancy | No ETH transfers in this contract — not applicable |
| Integer overflow | Solidity 0.8.x has built-in overflow protection |

**Known limitations:**
- Admin wallet compromise would allow arbitrary whitelisting — use a hardware wallet for production
- This contract does not support anonymous voting — voter addresses are publicly visible on-chain (by design, for auditability)
- Currently single-election per contract deployment — a new contract is needed for each independent election

---

## Roadmap

- [ ] **Etherscan contract verification** — make source code readable on-chain
- [ ] **Mobile responsive navbar** — hamburger menu for small screens  
- [ ] **Loading skeletons** — better UX while fetching contract data
- [ ] **Multi-election support** — election history and archiving
- [ ] **Commit-reveal voting** — hide vote choices until election ends (anonymous ballots)
- [ ] **ENS name resolution** — show ENS names instead of raw addresses
- [ ] **Email/SMS voter notification** — notify whitelisted voters when election opens
- [ ] **Mainnet deployment** — production-ready deployment with real ETH
- [ ] **IPFS candidate profiles** — store candidate bio and photo on IPFS

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built with Solidity, Hardhat, Next.js, wagmi, and Tailwind CSS.*
*Deployed on Ethereum Sepolia. Hosted on Vercel.*