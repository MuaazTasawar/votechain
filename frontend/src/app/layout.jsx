import "./globals.css";
import { Inter } from "next/font/google";
import WagmiProvider from "@/providers/WagmiProvider";
import Navbar from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "VoteChain — On-Chain University Elections",
  description:
    "Tamper-proof, publicly auditable voting for university elections. Every ballot is a blockchain transaction.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-950 text-white min-h-screen`}>
        <WagmiProvider>
          <Navbar />
          <main className="max-w-6xl mx-auto px-4 py-8">{children}</main>
        </WagmiProvider>
      </body>
    </html>
  );
}