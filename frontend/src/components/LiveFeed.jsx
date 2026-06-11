"use client";

import { useState } from "react";
import { useWatchContractEvent } from "wagmi";
import { VOTECHAIN_ADDRESS, VOTECHAIN_ABI } from "@/lib/contract";

function timeAgo(timestamp) {
  const diff = Math.max(
    0,
    Math.floor(Date.now() / 1000) - Number(timestamp)
  );

  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

function shortAddress(addr) {
  if (!addr) return "Unknown";
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export default function LiveFeed({ candidates = [] }) {
  const [events, setEvents] = useState([]);

  useWatchContractEvent({
    address: VOTECHAIN_ADDRESS,
    abi: VOTECHAIN_ABI,
    eventName: "VoteCast",
    onLogs(logs) {
      const newEvents = logs.map((log) => {
        const candidateId = Number(log.args.candidateId);

        const candidate = candidates.find(
          (c) => Number(c.id) === candidateId
        );

        return {
          id: `${log.transactionHash}-${log.logIndex}`,
          voter: log.args.voter,
          candidateName: candidate?.name || `Candidate #${candidateId}`,
          timestamp: log.args.timestamp,
          txHash: log.transactionHash,
        };
      });

      setEvents((prev) => {
        const merged = [...newEvents, ...prev];

        const unique = merged.filter(
          (event, index, arr) =>
            index === arr.findIndex((e) => e.id === event.id)
        );

        return unique.slice(0, 20);
      });
    },
  });

  if (events.length === 0) {
    return (
      <div className="text-center text-gray-600 py-6 text-sm">
        Waiting for votes... Live events will appear here.
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-72 overflow-y-auto">
      {events.map((event) => (
        <div
          key={event.id}
          className="flex items-center justify-between bg-gray-900 border border-gray-800 rounded-lg px-4 py-2.5 text-sm animate-pulse-once"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />

            <span className="font-mono text-gray-400">
              {shortAddress(event.voter)}
            </span>

            <span className="text-gray-600">voted for</span>

            <span className="text-white font-medium truncate">
              {event.candidateName}
            </span>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-gray-600 text-xs">
              {timeAgo(event.timestamp)}
            </span>

            <a
              href={`https://sepolia.etherscan.io/tx/${event.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-400 hover:text-brand-300 text-xs transition-colors"
            >
              Etherscan ↗
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}