import { formatEther, parseEther } from "viem";

// ─── Format ORB amount ────────────────────────────────────────────────
export function formatOrb(value: bigint, decimals = 4): string {
  const num = parseFloat(formatEther(value));
  if (num === 0) return "0";
  if (num < 0.0001) return "< 0.0001";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
  return num.toFixed(decimals);
}

// ─── Format token amount (18 decimals) ───────────────────────────────
export function formatToken(value: bigint, decimals = 2): string {
  const num = parseFloat(formatEther(value));
  if (num === 0) return "0";
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(2)}B`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(2)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(2)}K`;
  return num.toFixed(decimals);
}

// ─── Format address ───────────────────────────────────────────────────
export function shortAddr(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

// ─── Parse input ke bigint ────────────────────────────────────────────
export function parseOrbInput(value: string): bigint {
  try {
    return parseEther(value || "0");
  } catch {
    return 0n;
  }
}

// ─── Apply slippage tolerance ─────────────────────────────────────────
export function applySlippage(amount: bigint, slippageBps: number): bigint {
  return (amount * BigInt(10_000 - slippageBps)) / 10_000n;
}

// ─── Format progress bps ──────────────────────────────────────────────
export function formatProgress(bps: bigint): number {
  return Math.min(Number(bps) / 100, 100);
}

// ─── Time ago ─────────────────────────────────────────────────────────
export function timeAgo(timestamp: number): string {
  const diff = Date.now() / 1000 - timestamp;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ─── Explorer links ───────────────────────────────────────────────────
export const EXPLORER = "https://explorer.testnet.orbinum.network";

export function explorerTx(hash: string) {
  return `${EXPLORER}/tx/${hash}`;
}

export function explorerAddr(addr: string) {
  return `${EXPLORER}/address/${addr}`;
}

// ─── cn helper (simple className merger) ─────────────────────────────
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
