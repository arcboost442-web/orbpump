"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { FACTORY_ADDRESS, FACTORY_ABI, TOKEN_ABI, CREATE_FEE } from "@/lib/contracts";
import { parseEther } from "viem";

// ─── Get all tokens (paginated) ───────────────────────────────────────
export function useTokenList(offset = 0, limit = 20) {
  return useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "getTokens",
    args: [BigInt(offset), BigInt(limit)],
  });
}

// ─── Total token count ────────────────────────────────────────────────
export function useTotalTokens() {
  return useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "totalTokens",
  });
}

// ─── Curve info untuk satu token ─────────────────────────────────────
export function useCurveInfo(tokenAddress?: `0x${string}`) {
  return useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "getCurveInfo",
    args: tokenAddress ? [tokenAddress] : undefined,
    query: { enabled: !!tokenAddress },
  });
}

// ─── Quote buy ────────────────────────────────────────────────────────
export function useQuoteBuy(tokenAddress?: `0x${string}`, orbAmount?: bigint) {
  return useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "quoteBuy",
    args: tokenAddress && orbAmount ? [tokenAddress, orbAmount] : undefined,
    query: { enabled: !!tokenAddress && !!orbAmount && orbAmount > 0n },
  });
}

// ─── Quote sell ───────────────────────────────────────────────────────
export function useQuoteSell(tokenAddress?: `0x${string}`, tokenAmount?: bigint) {
  return useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "quoteSell",
    args: tokenAddress && tokenAmount ? [tokenAddress, tokenAmount] : undefined,
    query: { enabled: !!tokenAddress && !!tokenAmount && tokenAmount > 0n },
  });
}

// ─── Token metadata ───────────────────────────────────────────────────
export function useTokenMeta(tokenAddress?: `0x${string}`) {
  const name = useReadContract({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: "name",
    query: { enabled: !!tokenAddress },
  });
  const symbol = useReadContract({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: "symbol",
    query: { enabled: !!tokenAddress },
  });
  const description = useReadContract({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: "description",
    query: { enabled: !!tokenAddress },
  });
  const imageUrl = useReadContract({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: "imageUrl",
    query: { enabled: !!tokenAddress },
  });
  const creator = useReadContract({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: "creator",
    query: { enabled: !!tokenAddress },
  });
  const createdAt = useReadContract({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: "createdAt",
    query: { enabled: !!tokenAddress },
  });
  const graduated = useReadContract({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: "graduated",
    query: { enabled: !!tokenAddress },
  });

  return { name, symbol, description, imageUrl, creator, createdAt, graduated };
}

// ─── Token balance ────────────────────────────────────────────────────
export function useTokenBalance(tokenAddress?: `0x${string}`, account?: `0x${string}`) {
  return useReadContract({
    address: tokenAddress,
    abi: TOKEN_ABI,
    functionName: "balanceOf",
    args: account ? [account] : undefined,
    query: { enabled: !!tokenAddress && !!account },
  });
}

// ─── Create Token ─────────────────────────────────────────────────────
export function useCreateToken() {
  const { writeContractAsync, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess, data: receipt } = useWaitForTransactionReceipt({ hash });

  async function createToken(params: {
    name: string;
    symbol: string;
    description: string;
    imageUrl: string;
  }) {
    return writeContractAsync({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: "createToken",
      args: [params.name, params.symbol, params.description, params.imageUrl],
      value: CREATE_FEE,
    });
  }

  return { createToken, isPending, isConfirming, isSuccess, hash, receipt };
}

// ─── Buy ──────────────────────────────────────────────────────────────
export function useBuy() {
  const { writeContractAsync, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  async function buy(tokenAddress: `0x${string}`, orbAmount: bigint, minTokenOut: bigint) {
    return writeContractAsync({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: "buy",
      args: [tokenAddress, minTokenOut],
      value: orbAmount,
    });
  }

  return { buy, isPending, isConfirming, isSuccess, hash };
}

// ─── Sell ─────────────────────────────────────────────────────────────
export function useSell() {
  const { writeContractAsync, isPending, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  async function sell(tokenAddress: `0x${string}`, tokenAmount: bigint, minOrbOut: bigint) {
    return writeContractAsync({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: "sell",
      args: [tokenAddress, tokenAmount, minOrbOut],
    });
  }

  return { sell, isPending, isConfirming, isSuccess, hash };
}
