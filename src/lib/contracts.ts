// ─── Contract Address ─────────────────────────────────────────────────
// Ganti setelah deploy
export const FACTORY_ADDRESS = (
  process.env.NEXT_PUBLIC_FACTORY_ADDRESS ?? "0x0000000000000000000000000000000000000000"
) as `0x${string}`;

// ─── Constants ────────────────────────────────────────────────────────
export const TOTAL_SUPPLY     = BigInt("1000000000000000000000000000"); // 1B ether
export const GRADUATION_MCAP  = BigInt("100000000000000000000000");    // 100k ORB
export const CREATE_FEE       = BigInt("10000000000000000");            // 0.01 ORB

// ─── Factory ABI ──────────────────────────────────────────────────────
export const FACTORY_ABI = [
  // Write
  {
    name: "createToken",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "_name",        type: "string" },
      { name: "_symbol",      type: "string" },
      { name: "_description", type: "string" },
      { name: "_imageUrl",    type: "string" },
    ],
    outputs: [{ name: "tokenAddr", type: "address" }],
  },
  {
    name: "buy",
    type: "function",
    stateMutability: "payable",
    inputs: [
      { name: "token",       type: "address" },
      { name: "minTokenOut", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "sell",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "token",     type: "address" },
      { name: "tokenIn",   type: "uint256" },
      { name: "minOrbOut", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "graduate",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [{ name: "token", type: "address" }],
    outputs: [],
  },

  // Read
  {
    name: "getCurrentPrice",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "token", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "getMarketCap",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "token", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "getGraduationProgress",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "token", type: "address" }],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "quoteBuy",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "token",     type: "address" },
      { name: "orbAmount", type: "uint256" },
    ],
    outputs: [
      { name: "tokenOut", type: "uint256" },
      { name: "fee",      type: "uint256" },
    ],
  },
  {
    name: "quoteSell",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "token",       type: "address" },
      { name: "tokenAmount", type: "uint256" },
    ],
    outputs: [
      { name: "orbOut", type: "uint256" },
      { name: "fee",    type: "uint256" },
    ],
  },
  {
    name: "getCurveInfo",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "token", type: "address" }],
    outputs: [
      { name: "virtualOrbReserve",    type: "uint256" },
      { name: "virtualTokenReserve",  type: "uint256" },
      { name: "realOrbCollected",     type: "uint256" },
      { name: "realTokenSold",        type: "uint256" },
      { name: "spotPrice",            type: "uint256" },
      { name: "marketCap",            type: "uint256" },
      { name: "graduationProgressBps",type: "uint256" },
    ],
  },
  {
    name: "totalTokens",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },
  {
    name: "getTokens",
    type: "function",
    stateMutability: "view",
    inputs: [
      { name: "offset", type: "uint256" },
      { name: "limit",  type: "uint256" },
    ],
    outputs: [{ name: "result", type: "address[]" }],
  },
  {
    name: "isRegistered",
    type: "function",
    stateMutability: "view",
    inputs: [{ name: "", type: "address" }],
    outputs: [{ type: "bool" }],
  },
  {
    name: "platformFeeBps",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ type: "uint256" }],
  },

  // Events
  {
    name: "TokenCreated",
    type: "event",
    inputs: [
      { name: "token",       type: "address", indexed: true },
      { name: "creator",     type: "address", indexed: true },
      { name: "name",        type: "string",  indexed: false },
      { name: "symbol",      type: "string",  indexed: false },
      { name: "description", type: "string",  indexed: false },
      { name: "imageUrl",    type: "string",  indexed: false },
      { name: "timestamp",   type: "uint256", indexed: false },
    ],
  },
  {
    name: "TokenBought",
    type: "event",
    inputs: [
      { name: "token",      type: "address", indexed: true },
      { name: "buyer",      type: "address", indexed: true },
      { name: "orbIn",      type: "uint256", indexed: false },
      { name: "tokenOut",   type: "uint256", indexed: false },
      { name: "newPrice",   type: "uint256", indexed: false },
      { name: "newMarketCap", type: "uint256", indexed: false },
    ],
  },
  {
    name: "TokenSold",
    type: "event",
    inputs: [
      { name: "token",      type: "address", indexed: true },
      { name: "seller",     type: "address", indexed: true },
      { name: "tokenIn",    type: "uint256", indexed: false },
      { name: "orbOut",     type: "uint256", indexed: false },
      { name: "newPrice",   type: "uint256", indexed: false },
      { name: "newMarketCap", type: "uint256", indexed: false },
    ],
  },
  {
    name: "TokenGraduated",
    type: "event",
    inputs: [
      { name: "token",        type: "address", indexed: true },
      { name: "orbCollected", type: "uint256", indexed: false },
      { name: "timestamp",    type: "uint256", indexed: false },
    ],
  },
] as const;

// ─── MemeToken ABI (simplified) ──────────────────────────────────────
export const TOKEN_ABI = [
  { name: "name",        type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "symbol",      type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "decimals",    type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint8" }] },
  { name: "totalSupply", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { name: "balanceOf",   type: "function", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
  { name: "allowance",   type: "function", stateMutability: "view", inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], outputs: [{ type: "uint256" }] },
  { name: "approve",     type: "function", stateMutability: "nonpayable", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ type: "bool" }] },
  { name: "transfer",    type: "function", stateMutability: "nonpayable", inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ type: "bool" }] },
  { name: "description", type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "imageUrl",    type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "string" }] },
  { name: "creator",     type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "address" }] },
  { name: "createdAt",   type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { name: "graduated",   type: "function", stateMutability: "view", inputs: [], outputs: [{ type: "bool" }] },
] as const;
