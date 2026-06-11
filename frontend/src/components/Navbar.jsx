"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import WalletConnect from "./WalletConnect";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/vote", label: "Vote" },
  { href: "/results", label: "Results" },
  { href: "/admin", label: "Admin" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-gray-800 bg-gray-950 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo + Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8">
            <img src="/logo.svg" alt="VoteChain" className="w-full h-full" />
          </div>
          <span className="font-bold text-lg tracking-tight">
            Vote<span className="text-brand-500">Chain</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-brand-500/10 text-brand-400"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Wallet */}
        <WalletConnect />
      </div>
    </nav>
  );
}