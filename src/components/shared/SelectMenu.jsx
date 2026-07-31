import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

/**
 * SelectMenu — custom dark-themed dropdown that portals outside all overflow
 * contexts so it never gets clipped by modals or panels.
 *
 * Props:
 *   value       {string|number}
 *   onChange    {function(value)}
 *   options     {Array<{ value, label }>}
 *   placeholder {string}
 *   dark        {boolean} — dark panel palette (default true)
 */
export default function SelectMenu({ value, onChange, options = [], placeholder = 'Select…', dark = true }) {
  const [open, setOpen]   = useState(false)
  const [pos,  setPos]    = useState({ top: 0, left: 0, width: 0 })
  const triggerRef        = useRef(null)

  // Position the portal dropdown under the trigger
  function openMenu() {
    if (triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect()
      setPos({
        top:   r.bottom + 4,
        left:  r.left,
        width: r.width,
      })
    }
    setOpen(true)
  }

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handler(e) {
      if (triggerRef.current?.contains(e.target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on scroll / resize so position stays correct
  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => {
      window.removeEventListener('scroll', close, true)
      window.removeEventListener('resize', close)
    }
  }, [open])

  const P = {
    bg:      dark ? '#1e1e2e'                    : 'var(--color-surface)',
    surface: dark ? '#252535'                    : 'var(--color-surface-2)',
    border:  dark ? 'rgba(255,255,255,0.10)'     : 'var(--color-border)',
    text:    dark ? '#ffffff'                    : 'var(--color-text)',
    muted:   dark ? 'rgba(255,255,255,0.35)'     : 'var(--color-text-muted)',
    primary: '#6366f1',
    accent:  '#a78bfa',
    hover:   dark ? 'rgba(99,102,241,0.15)'      : 'rgba(99,102,241,0.08)',
  }

  const selected = options.find(o => String(o.value) === String(value))

  const dropdown = open ? createPortal(
    <div
      style={{
        position:  'fixed',
        top:       pos.top,
        left:      pos.left,
        width:     pos.width,
        zIndex:    9999,
        borderRadius: 10,
        background: P.bg,
        border:    `1px solid ${P.border}`,
        boxShadow: '0 8px 32px rgba(0,0,0,0.7)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Gradient top bar */}
      <div style={{ height: 2, background: `linear-gradient(90deg, ${P.primary}, ${P.accent})`, borderRadius: '10px 10px 0 0' }} />
      <div style={{ padding: 4 }}>
        {options.map(opt => {
          const isActive = String(opt.value) === String(value)
          return (
            <button
              key={opt.value}
              type="button"
              onMouseDown={e => {
                e.preventDefault()
                onChange(opt.value)
                setOpen(false)
              }}
              style={{
                width: '100%', textAlign: 'left',
                padding: '8px 12px', borderRadius: 6, border: 'none',
                background: isActive ? P.primary : 'transparent',
                color:      isActive ? '#fff'    : P.text,
                fontSize: 14, fontWeight: isActive ? 600 : 400,
                cursor: 'pointer', fontFamily: 'inherit', display: 'block',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = P.hover }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
    </div>,
    document.body
  ) : null

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => open ? setOpen(false) : openMenu()}
        style={{
          width: '100%', height: 38, padding: '0 12px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          borderRadius: 8, boxSizing: 'border-box',
          border:     `1.5px solid ${open ? P.primary : P.border}`,
          background: P.surface,
          color:      selected ? P.text : P.muted,
          fontSize: 14, fontFamily: 'var(--font-sans)',
          cursor: 'pointer',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          boxShadow: open ? `0 0 0 3px rgba(99,102,241,0.18)` : 'none',
        }}
      >
        <span>{selected?.label ?? placeholder}</span>
        <svg
          width="12" height="12" viewBox="0 0 12 12" fill="none"
          style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
        >
          <path d="M2 4l4 4 4-4" stroke={P.muted} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {dropdown}
    </div>
  )
}
