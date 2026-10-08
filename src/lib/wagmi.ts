import { createConfig, http } from 'wagmi'
import { defineChain } from 'viem'

export const orbiNumTestnet = defineChain({
  id: 2700,
  name: 'Orbinum Testnet',
  nativeCurrency: { name: 'Orbinum', symbol: 'ORB', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc-1.testnet.orbinum.io'] },
  },
  blockExplorers: {
    default: { name: 'Orbinum Explorer', url: 'https://explorer.testnet.orbinum.network' },
  },
  testnet: true,
})

export const config = createConfig({
  chains: [orbiNumTestnet],
  transports: {
    [orbiNumTestnet.id]: http(),
  },
})
