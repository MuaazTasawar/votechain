"use client";

import { useReadContract } from "wagmi";
import { VOTECHAIN_ADDRESS, VOTECHAIN_ABI } from "@/lib/contract";
import ResultsChart from "@/components/ResultsChart";
import LiveFeed from "@/components/LiveFeed";

export default function ResultsPage() {
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

  const { data: candidates } = useReadContract({
    address: VOTECHAIN_ADDRESS,
    abi: VOTECHAIN_ABI,
    functionName: "getCandidates",
    query: { refetchInterval: 5000 },
  });

  const { data: totalVotes } = useReadContract({
    address: VOTECHAIN_ADDRESS,
    abi: VOTECHAIN_ABI,
    functionName: "totalVotes",
    query: { refetchInterval: 5000 },
  });

  const { data: winner } = useReadContract({
    address: VOTECHAIN_ADDRESS,
    abi: VOTECHAIN_ABI,
    functionName: "getWinner",
    query: {
      enabled: status === "ENDED" && candidates && candidates.length > 0,
    },
  });

  const totalVotesNum = totalVotes ? Number(totalVotes) : 0;

  if (status === "NO_ELECTION") {
    return (
      <div className="text-center py-20 text-gray-400">
        No election data available yet.
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">{election?.title || "Results"}</h1>
          {status === "ACTIVE" && (
            <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
              Live
            </span>
          )}
          {status === "ENDED" && (
            <span className="text-xs bg-gray-500/10 text-gray-400 border border-gray-500/20 px-2.5 py-1 rounded-full font-medium">
              Final
            </span>
          )}
        </div>
        <p className="text-gray-400 text-sm">{election?.description}</p>
      </div>

      {/* Winner banner — only when election ended */}
      {status === "ENDED" && winner && Number(winner.voteCount) > 0 && (
        <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-5 mb-6 flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center flex-shrink-0">
            <span className="text-brand-400 font-bold text-xl">
              {winner.name.charAt(0)}
            </span>
          </div>
          <div>
            <div className="text-xs text-brand-400 font-medium mb-0.5">Winner</div>
            <div className="text-white font-bold text-xl">{winner.name}</div>
            <div className="text-gray-400 text-sm">
              {winner.party} · {Number(winner.voteCount).toLocaleString()} votes
            </div>
          </div>
          <div className="ml-auto text-4xl">🏆</div>
        </div>
      )}

      {/* Results Chart */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-white mb-5">Vote Distribution</h2>
        <ResultsChart candidates={candidates || []} totalVotes={totalVotesNum} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{totalVotesNum.toLocaleString()}</div>
          <div className="text-gray-400 text-sm mt-1">Total Votes</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">{candidates?.length || 0}</div>
          <div className="text-gray-400 text-sm mt-1">Candidates</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-white">
            {election?.endTime
              ? new Date(Number(election.endTime) * 1000).toLocaleDateString()
              : "—"}
          </div>
          <div className="text-gray-400 text-sm mt-1">End Date</div>
        </div>
      </div>

      {/* Live Feed */}
      {status === "ACTIVE" && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mb-6">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
            Live Vote Feed
          </h2>
          <LiveFeed candidates={candidates || []} />
        </div>
      )}

      {/* Audit link */}
      <div className="text-center">
        <a
          href={`https://sepolia.etherscan.io/address/${VOTECHAIN_ADDRESS}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          Audit all votes on Etherscan ↗
        </a>
      </div>
    </div>
  );
}