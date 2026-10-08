"use client";

import Link from "next/link";
import { useTokenMeta, useCurveInfo } from "@/hooks/useFactory";
import { formatOrb, formatProgress, shortAddr, timeAgo } from "@/lib/utils";

interface TokenCardProps {
  address: `0x${string}`;
}

export function TokenCard({ address }: TokenCardProps) {
  const { name, symbol, imageUrl, creator, createdAt, graduated } = useTokenMeta(address);
  const { data: curveInfo } = useCurveInfo(address);

  const progress = curveInfo ? formatProgress(curveInfo[6]) : 0;
  const marketCap = curveInfo ? curveInfo[5] : 0n;
  const spotPrice  = curveInfo ? curveInfo[4] : 0n;

  const isGraduated = graduated.data === true;

  return (
    <Link href={`/token/${address}`}>
      <div className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 hover:border-violet-700/50 hover:bg-zinc-800/60 transition-all duration-200 cursor-pointer">
        {/* Graduated badge */}
        {isGraduated && (
          <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 text-xs font-medium">
            🎓 Graduated
          </div>
        )}

        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          {/* Image */}
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-800 flex-shrink-0">
            {imageUrl.data ? (
              <img
                src={imageUrl.data as string}
                alt={name.data as string}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xl">
                🪙
              </div>
            )}
          </div>

          {/* Name + symbol */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white truncate">
                {name.data ?? "Loading…"}
              </span>
              <span className="text-xs text-zinc-500 font-mono flex-shrink-0">
                {symbol.data ? `$${symbol.data}` : ""}
              </span>
            </div>
            {creator.data && (
              <p className="text-xs text-zinc-500 mt-0.5">
                by {shortAddr(creator.data as string)}{" "}
                {createdAt.data ? `· ${timeAgo(Number(createdAt.data))}` : ""}
              </p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="rounded-lg bg-zinc-800/60 px-3 py-2">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-0.5">Market Cap</p>
            <p className="text-sm font-semibold text-white">
              {formatOrb(marketCap)} ORB
            </p>
          </div>
          <div className="rounded-lg bg-zinc-800/60 px-3 py-2">
            <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-0.5">Price</p>
            <p className="text-sm font-semibold text-white">
              {formatOrb(spotPrice, 8)} ORB
            </p>
          </div>
        </div>

        {/* Graduation progress */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-zinc-500">Graduation Progress</span>
            <span className="text-[10px] text-violet-400 font-mono">{progress.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isGraduated
                  ? "bg-green-500"
                  : progress > 75
                  ? "bg-amber-500"
                  : "bg-violet-500"
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
