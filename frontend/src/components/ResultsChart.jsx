"use client";

export default function ResultsChart({ candidates, totalVotes }) {
  if (!candidates || candidates.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">No candidates yet.</div>
    );
  }

  const sorted = [...candidates].sort(
    (a, b) => Number(b.voteCount) - Number(a.voteCount)
  );

  const maxVotes = Number(sorted[0]?.voteCount) || 1;

  const colors = [
    "bg-brand-500",
    "bg-purple-500",
    "bg-emerald-500",
    "bg-orange-500",
    "bg-pink-500",
  ];

  return (
    <div className="space-y-4">
      {sorted.map((candidate, index) => {
        const votes = Number(candidate.voteCount);
        const percentage =
          totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
        const barWidth = maxVotes > 0 ? Math.round((votes / maxVotes) * 100) : 0;
        const isLeading = index === 0 && votes > 0;

        return (
          <div key={candidate.id.toString()} className="group">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-gray-300 font-medium">{candidate.name}</span>
                <span className="text-gray-500 text-sm">{candidate.party}</span>
                {isLeading && (
                  <span className="text-xs bg-brand-500/20 text-brand-400 border border-brand-500/30 px-1.5 py-0.5 rounded-full">
                    Leading
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-sm font-mono">{percentage}%</span>
                <span className="text-white font-semibold tabular-nums w-16 text-right">
                  {votes.toLocaleString()} votes
                </span>
              </div>
            </div>
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full ${colors[index % colors.length]} rounded-full transition-all duration-700`}
                style={{ width: `${barWidth}%` }}
              />
            </div>
          </div>
        );
      })}

      <div className="pt-2 border-t border-gray-800 flex justify-between text-sm text-gray-500">
        <span>Total votes cast</span>
        <span className="font-mono text-gray-400">{totalVotes.toLocaleString()}</span>
      </div>
    </div>
  );
}