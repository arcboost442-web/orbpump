'use client'

import { useEffect, useState } from 'react'
import { useAccount, useConnect, useDisconnect, useReadContract } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { FACTORY_ADDRESS, FACTORY_ABI } from '@/lib/contracts'
import WalletDropdown from './WalletDropdown'

const CSS = `
@keyframes nb-blink{0%,100%{opacity:1;}50%{opacity:.3;}}
.nb{height:50px;border-bottom:1px solid var(--border);display:flex;align-items:center;padding:0 20px;gap:12px;position:sticky;top:0;z-index:100;background:var(--bg-nav);backdrop-filter:blur(14px);font-family:'Inter',sans-serif;}
.nb *,.nb *::before,.nb *::after{box-sizing:border-box;}
.nb a{text-decoration:none;}
.nb .nb-logo{display:flex;align-items:center;gap:8px;flex-shrink:0;}
.nb .nb-logo-img{width:26px;height:26px;border-radius:6px;object-fit:cover;}
.nb .nb-logo-text{font-size:14px;font-weight:900;letter-spacing:-0.4px;color:var(--text-primary);}
.nb .nb-logo-text span{background:linear-gradient(90deg,#6E54F5,#F97316);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;}
.nb .nb-r{display:flex;align-items:center;gap:8px;margin-left:auto;}
.nb .nb-count{font-size:11px;font-weight:700;color:var(--accent);background:var(--accent-bg);border:1px solid var(--accent-border);border-radius:20px;padding:4px 10px;}
.nb .nb-chain{display:flex;align-items:center;gap:5px;font-size:11px;font-weight:600;color:var(--text-muted);background:var(--bg-card);border:1px solid var(--border);border-radius:20px;padding:4px 10px;}
.nb .nb-dot{width:5px;height:5px;border-radius:50%;background:#F97316;animation:nb-blink 2s ease-in-out infinite;}
.nb .nb-ghost{background:transparent;color:var(--text-muted);border:1px solid var(--border-strong);border-radius:6px;padding:5px 12px;font-size:12px;font-weight:600;cursor:pointer;font-family:'Inter',sans-serif;}
.nb .nb-ghost:hover{color:var(--text-primary);}
.nb .nb-create{background:var(--accent);color:#fff;border-radius:6px;padding:6px 14px;font-size:12px;font-weight:700;display:inline-block;}
.nb .nb-create:hover{opacity:.88;}
.nb .nb-theme{background:var(--bg-subtle);border:1px solid var(--border);border-radius:7px;width:32px;height:32px;display:flex;align-items:center;justify-content:center;cursor:pointer;color:var(--text-muted);flex-shrink:0;transition:background .15s;}
.nb .nb-theme:hover{background:var(--bg-item-hover);}
@media(max-width:900px){.nb{padding:0 16px;}.nb .nb-count{display:none;}}
`

function ThemeToggle() {
  const [dark, setDark] = useState(true)
  useEffect(() => {
    const saved = localStorage.getItem('theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = saved ? saved === 'dark' : prefersDark
    setDark(isDark)
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
  }, [])
  const toggle = () => {
    const next = !dark; setDark(next)
    const theme = next ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }
  return (
    <button className="nb-theme" onClick={toggle}>
      {dark
        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
      }
    </button>
  )
}

export default function Navbar() {
  const { address, isConnected } = useAccount()
  const { connect } = useConnect()
  const { disconnect } = useDisconnect()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  const walletOn = mounted && isConnected

  const { data: total } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: 'totalTokens',
  })

  return (
    <>
      <style>{CSS}</style>
      <nav className="nb">
        <a href="/" className="nb-logo">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.jpg" alt="ORBPUMP" className="nb-logo-img" />
          <span className="nb-logo-text">ORB<span>PUMP</span></span>
        </a>

        <div className="nb-r">
          {total !== undefined && total > 0n && (
            <div className="nb-count">• {total.toString()} tokens</div>
          )}
          <div className="nb-chain">
            <span className="nb-dot" />Orbinum Testnet
          </div>
          <ThemeToggle />
          {walletOn && address
            ? <WalletDropdown address={address} onDisconnect={() => disconnect()} />
            : <button className="nb-ghost" onClick={() => connect({ connector: injected() })}>Connect wallet</button>
          }
          <a href="/create" className="nb-create">+ Create</a>
        </div>
      </nav>
    </>
  )
}
