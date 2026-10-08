"use client";

import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useTotalTokens } from "@/hooks/useFactory";

export function Navbar() {
  const { data: total } = useTotalTokens();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-violet-900/30 bg-[#0a0a0f]/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center font-black text-white text-sm">
                O
              </div>
              <div className="absolute inset-0 rounded-lg bg-violet-500 blur-sm opacity-0 group-hover:opacity-60 transition-opacity" />
            </div>
            <span className="font-bold text-white text-lg tracking-tight">
              OrbiLaunch
            </span>
            {total !== undefined && (
              <span className="ml-1 text-xs text-violet-400 font-mono">
                [{total.toString()}]
              </span>
            )}
          </Link>

          {/* Nav links */}
          <div className="hidden sm:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Explore
            </Link>
            <Link
              href="/create"
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Launch
            </Link>
          </div>

          {/* Wallet + CTA */}
          <div className="flex items-center gap-3">
            <Link
              href="/create"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Token
            </Link>
            <ConnectButton
              showBalance={false}
              chainStatus="icon"
              accountStatus="avatar"
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
