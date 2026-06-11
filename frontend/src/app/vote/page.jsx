"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { VOTECHAIN_ADDRESS, VOTECHAIN_ABI } from "@/lib/contract";
import CandidateCard from "@/components/CandidateCard";
import LiveFeed from "@/components/LiveFeed";

export default function VotePage() {
  const { address, isConnected } = useAccount();
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

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

  const { data: candidates, refetch: refetchCandidates } = useReadContract({
    address: VOTECHAIN_ADDRESS,
    abi: VOTECHAIN_ABI,
    functionName: "getCandidates",
    query: { refetchInterval: 5000 },
  });

  const { data: hasVoted, refetch: refetchHasVoted } = useReadContract({
    address: VOTECHAIN_ADDRESS,
    abi: VOTECHAIN_ABI,
    functionName: "hasVoted",
    args: [address],
    query: { enabled: !!address, refetchInterval: 5000 },
  });

  const { data: votedForId } = useReadContract({
    address: VOTECHAIN_ADDRESS,
    abi: VOTECHAIN_ABI,
    functionName: "votedFor",
    args: [address],
    query: { enabled: !!address && hasVoted, refetchInterval: 5000 },
  });

  const { data: isWhitelisted } = useReadContract({
    address: VOTECHAIN_ADDRESS,
    abi: VOTECHAIN_ABI,
    functionName: "isWhitelisted",
    args: [address],
    query: { enabled: !!address, refetchInterval: 10000 },
  });

  const { data: totalVotes } = useReadContract({
    address: VOTECHAIN_ADDRESS,
    abi: VOTECHAIN_ABI,
    functionName: "totalVotes",
    query: { refetchInterval: 5000 },
  });

  const handleVote = (candidateId) => {
    writeContract({
      address: VOTECHAIN_ADDRESS,
      abi: VOTECHAIN_ABI,
      functionName: "castVote",
      args: [BigInt(candidateId)],
    });
  };

  const isActive = status === "ACTIVE";
  const totalVotesNum = totalVotes ? Number(totalVotes) : 0;

  if (!isConnected) {
    return (
      <div className="text-center py-20 text-gray-400">
        Connect your wallet to vote.
      </div>
    );
  }

  if (status === "NO_ELECTION") {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400">No election has been created yet.</p>
        <p className="text-gray-600 text-sm mt-2">Check back later or contact the admin.</p>
      </div>
    );
  }

  if (status === "PENDING") {
    return (
      <div className="text-center py-20">
        <div className="text-yellow-400 font-medium mb-2">Election Starting Soon</div>
        <p className="text-gray-400">{election?.title}</p>
        <p className="text-gray-600 text-sm mt-2">
          Starts at {election?.startTime ? new Date(Number(election.startTime) * 1000).toLocaleString() : "—"}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">{election?.title || "Election"}</h1>
          {isActive && (
            <span className="text-xs bg-green-500/10 text-green-400 border border-green-500/20 px-2.5 py-1 rounded-full font-medium flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
              Live
            </span>
          )}
          {status === "ENDED" && (
            <span className="text-xs bg-red-500/10 text-red-400 border border-red-500/20 px-2.5 py-1 rounded-full font-medium">
              Ended
            </span>
          )}
        </div>
        <p className="text-gray-400">{election?.description}</p>
      </div>

      {/* Wallet status */}
      {isActive && !hasVoted && (
        <div className={`mb-6 p-3 rounded-lg text-sm border ${
          isWhitelisted
            ? "bg-green-500/10 text-green-400 border-green-500/20"
            : "bg-red-500/10 text-red-400 border-red-500/20"
        }`}>
          {isWhitelisted
            ? "✓ Your wallet is whitelisted. You may cast one vote."
            : "✗ Your wallet is not whitelisted. Contact the admin to be added."}
        </div>
      )}

      {/* Tx feedback */}
      {(isPending || isConfirming || isSuccess) && (
        <div className={`mb-6 p-3 rounded-lg text-sm border ${
          isSuccess
            ? "bg-green-500/10 text-green-400 border-green-500/20"
            : "bg-brand-500/10 text-brand-400 border-brand-500/20"
        }`}>
          {isPending && "Waiting for wallet confirmation..."}
          {isConfirming && "Vote being recorded on-chain..."}
          {isSuccess && "✓ Your vote has been permanently recorded on the blockchain!"}
          {txHash && (
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 underline opacity-70 hover:opacity-100"
            >
              View on Etherscan ↗
            </a>
          )}
        </div>
      )}

      {/* Candidates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {candidates?.map((candidate) => (
          <CandidateCard
            key={candidate.id.toString()}
            candidate={candidate}
            totalVotes={totalVotesNum}
            onVote={handleVote}
            hasVoted={hasVoted}
            votedForId={votedForId ? Number(votedForId) : null}
            isActive={isActive}
            isPending={isPending || isConfirming}
          />
        ))}
      </div>

      {/* Live Feed */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse inline-block" />
          Live Vote Feed
        </h2>
        <LiveFeed candidates={candidates || []} />
      </div>
    </div>
  );
}