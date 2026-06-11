import { createConfig, http } from "wagmi";
import { sepolia, hardhat } from "wagmi/chains";
import { metaMask } from "wagmi/connectors";

export function createWagmiConfig() {
  return createConfig({
    chains: [sepolia, hardhat],
    connectors: [metaMask()],
    transports: {
      [sepolia.id]: http(
        process.env.NEXT_PUBLIC_ALCHEMY_SEPOLIA_URL || ""
      ),
      [hardhat.id]: http("http://127.0.0.1:8545"),
    },
  });
}