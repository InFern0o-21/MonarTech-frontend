import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

const DAYS   = ['Su','Mo','Tu','We','Th','Fr','Sa']
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

function toLocal(isoStr) {
  if (!isoStr) return null
  // Handle both "YYYY-MM-DD" and full ISO datetime "YYYY-MM-DDTHH:mm:ssZ"
  const datePart = isoStr.split('T')[0]
  const [y, m, d] = datePart.split('-').map(Number)
  if (!y || !m || !d) return null
  return new Date(y, m - 1, d)
}
function toISO(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`
}
function daysInMonth(y, m)    { return new Date(y, m+1, 0).getDate() }
function startDayOfMonth(y,m) { return new Date(y, m, 1).getDay() }

export default function DatePicker({ value, onChange, placeholder = 'Pick a date', dark = true }) {
  const selected = toLocal(value)
  const today    = new Date()

  const [open,      setOpen]      = useState(false)
  const [pos,       setPos]       = useState({ top:0, left:0, width:0 })
  const [viewYear,  setViewYear]  = useState((selected ?? today).getFullYear())
  const [viewMonth, setViewMonth] = useState((selected ?? today).getMonth())
  const triggerRef = useRef(null)

  function openPicker() {
    const r = triggerRef.current?.getBoundingClientRect()
    if (r) setPos({ top: r.bottom + 4, left: r.left, width: r.width })
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    const close = (e) => {
      if (triggerRef.current?.contains(e.target)) return
      setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [open])

  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    window.addEventListener('scroll', close, true)
    window.addEventListener('resize', close)
    return () => { window.removeEventListener('scroll', close, true); window.removeEventListener('resize', close) }
  }, [open])

  function prevMonth() { viewMonth===0 ? (setViewMonth(11),setViewYear(y=>y-1)) : setViewMonth(m=>m-1) }
  function nextMonth() { viewMonth===11 ? (setViewMonth(0),setViewYear(y=>y+1)) : setViewMonth(m=>m+1) }
  function goToday()   { setViewYear(today.getFullYear()); setViewMonth(today.getMonth()) }
  function selectDay(day) { onChange(toISO(new Date(viewYear, viewMonth, day))); setOpen(false) }

  // Build grid
  const totalDays = daysInMonth(viewYear, viewMonth)
  const startDay  = startDayOfMonth(viewYear, viewMonth)
  const prevTotal = daysInMonth(viewYear, viewMonth===0 ? 11 : viewMonth-1)
  const cells     = []
  for (let i=startDay-1; i>=0; i--)   cells.push({ day: prevTotal-i,  cur: false })
  for (let d=1; d<=totalDays; d++)     cells.push({ day: d,            cur: true  })
  while (cells.length % 7 !== 0)       cells.push({ day: cells.length-totalDays-startDay+1, cur: false })

  const isSel   = (day,cur) => cur && selected && selected.getFullYear()===viewYear && selected.getMonth()===viewMonth && selected.getDate()===day
  const isToday = (day,cur) => cur && today.getFullYear()===viewYear && today.getMonth()===viewMonth && today.getDate()===day

  const P = {
    bg:      dark ? '#1e1e2e'                : 'var(--color-surface)',
    surface: dark ? '#252535'                : 'var(--color-surface-2)',
    border:  dark ? 'rgba(255,255,255,0.10)' : 'var(--color-border)',
    text:    dark ? '#fff'                   : 'var(--color-text)',
    muted:   dark ? 'rgba(255,255,255,0.35)' : 'var(--color-text-muted)',
    primary: '#6366f1',
    accent:  '#a78bfa',
  }

  const displayValue = selected
    ? selected.toLocaleDateString(undefined, { month:'short', day:'numeric', year:'numeric' })
    : null

  const dropdown = open ? createPortal(
    <div
      onMouseDown={e => e.stopPropagation()}
      style={{
        position:'fixed', top: pos.top, left: pos.left, width: Math.max(pos.width, 280),
        zIndex: 9999, borderRadius: 12,
        background: P.bg, border:`1px solid ${P.border}`,
        boxShadow:'0 12px 48px rgba(0,0,0,0.8)',
        fontFamily:'var(--font-sans)', overflow:'hidden',
      }}
    >
      <div style={{ height:2, background:`linear-gradient(90deg,${P.primary},${P.accent})` }} />

      {/* Month nav */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 14px 8px' }}>
        <button type="button" onClick={prevMonth} style={navBtn(P)}>‹</button>
        <button type="button" onClick={goToday}
          style={{ background:'none', border:'none', cursor:'pointer', fontFamily:'inherit',
                   fontSize:14, fontWeight:700, color:P.text, padding:'2px 8px', borderRadius:6 }}
          onMouseEnter={e=>e.currentTarget.style.background='rgba(99,102,241,0.12)'}
          onMouseLeave={e=>e.currentTarget.style.background='none'}
        >{MONTHS[viewMonth]} {viewYear}</button>
        <button type="button" onClick={nextMonth} style={navBtn(P)}>›</button>
      </div>

      {/* Day headers */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', padding:'0 10px 4px', gap:2 }}>
        {DAYS.map(d => <div key={d} style={{ textAlign:'center', fontSize:11, fontWeight:700, color:P.muted, padding:'4px 0' }}>{d}</div>)}
      </div>

      {/* Day cells */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', padding:'0 10px 10px', gap:2 }}>
        {cells.map(({ day, cur }, i) => {
          const sel = isSel(day,cur), tod = isToday(day,cur)
          return (
            <button key={i} type="button" disabled={!cur}
              onClick={() => cur && selectDay(day)}
              style={{
                height:32, borderRadius:6, border:'none',
                background: sel ? P.primary : tod ? 'rgba(99,102,241,0.15)' : 'transparent',
                color: sel ? '#fff' : cur ? (tod ? P.accent : P.text) : P.muted,
                fontSize:13, fontWeight: sel?700:tod?600:400,
                cursor: cur?'pointer':'default', fontFamily:'inherit',
                boxShadow: sel?`0 0 0 2px ${P.primary}`:tod?'0 0 0 1px rgba(99,102,241,0.4)':'none',
                opacity: cur?1:0.25,
              }}
              onMouseEnter={e=>{ if(cur&&!sel) e.currentTarget.style.background='rgba(99,102,241,0.18)' }}
              onMouseLeave={e=>{ if(cur&&!sel) e.currentTarget.style.background='transparent' }}
            >{day}</button>
          )
        })}
      </div>

      {/* Footer */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center',
                    padding:'8px 14px 12px', borderTop:`1px solid ${P.border}` }}>
        <button type="button" onClick={() => { onChange(''); setOpen(false) }} style={footerBtn(P)}>Clear</button>
        <button type="button" onClick={() => { goToday(); selectDay(today.getDate()) }}
          style={{ ...footerBtn(P), color:P.accent }}>Today</button>
      </div>
    </div>,
    document.body
  ) : null

  return (
    <div style={{ position:'relative', width:'100%' }}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => open ? setOpen(false) : openPicker()}
        style={{
          width:'100%', height:38, padding:'0 12px',
          display:'flex', alignItems:'center', justifyContent:'space-between',
          borderRadius:8, boxSizing:'border-box',
          border:`1.5px solid ${open ? P.primary : P.border}`,
          background: P.surface,
          color: displayValue ? P.text : P.muted,
          fontSize:14, fontFamily:'var(--font-sans)',
          cursor:'pointer', transition:'border-color 0.15s, box-shadow 0.15s',
          boxShadow: open ? '0 0 0 3px rgba(99,102,241,0.18)' : 'none',
        }}
      >
        <span style={{ display:'flex', alignItems:'center', gap:8 }}>
          <CalIcon color={displayValue ? P.accent : P.muted} />
          {displayValue ?? placeholder}
        </span>
        {displayValue ? (
          <span
            onClick={e => { e.stopPropagation(); onChange('') }}
            style={{ color:P.muted, fontSize:16, lineHeight:1, padding:'2px 4px', borderRadius:4, cursor:'pointer' }}
            onMouseEnter={e=>e.currentTarget.style.color='#f87171'}
            onMouseLeave={e=>e.currentTarget.style.color=P.muted}
          >×</span>
        ) : (
          <ChevronIcon color={P.muted} open={open} />
        )}
      </button>
      {dropdown}
    </div>
  )
}

function navBtn(P) {
  return { width:28, height:28, borderRadius:6, border:`1px solid ${P.border}`, background:'transparent',
           color:P.text, fontSize:18, lineHeight:1, cursor:'pointer',
           display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'inherit' }
}
function footerBtn(P) {
  return { background:'none', border:'none', cursor:'pointer', fontFamily:'inherit',
           fontSize:13, fontWeight:600, color:P.muted, padding:'2px 6px' }
}
function CalIcon({ color }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" style={{ flexShrink:0 }}>
      <rect x="1" y="3" width="14" height="12" rx="2" stroke={color} strokeWidth="1.5"/>
      <path d="M1 7h14" stroke={color} strokeWidth="1.5"/>
      <path d="M5 1v3M11 1v3" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}
function ChevronIcon({ color, open }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
      style={{ flexShrink:0, transform:open?'rotate(180deg)':'none', transition:'transform 0.2s' }}>
      <path d="M2 4l4 4 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}
