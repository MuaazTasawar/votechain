"use client";

export default function CandidateCard({
  candidate,
  totalVotes,
  onVote,
  hasVoted,
  votedForId,
  isActive,
  isPending,
}) {
  const isVotedFor = votedForId === Number(candidate.id);
  const percentage =
    totalVotes > 0
      ? Math.round((Number(candidate.voteCount) / totalVotes) * 100)
      : 0;

  return (
    <div
      className={`relative bg-gray-900 border rounded-xl p-5 transition-all ${
        isVotedFor
          ? "border-brand-500 shadow-lg shadow-brand-500/10"
          : "border-gray-800 hover:border-gray-700"
      }`}
    >
      {isVotedFor && (
        <div className="absolute top-3 right-3 bg-brand-500/20 text-brand-400 text-xs font-medium px-2 py-0.5 rounded-full border border-brand-500/30">
          Your Vote
        </div>
      )}

      {/* Candidate Info */}
      <div className="mb-4">
        <div className="w-12 h-12 rounded-full bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-3">
          <span className="text-brand-400 font-bold text-lg">
            {candidate.name.charAt(0)}
          </span>
        </div>
        <h3 className="font-semibold text-white text-lg">{candidate.name}</h3>
        <p className="text-gray-400 text-sm mt-0.5">{candidate.party}</p>
      </div>

      {/* Vote Count + Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-gray-400 text-sm">
            {Number(candidate.voteCount)} vote{Number(candidate.voteCount) !== 1 ? "s" : ""}
          </span>
          <span className="text-gray-400 text-sm font-mono">{percentage}%</span>
        </div>
        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 rounded-full transition-all duration-700"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Vote Button */}
      {isActive && !hasVoted && (
        <button
          onClick={() => onVote(Number(candidate.id))}
          disabled={isPending}
          className="w-full bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2 rounded-lg text-sm transition-colors"
        >
          {isPending ? "Confirming..." : "Vote"}
        </button>
      )}

      {isActive && hasVoted && !isVotedFor && (
        <div className="w-full text-center text-gray-600 text-sm py-2">
          Vote cast
        </div>
      )}
    </div>
  );
}