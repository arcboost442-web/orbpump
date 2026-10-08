'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useAccount, useConnect, useReadContract, usePublicClient, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { erc20Abi, formatUnits, parseUnits } from 'viem'
import { FACTORY_ADDRESS, FACTORY_ABI, TOKEN_ABI } from '@/lib/contracts'
import Navbar from '../../components/Navbar'

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
.tp{--bg:var(--bg-page);--bg2:var(--bg-card);--bg3:var(--bg-subtle);--bg4:var(--bg-item-hover);--border2:var(--border-strong);--border-focus:rgba(110,84,245,0.45);--text:var(--text-primary);--text2:var(--text-muted);--text3:var(--text-faint);--green-dim:rgba(23,201,116,0.12);--red:var(--danger);--red-dim:var(--danger-bg);--purple:var(--accent);--purple-dim:var(--accent-bg);--yellow:#F97316;--r:6px;--r2:10px;--gutter:20px;font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased;min-height:100vh;font-size:14px;}
.tp *,.tp *::before,.tp *::after{box-sizing:border-box;margin:0;padding:0;}
.tp a{color:inherit;text-decoration:none;}
.tp input[type=number]::-webkit-outer-spin-button,.tp input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
.tp input[type=number]{-moz-appearance:textfield;}
.tp .tok-header-bar{border-bottom:1px solid var(--border);background:var(--bg2);width:100%;}
.tp .tok-header-main{display:flex;align-items:center;gap:14px;padding:14px var(--gutter);}
.tp .tok-avatar{width:44px;height:44px;border-radius:11px;overflow:hidden;border:1px solid var(--border2);flex-shrink:0;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#1a1133,#120e33);}
.tp .tok-avatar img{width:100%;height:100%;object-fit:cover;}
.tp .tok-avatar-fb{font-size:12px;font-weight:900;color:var(--text3);}
.tp .tok-name-col{display:flex;flex-direction:column;gap:3px;min-width:0;}
.tp .tok-name-row{display:flex;align-items:center;gap:8px;}
.tp .tok-sym{font-size:21px;font-weight:900;letter-spacing:-.6px;color:var(--text);line-height:1.1;}
.tp .tok-v-badge{font-size:10px;font-weight:700;color:var(--purple);background:var(--purple-dim);border:1px solid rgba(110,84,245,.22);padding:2px 6px;border-radius:4px;}
.tp .tok-fullname{font-size:12px;color:var(--text2);}
.tp .tok-mcap-col{margin-left:auto;text-align:right;flex-shrink:0;}
.tp .tok-mcap-top{display:flex;align-items:baseline;gap:5px;justify-content:flex-end;}
.tp .tok-mcap-val{font-size:24px;font-weight:900;letter-spacing:-.8px;line-height:1.1;}
.tp .tok-mcap-lbl{font-size:11px;color:var(--text3);font-weight:600;}
.tp .tok-meta-row{display:flex;align-items:center;padding:0 var(--gutter);border-top:1px solid var(--border);overflow-x:auto;}
.tp .tok-meta-item{display:flex;align-items:center;gap:7px;padding:9px 18px 9px 0;font-size:11px;white-space:nowrap;flex-shrink:0;}
.tp .tok-meta-item+.tok-meta-item{border-left:1px solid var(--border);padding-left:18px;}
.tp .tok-meta-lbl{color:var(--text3);font-weight:500;}
.tp .tok-meta-val{color:var(--text2);font-weight:600;font-family:monospace;font-size:11px;}
.tp .icobtn{width:20px;height:20px;display:inline-flex;align-items:center;justify-content:center;border-radius:4px;cursor:pointer;color:var(--text3);border:none;background:transparent;padding:0;transition:all .13s;flex-shrink:0;}
.tp .icobtn:hover{color:var(--text);background:var(--bg3);}
.tp .icobtn svg{width:12px;height:12px;}
.tp .layout{display:grid;grid-template-columns:1fr 330px;gap:16px;padding:20px var(--gutter) 48px;align-items:start;}
.tp .price-row{display:flex;align-items:baseline;gap:12px;margin-bottom:16px;flex-wrap:wrap;}
.tp .price-main{font-size:32px;font-weight:900;letter-spacing:-1.5px;line-height:1;}
.tp .price-unit{font-size:13px;color:var(--text2);font-weight:600;margin-left:6px;letter-spacing:0;}
.tp .chart-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r2);padding:16px;margin-bottom:12px;}
.tp .chart-area{height:200px;}
.tp .chart-svg{width:100%;height:100%;}
.tp .chart-empty{height:100%;display:flex;align-items:center;justify-content:center;font-size:12px;color:var(--text3);}
.tp .chart-title{font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;}
.tp .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:12px;}
.tp .sc{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r2);padding:14px 16px;}
.tp .sc-label{font-size:10px;color:var(--text3);font-weight:600;text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;}
.tp .sc-val{font-size:20px;font-weight:800;letter-spacing:-.5px;}
.tp .sc-sub{font-size:10px;color:var(--text3);margin-top:3px;}
.tp .ms-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r2);padding:16px;margin-bottom:12px;}
.tp .ms-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;}
.tp .ms-title{font-size:13px;font-weight:700;color:var(--text);}
.tp .ms-sub{font-size:11px;color:var(--text2);margin-top:2px;}
.tp .ms-pct{font-size:20px;font-weight:900;letter-spacing:-.5px;color:var(--green);}
.tp .ms-bar-bg{height:6px;background:var(--bg4);border-radius:3px;overflow:hidden;margin-bottom:8px;}
.tp .ms-bar-fill{height:100%;border-radius:3px;background:linear-gradient(90deg,var(--purple),var(--green));}
.tp .ms-labs{display:flex;justify-content:space-between;font-size:10px;color:var(--text3);}
.tp .ms-note{font-size:11px;color:var(--text2);margin-top:12px;padding-top:12px;border-top:1px solid var(--border);line-height:1.55;}
.tp .bs-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r2);padding:16px;margin-bottom:12px;}
.tp .bs-tabs{display:flex;margin-bottom:16px;background:var(--bg3);border-radius:var(--r);overflow:hidden;padding:3px;gap:3px;}
.tp .bs-tab{flex:1;text-align:center;padding:7px;font-size:13px;font-weight:700;cursor:pointer;border-radius:4px;color:var(--text3);transition:all .14s;border:1px solid transparent;user-select:none;}
.tp .bs-tab:hover{color:var(--text2);}
.tp .bs-tab.buy.on{background:var(--green-dim);color:var(--green);border-color:rgba(23,201,116,.22);}
.tp .bs-tab.sell.on{background:var(--red-dim);color:var(--red);border-color:rgba(240,69,90,.18);}
.tp .inp-label{font-size:10px;font-weight:600;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:6px;}
.tp .inp-wrap{background:var(--bg3);border:1px solid var(--border2);border-radius:var(--r);padding:10px 12px;margin-bottom:8px;display:flex;align-items:center;gap:7px;}
.tp .inp-wrap:focus-within{border-color:var(--border-focus);}
.tp .inp{background:transparent;border:none;outline:none;font-size:16px;font-weight:700;color:var(--text);font-family:'Inter',sans-serif;flex:1;width:0;}
.tp .inp::placeholder{color:var(--text3);}
.tp .inp-cur{font-size:12px;font-weight:700;color:var(--text2);white-space:nowrap;}
.tp .quick-btns{display:flex;gap:6px;margin-bottom:14px;}
.tp .qbtn{flex:1;background:var(--bg3);border:1px solid var(--border);border-radius:var(--r);padding:6px;font-size:11px;font-weight:600;color:var(--text2);cursor:pointer;text-align:center;font-family:'Inter',sans-serif;transition:all .13s;}
.tp .qbtn:hover{border-color:var(--border2);color:var(--text);}
.tp .info-row{display:flex;justify-content:space-between;font-size:11px;color:var(--text3);margin-bottom:9px;}
.tp .info-row span{color:var(--text2);}
.tp .btn-buy{width:100%;background:var(--green);color:#0C0C0E;border:none;border-radius:var(--r);padding:12px;font-size:14px;font-weight:800;cursor:pointer;font-family:'Inter',sans-serif;letter-spacing:-.2px;transition:opacity .14s;margin-top:4px;}
.tp .btn-buy:hover{opacity:.88;}
.tp .btn-buy:disabled{opacity:.35;cursor:not-allowed;}
.tp .btn-sell-active{background:var(--red)!important;color:#fff!important;}
.tp .info-card{background:var(--bg2);border:1px solid var(--border);border-radius:var(--r2);padding:14px 16px;margin-bottom:12px;}
.tp .ic-title{font-size:10px;font-weight:700;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px;}
.tp .ic-row{display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);}
.tp .ic-row:last-child{border-bottom:none;padding-bottom:0;}
.tp .ic-key{font-size:11px;color:var(--text3);}
.tp .ic-val{font-size:11px;font-weight:600;color:var(--text);}
.tp .ic-val.green{color:var(--green);}
.tp .ic-val.mono{font-family:monospace;font-size:11px;}
.tp .msg{font-size:11px;margin-top:8px;line-height:1.5;word-break:break-word;}
.tp .msg.err{color:var(--red);}
.tp .msg.ok{color:var(--green);}
.tp .inp-disc{font-size:10px;color:var(--text3);text-align:center;margin-top:10px;line-height:1.5;}
.tp .notfound{max-width:520px;margin:80px auto;text-align:center;color:var(--text2);}
@media(max-width:900px){.tp .layout{grid-template-columns:1fr;}.tp .stats-grid{grid-template-columns:repeat(2,1fr);}}
`

const IPFS_GW = 'https://gateway.pinata.cloud/ipfs/'
const TOTAL_SUPPLY = 1_000_000_000
const GRAD_MCAP = 100_000

function num(v?: bigint) { return v === undefined ? 0 : Number(formatUnits(v, 18)) }
function fmt(v: number, dp = 2) { return v.toLocaleString('en-US', { maximumFractionDigits: dp }) }
function fmtOrb(n: number) {
  if (n >= 1_000_000) return (n/1_000_000).toFixed(2)+'M ORB'
  if (n >= 1_000) return (n/1_000).toFixed(1)+'K ORB'
  return n.toFixed(2)+' ORB'
}
function short(a?: string) { return a ? a.slice(0,6)+'…'+a.slice(-4) : '—' }
function agoSeconds(s: number) {
  if (s < 60) return Math.max(0,Math.floor(s))+'s ago'
  if (s < 3600) return Math.floor(s/60)+'m ago'
  if (s < 86400) return Math.floor(s/3600)+'h ago'
  return Math.floor(s/86400)+'d ago'
}
function ipfsToHttp(uri?: string) { if (!uri) return ''; if (uri.startsWith('ipfs://')) return IPFS_GW+uri.slice(7); return uri }
function toWei(v: string): bigint | undefined {
  try { if (!v || Number(v) <= 0) return undefined; return parseUnits(v, 18) } catch { return undefined }
}

function CopyBtn({ text }: { text: string }) {
  const [ok, setOk] = useState(false)
  return (
    <button className="icobtn" onClick={() => { navigator.clipboard.writeText(text); setOk(true); setTimeout(()=>setOk(false),1400) }}>
      {ok
        ? <svg viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
        : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      }
    </button>
  )
}

export default function TokenDetail() {
  const params = useParams()
  const raw = params?.address
  const tokenAddr = (Array.isArray(raw) ? raw[0] : raw) as `0x${string}`

  const { address, isConnected: walletConnected } = useAccount()
const { connect } = useConnect()
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
const isConnected = mounted && walletConnected

  const [mode, setMode] = useState<'buy'|'sell'>('buy')
  const [amt, setAmt] = useState('')

  const { data: name } = useReadContract({ address: tokenAddr, abi: TOKEN_ABI, functionName: 'name' })
  const { data: symbol } = useReadContract({ address: tokenAddr, abi: TOKEN_ABI, functionName: 'symbol' })
  const { data: description } = useReadContract({ address: tokenAddr, abi: TOKEN_ABI, functionName: 'description' })
  const { data: imageUrl } = useReadContract({ address: tokenAddr, abi: TOKEN_ABI, functionName: 'imageUrl' })
  const { data: creator } = useReadContract({ address: tokenAddr, abi: TOKEN_ABI, functionName: 'creator' })
  const { data: createdAt } = useReadContract({ address: tokenAddr, abi: TOKEN_ABI, functionName: 'createdAt' })
  const { data: graduated } = useReadContract({ address: tokenAddr, abi: TOKEN_ABI, functionName: 'graduated' })
  const { data: curveInfo, refetch: refetchCurve } = useReadContract({ address: FACTORY_ADDRESS, abi: FACTORY_ABI, functionName: 'getCurveInfo', args: [tokenAddr] })
  const { data: bal, refetch: refetchBal } = useReadContract({ address: tokenAddr, abi: erc20Abi, functionName: 'balanceOf', args: [address as `0x${string}`], query: { enabled: !!address } })

  const amtWei = toWei(amt)
  const { data: buyQuote } = useReadContract({ address: FACTORY_ADDRESS, abi: FACTORY_ABI, functionName: 'quoteBuy', args: [tokenAddr, amtWei ?? BigInt(0)], query: { enabled: mode === 'buy' && !!amtWei } })
  const { data: sellQuote } = useReadContract({ address: FACTORY_ADDRESS, abi: FACTORY_ABI, functionName: 'quoteSell', args: [tokenAddr, amtWei ?? BigInt(0)], query: { enabled: mode === 'sell' && !!amtWei } })

  const { writeContract, data: hash, isPending, error, reset } = useWriteContract()
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash })

  useEffect(() => { if (isSuccess) { refetchCurve(); refetchBal(); setAmt('') } }, [isSuccess])

  const [,,realOrb,,spotPrice,marketCap,progressBps] = (curveInfo as bigint[] | undefined) ?? []
  const priceN = num(spotPrice)
  const mcapN = num(marketCap)
  const pct = Math.min(100, Number(progressBps ?? 0n) / 100)
  const balN = num(bal as bigint | undefined)
  const isGrad = !!graduated
  const nowSec = Date.now() / 1000
  const created = createdAt ? agoSeconds(nowSec - Number(createdAt as bigint)) : '—'
  const sym = (symbol as string) ?? ''
  const imgSrc = ipfsToHttp(imageUrl as string | undefined)

  const tokensOut = buyQuote ? (buyQuote as [bigint, bigint])[0] : undefined
  const plsOut = sellQuote ? (sellQuote as [bigint, bigint])[0] : undefined

  const overBalance = mode === 'sell' && !!amtWei && !!bal && amtWei > (bal as bigint)
  const busy = isPending || confirming
const canTrade = mounted && !!amtWei && !busy && !isGrad && !overBalance && (mode === 'buy' ? !!tokensOut : !!plsOut)
  function trade() {
    if (!amtWei) return
    const SLIP = BigInt(98)
    if (mode === 'buy') {
      if (!tokensOut) return
      writeContract({ address: FACTORY_ADDRESS, abi: FACTORY_ABI, functionName: 'buy', args: [tokenAddr, (tokensOut * SLIP) / BigInt(100)], value: amtWei })
    } else {
      if (!plsOut) return
      writeContract({ address: FACTORY_ADDRESS, abi: FACTORY_ABI, functionName: 'sell', args: [tokenAddr, amtWei, (plsOut * SLIP) / BigInt(100)] })
    }
  }

  const sellPercent = (p: number) => { if (!bal) return; setAmt(formatUnits((bal as bigint * BigInt(p)) / BigInt(100), 18)) }

  return (
    <div className="tp">
      <style>{CSS}</style>
      <Navbar />

      {/* Header bar */}
      <div className="tok-header-bar">
        <div className="tok-header-main">
          <div className="tok-avatar">
            {imgSrc
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={imgSrc} alt={sym} onError={e=>{(e.target as HTMLImageElement).style.display='none'}} />
              : <span className="tok-avatar-fb">{sym.slice(0,3)}</span>
            }
          </div>
          <div className="tok-name-col">
            <div className="tok-name-row">
              <span className="tok-sym">${sym || '…'}</span>
              <span className="tok-v-badge">V1</span>
              {isGrad && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--green)', background: 'rgba(23,201,116,.12)', border: '1px solid rgba(23,201,116,.22)', padding: '2px 6px', borderRadius: 4 }}>GRADUATED</span>}
            </div>
            <div className="tok-fullname">{(name as string) || '…'}</div>
          </div>
          <div className="tok-mcap-col">
            <div className="tok-mcap-top">
              <span className="tok-mcap-val">{mcapN > 0 ? fmtOrb(mcapN) : '—'}</span>
              <span className="tok-mcap-lbl">mcap</span>
            </div>
          </div>
        </div>
        <div className="tok-meta-row">
          <div className="tok-meta-item">
            <span className="tok-meta-lbl">Contract</span>
            <span className="tok-meta-val">{short(tokenAddr)}</span>
            <CopyBtn text={tokenAddr} />
          </div>
          <div className="tok-meta-item">
            <span className="tok-meta-lbl">Creator</span>
            <span className="tok-meta-val">{short(creator as string)}</span>
          </div>
          <div className="tok-meta-item">
            <span className="tok-meta-lbl">Launched</span>
            <span className="tok-meta-val" style={{ fontFamily: 'Inter, sans-serif' }}>{created}</span>
          </div>
        </div>
      </div>

      <div className="layout">
        {/* Left */}
        <div>
          {description && <p style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 14 }}>{description as string}</p>}

          <div className="price-row">
            <span className="price-main">{priceN > 0 ? priceN.toFixed(8) : '—'}<span className="price-unit">ORB</span></span>
          </div>

          <div className="chart-card">
            <div className="chart-title">Bonding curve</div>
            <div className="chart-area">
              <div className="chart-empty">Chart appears after first trades</div>
            </div>
          </div>

          <div className="stats-grid">
            <div className="sc"><div className="sc-label">Market Cap</div><div className="sc-val">{fmtOrb(mcapN)}</div><div className="sc-sub">{pct.toFixed(1)}% to grad.</div></div>
            <div className="sc"><div className="sc-label">Price</div><div className="sc-val">{priceN.toFixed(6)}</div><div className="sc-sub">ORB per token</div></div>
            <div className="sc"><div className="sc-label">ORB Collected</div><div className="sc-val">{fmtOrb(num(realOrb))}</div><div className="sc-sub">in bonding curve</div></div>
            <div className="sc"><div className="sc-label">Graduation</div><div className="sc-val">{pct.toFixed(1)}%</div><div className="sc-sub">target: 100K ORB</div></div>
          </div>

          <div className="ms-card">
            <div className="ms-head">
              <div>
                <div className="ms-title">Bonding curve progress</div>
                <div className="ms-sub">{isGrad ? 'Graduated! Trading closed.' : `${fmt(Math.max(0, GRAD_MCAP - mcapN), 0)} ORB remaining to graduation`}</div>
              </div>
              <div className="ms-pct">{pct.toFixed(1)}%</div>
            </div>
            <div className="ms-bar-bg"><div className="ms-bar-fill" style={{ width: pct+'%' }}/></div>
            <div className="ms-labs"><span>0 ORB</span><span>Graduation at 100,000 ORB</span></div>
            <div className="ms-note">When this token hits 100%, the bonding curve closes and liquidity is set aside for an Orbinum DEX.</div>
          </div>
        </div>

        {/* Right sidebar */}
        <div>
          <div className="bs-card">
            <div className="bs-tabs">
              <div className={'bs-tab buy'+(mode==='buy'?' on':'')} onClick={() => { setMode('buy'); setAmt(''); reset() }}>Buy</div>
              <div className={'bs-tab sell'+(mode==='sell'?' on':'')} onClick={() => { setMode('sell'); setAmt(''); reset() }}>Sell</div>
            </div>
            <div className="inp-label">Amount</div>
            <div className="inp-wrap">
              <input className="inp" type="number" placeholder="0.00" value={amt} onChange={e => setAmt(e.target.value)} />
              <span className="inp-cur">{mode==='buy' ? 'ORB' : '$'+sym}</span>
            </div>
            <div className="quick-btns">
              {mode === 'buy'
                ? [['0.1','0.1'],['1','1'],['5','5'],['10','10']].map(([v,l]) => <button key={l} className="qbtn" onClick={() => setAmt(v)}>{l} ORB</button>)
                : [25,50,75,100].map(p => <button key={p} className="qbtn" onClick={() => sellPercent(p)}>{p}%</button>)
              }
            </div>
            {mode === 'sell' && <div className="info-row"><span style={{color:'var(--text3)'}}>Your balance</span><span>{fmt(balN,2)} ${sym}</span></div>}
            <div className="info-row"><span style={{color:'var(--text3)'}}>You receive</span><span>{mode==='buy' ? (tokensOut ? fmt(num(tokensOut),0)+' $'+sym : '—') : (plsOut ? fmt(num(plsOut),4)+' ORB' : '—')}</span></div>
            <div className="info-row"><span style={{color:'var(--text3)'}}>Platform fee (1%)</span><span>—</span></div>

            {isConnected
              ? <button className={'btn-buy'+(mode==='sell'?' btn-sell-active':'')} onClick={trade} disabled={!canTrade}>
                  {isGrad ? 'Trading closed' : isPending ? 'Confirm in wallet…' : confirming ? 'Waiting…' : (mode==='buy' ? 'Buy $' : 'Sell $')+sym}
                </button>
              : <button className="btn-buy" onClick={() => connect({ connector: injected() })}>Connect wallet</button>
            }
            {overBalance && <div className="msg err">Amount exceeds your balance.</div>}
            {error && <div className="msg err">{((error as {shortMessage?:string}).shortMessage ?? error.message).slice(0,200)}</div>}
            {isSuccess && <div className="msg ok">✓ Transaction confirmed.</div>}
            <div className="inp-disc">Slippage tolerance 2%. DYOR — meme tokens carry significant risk.</div>
          </div>

          <div className="info-card">
            <div className="ic-title">Token info</div>
            <div className="ic-row"><span className="ic-key">Contract</span><span className="ic-val mono">{short(tokenAddr)}</span></div>
            <div className="ic-row"><span className="ic-key">Creator</span><span className="ic-val mono">{short(creator as string)}</span></div>
            <div className="ic-row"><span className="ic-key">Created</span><span className="ic-val">{created}</span></div>
            <div className="ic-row"><span className="ic-key">Total supply</span><span className="ic-val">{fmt(TOTAL_SUPPLY,0)}</span></div>
            <div className="ic-row"><span className="ic-key">Decimals</span><span className="ic-val">18</span></div>
            <div className="ic-row"><span className="ic-key">Network</span><span className="ic-val">Orbinum Testnet</span></div>
            <div className="ic-row"><span className="ic-key">Status</span><span className={'ic-val'+(isGrad?'':' green')}>{isGrad?'Graduated':'Active — bonding'}</span></div>
          </div>

          {isConnected && (
            <div style={{ background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', fontSize: 10, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Your position</div>
              <div style={{ padding: '12px 16px' }}>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{fmt(balN,2)} ${sym}</div>
                <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 3 }}>{fmt((balN/TOTAL_SUPPLY)*100,4)}% of supply</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
