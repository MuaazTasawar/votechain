"use client";

import { useState } from "react";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { VOTECHAIN_ADDRESS, VOTECHAIN_ABI } from "@/lib/contract";

function Section({ title, children }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-4">
      <h2 className="font-semibold text-white mb-4 text-lg">{title}</h2>
      {children}
    </div>
  );
}

function Input({ label, ...props }) {
  return (
    <div className="mb-3">
      {label && (
        <label className="block text-gray-400 text-sm mb-1">
          {label}
        </label>
      )}
      <input
        {...props}
        className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-brand-500 transition-colors"
      />
    </div>
  );
}

export default function AdminPage() {
  const { address, isConnected } = useAccount();
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({ hash: txHash });

  const [electionForm, setElectionForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
  });

  const [candidateForm, setCandidateForm] = useState({
    name: "",
    party: "",
  });

  const [voterAddress, setVoterAddress] = useState("");
  const [batchAddresses, setBatchAddresses] = useState("");

  const { data: adminAddress } = useReadContract({
    address: VOTECHAIN_ADDRESS,
    abi: VOTECHAIN_ABI,
    functionName: "admin",
  });

  const { data: status } = useReadContract({
    address: VOTECHAIN_ADDRESS,
    abi: VOTECHAIN_ABI,
    functionName: "getElectionStatus",
    query: { refetchInterval: 5000 },
  });

  const { data: candidates } = useReadContract({
    address: VOTECHAIN_ADDRESS,
    abi: VOTECHAIN_ABI,
    functionName: "getCandidates",
    query: { refetchInterval: 5000 },
  });

  const isAdmin =
    adminAddress &&
    address &&
    adminAddress.toLowerCase() === address.toLowerCase();

  const toUnix = (dateStr) =>
    Math.floor(new Date(dateStr).getTime() / 1000);

  const handleCreateElection = () => {
    writeContract({
      address: VOTECHAIN_ADDRESS,
      abi: VOTECHAIN_ABI,
      functionName: "createElection",
      args: [
        electionForm.title,
        electionForm.description,
        BigInt(toUnix(electionForm.startDate)),
        BigInt(toUnix(electionForm.endDate)),
      ],
    });
  };

  const handleAddCandidate = () => {
    writeContract({
      address: VOTECHAIN_ADDRESS,
      abi: VOTECHAIN_ABI,
      functionName: "addCandidate",
      args: [candidateForm.name, candidateForm.party],
    });
  };

  const handleWhitelistSingle = () => {
    writeContract({
      address: VOTECHAIN_ADDRESS,
      abi: VOTECHAIN_ABI,
      functionName: "whitelistVoter",
      args: [voterAddress],
    });
  };

  const handleWhitelistBatch = () => {
    const addresses = batchAddresses
      .split("\n")
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    writeContract({
      address: VOTECHAIN_ADDRESS,
      abi: VOTECHAIN_ABI,
      functionName: "whitelistVotersBatch",
      args: [addresses],
    });
  };

  const handleEndElection = () => {
    writeContract({
      address: VOTECHAIN_ADDRESS,
      abi: VOTECHAIN_ABI,
      functionName: "endElection",
      args: [],
    });
  };

  if (!isConnected) {
    return (
      <div className="text-center py-20 text-gray-400">
        Connect your wallet to access the admin panel.
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="text-center py-20">
        <div className="text-red-400 font-medium mb-2">
          Access Denied
        </div>
        <p className="text-gray-500 text-sm">
          Only the contract admin can access this panel.
        </p>
        <p className="text-gray-600 text-xs font-mono mt-2">
          Admin: {adminAddress}
        </p>
        <p className="text-gray-600 text-xs font-mono">
          You: {address}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Status:</span>
          <span className="text-xs font-medium text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded-full">
            {status || "Loading..."}
          </span>
        </div>
      </div>

      {/* Transaction Feedback */}
      {(isPending || isConfirming || isSuccess) && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm border ${
            isSuccess
              ? "bg-green-500/10 text-green-400 border-green-500/20"
              : "bg-brand-500/10 text-brand-400 border-brand-500/20"
          }`}
        >
          {isPending && "Waiting for wallet confirmation..."}
          {isConfirming && "Transaction confirming on-chain..."}
          {isSuccess && "✓ Transaction confirmed!"}

          {txHash && (
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 underline opacity-70 hover:opacity-100"
            >
              View on Etherscan
            </a>
          )}
        </div>
      )}

      {/* Create Election */}
      <Section title="Create Election">
        <Input
          label="Title"
          value={electionForm.title}
          onChange={(e) =>
            setElectionForm({ ...electionForm, title: e.target.value })
          }
        />
        <Input
          label="Description"
          value={electionForm.description}
          onChange={(e) =>
            setElectionForm({
              ...electionForm,
              description: e.target.value,
            })
          }
        />
        <Input
          label="Start Date"
          type="datetime-local"
          value={electionForm.startDate}
          onChange={(e) =>
            setElectionForm({
              ...electionForm,
              startDate: e.target.value,
            })
          }
        />
        <Input
          label="End Date"
          type="datetime-local"
          value={electionForm.endDate}
          onChange={(e) =>
            setElectionForm({
              ...electionForm,
              endDate: e.target.value,
            })
          }
        />
        <button
          onClick={handleCreateElection}
          className="bg-brand-500 px-4 py-2 rounded-lg text-white text-sm mt-2"
        >
          Create Election
        </button>
      </Section>

      {/* Add Candidate */}
      <Section title="Add Candidate">
        <Input
          label="Name"
          value={candidateForm.name}
          onChange={(e) =>
            setCandidateForm({
              ...candidateForm,
              name: e.target.value,
            })
          }
        />
        <Input
          label="Party"
          value={candidateForm.party}
          onChange={(e) =>
            setCandidateForm({
              ...candidateForm,
              party: e.target.value,
            })
          }
        />
        <button
          onClick={handleAddCandidate}
          className="bg-brand-500 px-4 py-2 rounded-lg text-white text-sm mt-2"
        >
          Add Candidate
        </button>
      </Section>

      {/* Whitelist */}
      <Section title="Whitelist Voter">
        <Input
          label="Wallet Address"
          value={voterAddress}
          onChange={(e) => setVoterAddress(e.target.value)}
        />
        <button
          onClick={handleWhitelistSingle}
          className="bg-brand-500 px-4 py-2 rounded-lg text-white text-sm"
        >
          Add Voter
        </button>

        <textarea
          placeholder="Batch addresses (one per line)"
          value={batchAddresses}
          onChange={(e) => setBatchAddresses(e.target.value)}
          className="w-full mt-4 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white"
        />

        <button
          onClick={handleWhitelistBatch}
          className="bg-gray-700 px-4 py-2 rounded-lg text-white text-sm mt-2"
        >
          Batch Add
        </button>
      </Section>

      {/* End Election */}
      <Section title="Danger Zone">
        <button
          onClick={handleEndElection}
          className="bg-red-600 px-4 py-2 rounded-lg text-white text-sm"
        >
          End Election
        </button>
      </Section>
    </div>
  );
}