"use client";

import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { sepolia } from "wagmi/chains";

export default function WalletConnect() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();

  const isWrongNetwork = isConnected && chainId !== sepolia.id;

  const shortAddress = address
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : "";

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        {isWrongNetwork && (
          <button
            onClick={() => switchChain({ chainId: sepolia.id })}
            className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-3 py-1.5 rounded-md hover:bg-yellow-500/20 transition-colors"
          >
            Switch to Sepolia
          </button>
        )}
        <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-md px-3 py-1.5">
          <div className={`w-2 h-2 rounded-full ${isWrongNetwork ? "bg-yellow-400" : "bg-green-400"}`} />
          <span className="text-sm font-mono text-gray-300">{shortAddress}</span>
        </div>
        <button
          onClick={() => disconnect()}
          className="text-xs text-gray-500 hover:text-gray-300 transition-colors px-2 py-1.5"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      disabled={isPending}
      className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
    >
      {isPending ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}