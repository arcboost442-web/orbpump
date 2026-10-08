'use client'

import { useEffect, useState } from 'react'

export default function WalletDropdown({ address, onDisconnect }: { address: string; onDisconnect: () => void }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      const el = document.getElementById('wd-drop')
      const btn = document.getElementById('wd-btn')
      if (el && !el.contains(e.target as Node) && btn && !btn.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const short = address.slice(0, 6) + '...' + address.slice(-4)
  const hue = parseInt(address.slice(2, 6), 16) % 360
  const explorerUrl = `https://explorer.testnet.orbinum.network/address/${address}`

  const handleCopy = () => {
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div style={{ position: 'relative' }}>
      <button id="wd-btn" onClick={() => setOpen(o => !o)}
        style={{ display: 'flex', alignItems: 'center', gap: 7, background: open ? 'var(--accent-bg)' : 'var(--bg-subtle)', border: `1px solid ${open ? 'rgba(110,84,245,0.4)' : 'var(--border-strong)'}`, borderRadius: 8, padding: '4px 10px 4px 5px', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit' }}
      >
        <div style={{ width: 28, height: 28, borderRadius: 7, background: `hsl(${hue},60%,42%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0 }}>
          {address.slice(2, 4).toUpperCase()}
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{short}</span>
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-faint)" strokeWidth="2.5" strokeLinecap="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div id="wd-drop" style={{ position: 'fixed', top: 58, right: 20, width: 300, background: 'var(--bg-dropdown)', border: '1px solid var(--border-strong)', borderRadius: 16, boxShadow: '0 32px 80px rgba(0,0,0,0.5)', zIndex: 9999, overflow: 'hidden' }}>
          <div style={{ padding: '16px 18px 14px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid var(--border)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: `hsl(${hue},60%,38%)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: '#fff', flexShrink: 0 }}>
              {address.slice(2, 4).toUpperCase()}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{short}</div>
              <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2 }}>Orbinum Testnet</div>
            </div>
            <button onClick={handleCopy} style={{ width: 32, height: 32, background: copied ? 'var(--accent-bg)' : 'var(--bg-subtle)', border: '1px solid var(--border)', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: copied ? 'var(--accent)' : 'var(--text-muted)' }}>
              {copied
                ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                : <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              }
            </button>
          </div>
          <div style={{ padding: '8px 10px' }}>
            <a href={explorerUrl} target="_blank" rel="noreferrer" onClick={() => setOpen(false)}
              style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 10px', borderRadius: 8, textDecoration: 'none', color: 'var(--text-secondary)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-item-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-icon)" strokeWidth="1.8" strokeLinecap="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              <span style={{ fontSize: 13, fontWeight: 600 }}>View on explorer</span>
            </a>
            <div style={{ height: 1, background: 'var(--border)', margin: '4px 4px' }} />
            <button onClick={() => { onDisconnect(); setOpen(false) }}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 10px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', borderRadius: 8, color: 'var(--danger)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--danger-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Disconnect</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
