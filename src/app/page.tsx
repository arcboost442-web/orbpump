'use client'

import { useCallback, useEffect, useState } from 'react'
import { useReadContract, usePublicClient } from 'wagmi'
import { formatUnits } from 'viem'
import { FACTORY_ADDRESS, FACTORY_ABI, TOKEN_ABI } from '@/lib/contracts'
import Navbar from './components/Navbar'

const IPFS_GW = 'https://gateway.pinata.cloud/ipfs/'
const TOTAL_SUPPLY = 1_000_000_000
const GRAD_MCAP = 100_000 // 100k ORB

function ipfsToHttp(uri?: string) {
  if (!uri) return ''
  if (uri.startsWith('ipfs://')) return IPFS_GW + uri.slice(7)
  return uri
}
function num(v?: bigint) { return v === undefined ? 0 : Number(formatUnits(v, 18)) }
function fmtK(n: number) {
  if (n >= 1_000_000) return n >= 1e9 ? (n/1e9).toFixed(2)+'B ORB' : (n/1_000_000).toFixed(2)+'M ORB'
  if (n >= 1_000) return (n/1_000).toFixed(1)+'K ORB'
  return n.toFixed(2)+' ORB'
}

interface TokenData {
  address: string
  name: string
  symbol: string
  imageUrl: string
  creator: string
  createdAt: number
  graduated: boolean
  spotPrice: number
  marketCap: number
  progressBps: number
  realOrbCollected: number
}

function useAllTokens(addresses?: readonly `0x${string}`[]) {
  const client = usePublicClient()
  const [tokens, setTokens] = useState<TokenData[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!client || !addresses) return
    if (addresses.length === 0) { setTokens([]); setLoading(false); return }
    try {
      const results = await Promise.all(
        addresses.map(async (addr) => {
          try {
            const [name, symbol, imageUrl, creator, createdAt, graduated, curveInfo] = await Promise.all([
              client.readContract({ address: addr, abi: TOKEN_ABI, functionName: 'name' }),
              client.readContract({ address: addr, abi: TOKEN_ABI, functionName: 'symbol' }),
              client.readContract({ address: addr, abi: TOKEN_ABI, functionName: 'imageUrl' }),
              client.readContract({ address: addr, abi: TOKEN_ABI, functionName: 'creator' }),
              client.readContract({ address: addr, abi: TOKEN_ABI, functionName: 'createdAt' }),
              client.readContract({ address: addr, abi: TOKEN_ABI, functionName: 'graduated' }),
              client.readContract({ address: FACTORY_ADDRESS, abi: FACTORY_ABI, functionName: 'getCurveInfo', args: [addr] }),
            ])
            const [,,realOrb,,spotPrice,marketCap,progressBps] = curveInfo as bigint[]
            return {
              address: addr,
              name: name as string,
              symbol: symbol as string,
              imageUrl: ipfsToHttp(imageUrl as string),
              creator: creator as string,
              createdAt: Number(createdAt as bigint),
              graduated: graduated as boolean,
              spotPrice: num(spotPrice as bigint),
              marketCap: num(marketCap as bigint),
              progressBps: Number(progressBps as bigint),
              realOrbCollected: num(realOrb as bigint),
            } as TokenData
          } catch { return null }
        })
      )
      setTokens(results.filter(Boolean) as TokenData[])
    } finally { setLoading(false) }
  }, [addresses, client])

  useEffect(() => { load() }, [load])
  return { tokens, loading, reload: load }
}

function agoSeconds(s: number) {
  if (s < 60) return Math.max(0, Math.floor(s)) + 's ago'
  if (s < 3600) return Math.floor(s/60) + 'm ago'
  if (s < 86400) return Math.floor(s/3600) + 'h ago'
  return Math.floor(s/86400) + 'd ago'
}

function TokenAvatar({ token, size = 40 }: { token: TokenData; size?: number }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size*0.22, overflow: 'hidden', background: 'linear-gradient(135deg,#1a1133,#120e33)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
      {token.imageUrl
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={token.imageUrl} alt={token.symbol} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
        : <span style={{ fontSize: size*0.28, fontWeight: 900, color: 'var(--text-faint)' }}>{token.symbol.slice(0,3)}</span>
      }
    </div>
  )
}

function ContendersHero({ tokens }: { tokens: TokenData[] }) {
  const active = tokens.filter(t => !t.graduated).sort((a,b) => b.progressBps - a.progressBps)
  const featured = active[0]
  const leaderboard = active.slice(0, 5)
  if (!featured) return null

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 12, marginBottom: 16 }}>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Contenders</div>
            <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>
              {featured.progressBps >= 8000 ? '🔥 Almost graduating' : `Closest to ${GRAD_MCAP/1000}K ORB`}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
          <TokenAvatar token={featured} size={48} />
          <div>
            <div style={{ fontSize: 26, fontWeight: 900, letterSpacing: -1, color: 'var(--text-primary)' }}>${featured.symbol}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{featured.name}</div>
          </div>
          <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
            <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: -0.5 }}>{fmtK(featured.marketCap)}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>Market cap</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-faint)', marginBottom: 3 }}>Price</div>
            <div style={{ fontSize: 14, fontWeight: 800 }}>{featured.spotPrice > 0 ? featured.spotPrice.toFixed(8) : '—'}</div>
            <div style={{ fontSize: 9, color: 'var(--text-faint)' }}>ORB</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-faint)', marginBottom: 3 }}>ORB Collected</div>
            <div style={{ fontSize: 14, fontWeight: 800 }}>{fmtK(featured.realOrbCollected)}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: 'var(--text-faint)', marginBottom: 3 }}>Bonding</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--accent)' }}>{(featured.progressBps/100).toFixed(1)}%</div>
            <div style={{ fontSize: 9, color: 'var(--text-faint)' }}>to graduation</div>
          </div>
        </div>
      </div>

      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>Leaderboard</span>
          <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>Closest to {GRAD_MCAP/1000}K ORB</span>
        </div>
        {leaderboard.map((t, i) => (
          <a key={t.address} href={`/token/${t.address}`} style={{ textDecoration: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', borderBottom: i < leaderboard.length-1 ? '1px solid var(--border-subtle)' : 'none' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-item-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-faint)', width: 14, textAlign: 'center' }}>{i+1}</span>
              <TokenAvatar token={t} size={32} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>{t.symbol}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 12, fontWeight: 700 }}>{fmtK(t.marketCap)}</div>
                <div style={{ fontSize: 9, color: t.progressBps >= 8000 ? '#F97316' : 'var(--text-faint)', marginTop: 2 }}>{(t.progressBps/100).toFixed(1)}% bonded</div>
              </div>
            </div>
          </a>
        ))}
        {leaderboard.length === 0 && (
          <div style={{ padding: '32px 16px', textAlign: 'center', fontSize: 12, color: 'var(--text-faint)' }}>No active tokens yet</div>
        )}
      </div>
    </div>
  )
}

type TabKey = 'new' | 'trending' | 'graduated'

function TokenListSection({ tokens }: { tokens: TokenData[] }) {
  const [tab, setTab] = useState<TabKey>('new')
  const [view, setView] = useState<'grid'|'list'>('grid')
  const nowSec = Date.now() / 1000

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: 'new', label: 'New', icon: '🌱' },
    { key: 'trending', label: 'Trending', icon: '⚡' },
    { key: 'graduated', label: 'Graduated', icon: '🎓' },
  ]

  const filtered = tokens
    .filter(t => tab === 'graduated' ? t.graduated : !t.graduated)
    .sort((a,b) => tab === 'trending' ? b.marketCap - a.marketCap : b.createdAt - a.createdAt)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', gap: 2 }}>
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '6px 14px', fontSize: 13, fontWeight: tab === t.key ? 700 : 500, color: tab === t.key ? 'var(--text-primary)' : 'var(--text-faint)', fontFamily: 'inherit', borderBottom: tab === t.key ? '2px solid var(--accent)' : '2px solid transparent', transition: 'all 0.13s', display: 'flex', alignItems: 'center', gap: 5 }}
            >
              <span style={{ fontSize: 12 }}>{t.icon}</span>{t.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 6, overflow: 'hidden' }}>
          {(['grid','list'] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              style={{ background: view === v ? 'var(--accent-bg)' : 'transparent', border: 'none', color: view === v ? 'var(--accent)' : 'var(--text-faint)', padding: '5px 9px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
            >
              {v === 'grid'
                ? <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              }
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '48px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: 'var(--text-faint)', marginBottom: 12 }}>
            {tab === 'graduated' ? 'No graduated tokens yet' : 'No tokens yet'}
          </div>
          {tab !== 'graduated' && (
            <a href="/create" style={{ background: 'var(--accent)', color: '#fff', borderRadius: 6, padding: '10px 20px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>+ Launch first token</a>
          )}
        </div>
      ) : view === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
          {filtered.map(t => (
            <a key={t.address} href={`/token/${t.address}`} style={{ textDecoration: 'none' }}>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', transition: 'border-color 0.15s', cursor: 'pointer' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
              >
                <div style={{ width: '100%', aspectRatio: '1', background: 'linear-gradient(160deg,#110f23,#1a1133,#120e33)', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {t.imageUrl
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img src={t.imageUrl} alt={t.symbol} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} onError={e => { (e.target as HTMLImageElement).style.display='none' }} />
                    : <span style={{ fontSize: 48, fontWeight: 900, letterSpacing: -2, color: 'rgba(255,255,255,0.07)' }}>{t.symbol}</span>
                  }
                  <div style={{ position: 'absolute', top: 7, left: 7, background: 'var(--overlay-dark)', backdropFilter: 'blur(4px)', borderRadius: 3, padding: '2px 6px', fontSize: 9, fontWeight: 700, color: t.graduated ? 'var(--green)' : 'var(--text-muted)', zIndex: 1 }}>
                    {t.graduated ? 'GRAD' : 'V1'}
                  </div>
                  <div style={{ position: 'absolute', bottom: 7, left: 7, background: 'var(--overlay-dark)', backdropFilter: 'blur(4px)', borderRadius: 3, padding: '2px 6px', fontSize: 9, color: 'var(--text-muted)', zIndex: 1 }}>
                    {(t.progressBps/100).toFixed(1)}% bonded
                  </div>
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.05)', zIndex: 1 }}>
                    <div style={{ height: '100%', width: Math.min(t.progressBps/100, 100)+'%', background: t.graduated ? 'var(--green)' : 'var(--accent)' }} />
                  </div>
                </div>
                <div style={{ padding: '9px 11px 11px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 10, color: 'var(--text-faint)' }}>{t.name}</span>
                    <span style={{ fontSize: 9, color: 'var(--text-faint)' }}>MC</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                    <span style={{ fontSize: 15, fontWeight: 800, letterSpacing: -0.4, color: 'var(--text-primary)' }}>${t.symbol}</span>
                    <span style={{ fontSize: 13, fontWeight: 800 }}>{fmtK(t.marketCap)}</span>
                  </div>
                  <div style={{ fontSize: 9, color: 'var(--text-faint)', marginTop: 4 }}>{agoSeconds(Date.now()/1000 - t.createdAt)}</div>
                </div>
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
          {filtered.map((t, i) => (
            <a key={t.address} href={`/token/${t.address}`} style={{ textDecoration: 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderBottom: i < filtered.length-1 ? '1px solid var(--border-subtle)' : 'none' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-item-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <TokenAvatar token={t} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{t.name} <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>${t.symbol}</span></div>
                  <div style={{ fontSize: 10, color: 'var(--text-faint)', fontFamily: 'monospace' }}>{t.address.slice(0,10)}...{t.address.slice(-6)}</div>
                </div>
                <div style={{ textAlign: 'right', minWidth: 80 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{fmtK(t.marketCap)}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-faint)' }}>mcap</div>
                </div>
                <div style={{ textAlign: 'right', minWidth: 60 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: t.graduated ? 'var(--green)' : 'var(--accent)' }}>{(t.progressBps/100).toFixed(1)}%</div>
                  <div style={{ fontSize: 10, color: 'var(--text-faint)' }}>bonded</div>
                </div>
                <div style={{ width: 28, height: 28, borderRadius: 6, background: t.graduated ? 'rgba(23,201,116,0.08)' : 'var(--accent-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={t.graduated ? 'var(--green)' : 'var(--accent)'} strokeWidth="2.5" strokeLinecap="round"><path d="M7 17L17 7M17 7H7M17 7v10"/></svg>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Home() {
  const { data: addresses, error: listError } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: 'getTokens',
    args: [BigInt(0), BigInt(50)],
  })

  const { tokens, loading } = useAllTokens(addresses as readonly `0x${string}`[] | undefined)

  return (
    <main style={{ background: 'var(--bg-page)', minHeight: '100vh', color: 'var(--text-primary)', fontFamily: 'Inter, sans-serif' }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <Navbar />
      <div style={{ maxWidth: 1260, margin: '0 auto', padding: '20px 20px 40px' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, gap: 10, color: 'var(--text-faint)', fontSize: 13 }}>
            <div style={{ width: 16, height: 16, border: '2px solid var(--accent-bg)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
            Loading tokens...
          </div>
        ) : listError ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-faint)', fontSize: 13 }}>
            Failed to load. Make sure Factory address is set correctly.
          </div>
        ) : tokens.length === 0 ? (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: 'var(--text-faint)', marginBottom: 12 }}>No tokens launched yet</div>
            <a href="/create" style={{ background: 'var(--accent)', color: '#fff', borderRadius: 6, padding: '10px 20px', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>Launch the first token</a>
          </div>
        ) : (
          <>
            <ContendersHero tokens={tokens} />
            <TokenListSection tokens={tokens} />
          </>
        )}
      </div>
    </main>
  )
}
