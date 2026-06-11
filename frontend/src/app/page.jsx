"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { useReadContract } from "wagmi";
import { VOTECHAIN_ADDRESS, VOTECHAIN_ABI } from "@/lib/contract";

export default function Home() {
  const { isConnected } = useAccount();

  const { data: status } = useReadContract({
    address: VOTECHAIN_ADDRESS,
    abi: VOTECHAIN_ABI,
    functionName: "getElectionStatus",
    query: { refetchInterval: 5000 },
  });

  const { data: election } = useReadContract({
    address: VOTECHAIN_ADDRESS,
    abi: VOTECHAIN_ABI,
    functionName: "election",
    query: { refetchInterval: 5000 },
  });

  const { data: totalVotes } = useReadContract({
    address: VOTECHAIN_ADDRESS,
    abi: VOTECHAIN_ABI,
    functionName: "totalVotes",
    query: { refetchInterval: 5000 },
  });

  const statusColors = {
    NO_ELECTION: "bg-gray-500/10 text-gray-400 border-gray-500/20",
    PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    ACTIVE: "bg-green-500/10 text-green-400 border-green-500/20",
    ENDED: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const statusLabel = {
    NO_ELECTION: "No Election",
    PENDING: "Starting Soon",
    ACTIVE: "Live Now",
    ENDED: "Ended",
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      {/* Badge */}
      <div className="mb-6 inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm px-4 py-1.5 rounded-full">
        <div className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" />
        On-Chain · Ethereum Sepolia
      </div>

      {/* Heading */}
      <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
        University Elections,{" "}
        <span className="text-brand-500">On-Chain</span>
      </h1>
      <p className="text-gray-400 text-lg max-w-xl mb-10">
        Every ballot is a permanent blockchain transaction. Publicly auditable,
        tamper-proof, and verifiable by anyone — no middleman required.
      </p>

      {/* Election Status Card */}
      {election?.exists && (
        <div className="w-full max-w-md bg-gray-900 border border-gray-800 rounded-xl p-5 mb-8 text-left">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="font-semibold text-white text-lg">{election.title}</h2>
              <p className="text-gray-400 text-sm mt-0.5">{election.description}</p>
            </div>
            {status && (
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full border flex-shrink-0 ml-3 ${statusColors[status] || statusColors.NO_ELECTION}`}
              >
                {statusLabel[status] || status}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-gray-400 text-xs mb-1">Total Votes</div>
              <div className="text-white font-bold text-xl">
                {totalVotes !== undefined ? Number(totalVotes).toLocaleString() : "—"}
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg p-3">
              <div className="text-gray-400 text-xs mb-1">Status</div>
              <div className="text-white font-bold text-xl">
                {statusLabel[status] || "—"}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-3">
        {status === "ACTIVE" && (
          <Link
            href="/vote"
            className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Cast Your Vote →
          </Link>
        )}
        <Link
          href="/results"
          className="bg-gray-800 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
        >
          View Results
        </Link>
        {isConnected && (
          <Link
            href="/admin"
            className="border border-gray-700 hover:border-gray-600 text-gray-300 font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Admin Panel
          </Link>
        )}
      </div>

      {/* Audit note */}
      <p className="mt-12 text-gray-600 text-sm">
        Contract:{" "}
        <a
          href={`https://sepolia.etherscan.io/address/${VOTECHAIN_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono hover:text-gray-400 transition-colors"
        >
          {VOTECHAIN_ADDRESS
            ? `${VOTECHAIN_ADDRESS.slice(0, 10)}...${VOTECHAIN_ADDRESS.slice(-8)}`
            : "Not deployed yet"}
        </a>
      </p>
    </div>
  );
}