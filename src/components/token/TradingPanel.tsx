"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { parseEther, formatEther } from "viem";
import { useBuy, useSell, useQuoteBuy, useQuoteSell, useTokenBalance } from "@/hooks/useFactory";
import { applySlippage, formatOrb, formatToken, parseOrbInput } from "@/lib/utils";

const SLIPPAGE_BPS = 100; // 1% slippage default

interface TradingPanelProps {
  tokenAddress: `0x${string}`;
  isGraduated: boolean;
  onSuccess?: () => void;
}

type Tab = "buy" | "sell";

export function TradingPanel({ tokenAddress, isGraduated, onSuccess }: TradingPanelProps) {
  const { address: account, isConnected } = useAccount();
  const [tab, setTab] = useState<Tab>("buy");
  const [inputValue, setInputValue] = useState("");
  const [error, setError] = useState("");
  const [txHash, setTxHash] = useState<string>("");

  const { buy, isPending: isBuying, isConfirming: isConfirmingBuy, isSuccess: buySuccess } = useBuy();
  const { sell, isPending: isSelling, isConfirming: isConfirmingSell, isSuccess: sellSuccess } = useSell();
  const { data: tokenBalance } = useTokenBalance(tokenAddress, account);

  // Quote calculation
  const parsedInput = parseOrbInput(inputValue);
  const { data: buyQuote }  = useQuoteBuy(tab === "buy" ? tokenAddress : undefined, tab === "buy" ? parsedInput : undefined);
  const { data: sellQuote } = useQuoteSell(tab === "sell" ? tokenAddress : undefined, tab === "sell" ? parsedInput : undefined);

  useEffect(() => {
    if (buySuccess || sellSuccess) {
      setInputValue("");
      setError("");
      onSuccess?.();
    }
  }, [buySuccess, sellSuccess, onSuccess]);

  const isPending   = isBuying || isSelling;
  const isConfirming = isConfirmingBuy || isConfirmingSell;

  async function handleSubmit() {
    setError("");
    if (!account) return setError("Hubungkan wallet dulu");
    if (!inputValue || parsedInput === 0n) return setError("Masukkan jumlah");

    try {
      if (tab === "buy") {
        const minOut = buyQuote ? applySlippage(buyQuote[0], SLIPPAGE_BPS) : 0n;
        const hash = await buy(tokenAddress, parsedInput, minOut);
        setTxHash(hash);
      } else {
        const minOut = sellQuote ? applySlippage(sellQuote[0], SLIPPAGE_BPS) : 0n;
        const hash = await sell(tokenAddress, parsedInput, minOut);
        setTxHash(hash);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Transaksi gagal";
      if (msg.includes("User rejected")) {
        setError("Transaksi dibatalkan");
      } else if (msg.includes("AntiSniperLimit")) {
        setError("Anti-sniper aktif: kurangi jumlah pembelian");
      } else if (msg.includes("SlippageExceeded")) {
        setError("Slippage terlalu tinggi, coba lagi");
      } else if (msg.includes("InsufficientBalance")) {
        setError("Saldo tidak cukup");
      } else {
        setError("Transaksi gagal: " + msg.slice(0, 80));
      }
    }
  }

  const quickBuyAmounts = ["0.1", "0.5", "1", "5"];

  if (isGraduated) {
    return (
      <div className="rounded-xl border border-green-700/40 bg-green-900/10 p-6 text-center">
        <div className="text-3xl mb-2">🎓</div>
        <p className="text-green-400 font-semibold mb-1">Token Sudah Graduated</p>
        <p className="text-sm text-zinc-400">
          Token ini sudah pindah ke DEX. Trading tersedia di sana.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden">
      {/* Tab switch */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => { setTab("buy"); setInputValue(""); setError(""); }}
          className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
            tab === "buy"
              ? "bg-green-500/10 text-green-400 border-b-2 border-green-500"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Buy
        </button>
        <button
          onClick={() => { setTab("sell"); setInputValue(""); setError(""); }}
          className={`flex-1 py-3.5 text-sm font-semibold transition-colors ${
            tab === "sell"
              ? "bg-red-500/10 text-red-400 border-b-2 border-red-500"
              : "text-zinc-500 hover:text-zinc-300"
          }`}
        >
          Sell
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Balance info */}
        {account && tokenBalance !== undefined && tab === "sell" && (
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <span>Balance</span>
            <button
              className="text-violet-400 hover:text-violet-300"
              onClick={() => setInputValue(formatEther(tokenBalance as bigint))}
            >
              {formatToken(tokenBalance as bigint)} (Max)
            </button>
          </div>
        )}

        {/* Quick amounts (only for buy) */}
        {tab === "buy" && (
          <div className="flex gap-2">
            {quickBuyAmounts.map((amt) => (
              <button
                key={amt}
                onClick={() => setInputValue(amt)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  inputValue === amt
                    ? "border-violet-500 bg-violet-500/20 text-violet-300"
                    : "border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                }`}
              >
                {amt} ORB
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="relative">
          <input
            type="number"
            placeholder={tab === "buy" ? "Jumlah ORB" : "Jumlah Token"}
            value={inputValue}
            onChange={(e) => { setInputValue(e.target.value); setError(""); }}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 pr-16"
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-zinc-500 font-mono">
            {tab === "buy" ? "ORB" : "TOKEN"}
          </span>
        </div>

        {/* Quote preview */}
        {parsedInput > 0n && (
          <div className="rounded-lg bg-zinc-800/50 p-3 space-y-1.5">
            {tab === "buy" && buyQuote && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">Token didapat</span>
                  <span className="text-white font-mono">{formatToken(buyQuote[0])}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Platform fee (1%)</span>
                  <span className="text-zinc-400 font-mono">{formatOrb(buyQuote[1])} ORB</span>
                </div>
              </>
            )}
            {tab === "sell" && sellQuote && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-400">ORB didapat</span>
                  <span className="text-white font-mono">{formatOrb(sellQuote[0])}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-500">Platform fee (1%)</span>
                  <span className="text-zinc-400 font-mono">{formatOrb(sellQuote[1])} ORB</span>
                </div>
              </>
            )}
            <div className="flex justify-between text-xs text-zinc-500 border-t border-zinc-700 pt-1.5">
              <span>Slippage tolerance</span>
              <span>1%</span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <p className="text-sm text-red-400 rounded-lg bg-red-900/20 px-3 py-2 border border-red-800/40">
            {error}
          </p>
        )}

        {/* Submit button */}
        {!isConnected ? (
          <p className="text-center text-sm text-zinc-400 py-2">
            Hubungkan wallet untuk trading
          </p>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isPending || isConfirming || !inputValue}
            className={`w-full py-3.5 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              tab === "buy"
                ? "bg-green-600 hover:bg-green-500 text-white"
                : "bg-red-600 hover:bg-red-500 text-white"
            }`}
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner /> Menunggu konfirmasi wallet…
              </span>
            ) : isConfirming ? (
              <span className="flex items-center justify-center gap-2">
                <Spinner /> Memproses transaksi…
              </span>
            ) : tab === "buy" ? (
              `Buy ${inputValue ? inputValue + " ORB worth" : ""}`
            ) : (
              `Sell ${inputValue ? formatToken(parsedInput) + " tokens" : ""}`
            )}
          </button>
        )}

        {/* Success tx link */}
        {txHash && (buySuccess || sellSuccess) && (
          <a
            href={`https://explorer.testnet.orbinum.network/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-xs text-violet-400 hover:text-violet-300 transition-colors"
          >
            ✓ Transaksi berhasil — lihat di explorer ↗
          </a>
        )}
      </div>
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
