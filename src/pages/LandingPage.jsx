import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import LoginPanel from '../components/LoginPanel'
import logoMark from '../assets/logo/monartech-mark.svg'

// Hardcoded palette — no CSS variables so nothing can silently fail
const C = {
  bg:          '#0a0a0f',
  surface:     '#111118',
  surface2:    '#1a1a24',
  border:      'rgba(255,255,255,0.08)',
  borderHover: 'rgba(255,255,255,0.16)',
  primary:     '#6366f1',
  primaryHov:  '#7c7ff5',
  primaryDim:  'rgba(99,102,241,0.15)',
  accent:      '#a78bfa',
  text:        '#ffffff',
  textSub:     'rgba(255,255,255,0.65)',
  textMuted:   'rgba(255,255,255,0.35)',
  font:        "'Plus Jakarta Sans', system-ui, sans-serif",
}

export default function LandingPage() {
  const [panelOpen, setPanelOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const open = () => setPanelOpen(true)

  // Open the auth panel when redirected here with openPanel flag
  useEffect(() => {
    if (location.state?.openPanel) {
      setPanelOpen(true)
      // Clear the state so re-renders don't re-open
      navigate('/', { replace: true, state: {} })
    }
  }, [location.state?.openPanel])

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: C.font, color: C.text }}>
      <Navbar onOpen={open} />
      <Hero onOpen={open} />
      <Features />
      <HowItWorks />
      <Cta onOpen={open} />
      <Footer />
      <LoginPanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        onSuccess={() => setPanelOpen(false)}
      />
    </div>
  )
}

/* ─── Navbar ─────────────────────────────────────────────── */
function Navbar({ onOpen }) {
  const [hov, setHov] = useState(null)
  const links = ['Features', 'How it works', 'Pricing']

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 30,
      height: 64, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 48px',
      background: 'rgba(20,20,32,0.95)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${C.border}`,
      fontFamily: C.font,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <img src={logoMark} alt="Monartech" style={{ width: 34, height: 34 }} />
        <span style={{ fontSize: 16, fontWeight: 700, color: C.text, letterSpacing: '-0.3px' }}>Monartech</span>
      </div>

      {/* Nav links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {links.map(l => (
          <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`}
            onMouseEnter={() => setHov(l)} onMouseLeave={() => setHov(null)}
            style={{
              padding: '7px 16px', borderRadius: 8, textDecoration: 'none',
              fontSize: 14, fontWeight: 500,
              color: hov === l ? C.text : C.textSub,
              background: hov === l ? 'rgba(255,255,255,0.07)' : 'transparent',
              transition: 'all 0.15s',
            }}>{l}</a>
        ))}
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Btn variant="ghost" onClick={onOpen}>Sign in</Btn>
        <Btn variant="primary" onClick={onOpen}>Get started free</Btn>
      </div>
    </nav>
  )
}

/* ─── Binary Rain ────────────────────────────────────────── */
function BinaryRain() {
  const containerRef = useRef(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const COLORS  = ['#6366f1', '#a78bfa', '#818cf8']
    const CHARS   = ['0', '1']
    const COUNT   = 40
    const digits  = []

    function rand(min, max) { return Math.random() * (max - min) + min }

    for (let i = 0; i < COUNT; i++) {
      const el = document.createElement('span')
      el.textContent   = CHARS[Math.floor(Math.random() * CHARS.length)]
      el.style.cssText = `
        position: absolute;
        font-family: 'Plus Jakarta Sans', monospace;
        font-size: ${rand(10, 18)}px;
        font-weight: 700;
        color: ${COLORS[Math.floor(Math.random() * COLORS.length)]};
        opacity: 0;
        left: ${rand(0, 100)}%;
        top: ${rand(-20, 80)}%;
        pointer-events: none;
        user-select: none;
        animation: digit-float ${rand(5, 12)}s linear ${rand(0, 8)}s infinite;
        text-shadow: 0 0 8px currentColor;
      `
      container.appendChild(el)
      digits.push(el)
    }

    return () => { digits.forEach(el => el.remove()) }
  }, [])

  return (
    <>
      {/* Crosshatch grid base */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: 'linear-gradient(rgba(99,102,241,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.08) 1px, transparent 1px)',
        backgroundSize: '50px 50px',
        WebkitMaskImage: 'radial-gradient(ellipse 90% 80% at 50% 10%, black 30%, transparent 100%)',
        maskImage: 'radial-gradient(ellipse 90% 80% at 50% 10%, black 30%, transparent 100%)',
      }} />

      {/* Floating digit container */}
      <div
        ref={containerRef}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}
      />
    </>
  )
}
function Hero({ onOpen }) {
  return (
    <section style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      padding: '120px 40px 80px', textAlign: 'center',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Binary rain + crosshatch grid */}
      <BinaryRain />

      <div style={{ position: 'relative', maxWidth: 760, width: '100%' }}>
        {/* Badge */}
        <div className="animate-fade-in-up" style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 14px', borderRadius: 100,
          border: `1px solid ${C.border}`, background: C.surface,
          fontSize: 12, fontWeight: 500, color: C.accent, marginBottom: 28,
        }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.accent, boxShadow: `0 0 8px ${C.accent}` }} />
          Now in public beta — free to try
        </div>

        {/* Headline */}
        <h1 className="animate-fade-in-up animate-delay-100" style={{
          margin: '0 0 20px', lineHeight: 1.1, letterSpacing: '-2px',
          fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 800, color: C.text,
        }}>
          Manage projects,<br />
          <span style={{
            background: 'linear-gradient(135deg, #6366f1, #a78bfa, #818cf8)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
          }}>not complexity.</span>
        </h1>

        {/* Sub */}
        <p className="animate-fade-in-up animate-delay-200" style={{
          margin: '0 auto 40px', maxWidth: 520,
          fontSize: 'clamp(16px, 2vw, 19px)', lineHeight: 1.65, color: C.textSub,
        }}>
          Monartech brings your team, plans, and tasks into one place —
          with workgroups, role-based access, and smart task tracking built in.
        </p>

        {/* CTAs */}
        <div className="animate-fade-in-up animate-delay-300"
          style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Btn variant="primary" size="lg" onClick={onOpen}>Start for free →</Btn>
          <Btn variant="outline" size="lg" href="#how-it-works">See how it works</Btn>
        </div>

        {/* App preview placeholder */}
        <div className="animate-fade-in-up animate-delay-400" style={{
          marginTop: 64, borderRadius: 16,
          border: `1px solid ${C.border}`, background: C.surface,
          overflow: 'hidden', boxShadow: '0 4px 48px rgba(0,0,0,0.5)',
        }}>
          <div style={{
            height: 40, background: C.surface2,
            borderBottom: `1px solid ${C.border}`,
            display: 'flex', alignItems: 'center', padding: '0 16px', gap: 8,
          }}>
            {['#ef4444','#f59e0b','#22c55e'].map(c => (
              <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.8 }} />
            ))}
            <div style={{ flex: 1, height: 22, borderRadius: 6, background: C.border, margin: '0 12px' }} />
          </div>
          <div style={{ height: 320, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: C.textMuted, fontSize: 13, fontStyle: 'italic' }}>
              App screenshot coming soon
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Features ───────────────────────────────────────────── */
const FEATURES = [
  { icon: '⬡', title: 'Workgroups',        desc: 'Organise teams with owner, admin, and member roles. Every workgroup is its own permission boundary.' },
  { icon: '◫', title: 'Plans & Boards',    desc: 'Create boards inside a workgroup or keep them personal. Share with specific people in one click.' },
  { icon: '✓', title: 'Smart Tasks',       desc: 'Assign tasks, set priority, track completion with automatic who/when timestamping.' },
  { icon: '⚿', title: 'Role-based Access', desc: 'Granular permissions at every level. Assignees can only update status — owners control everything.' },
  { icon: '⟳', title: 'Soft Delete',       desc: 'Nothing is permanently lost. Deleted plans and tasks can be restored by the right person.' },
  { icon: '⚡', title: 'JWT Auth',          desc: 'Secure token-based auth with auto-refresh, email verification, and password reset.' },
]

function Features() {
  return (
    <section id="features" style={{ padding: '100px 48px', maxWidth: 1100, margin: '0 auto' }}>
      <SectionLabel>Features</SectionLabel>
      <SectionTitle>Everything you need,<br />nothing you don't</SectionTitle>
      <SectionSub>Built for real workflows — from solo projects to multi-team collaboration.</SectionSub>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: 20, marginTop: 56,
      }}>
        {FEATURES.map((f, i) => <FeatureCard key={i} {...f} />)}
      </div>
    </section>
  )
}

function FeatureCard({ icon, title, desc }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding: 28, borderRadius: 16,
        border: `1px solid ${hov ? C.borderHover : C.border}`,
        background: hov ? C.surface : 'transparent',
        transition: 'all 0.2s', cursor: 'default',
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 12, marginBottom: 16,
        background: hov ? 'rgba(99,102,241,0.15)' : C.surface2,
        border: `1px solid ${hov ? C.primary : C.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 20, transition: 'all 0.2s',
      }}>{icon}</div>
      <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: C.text, letterSpacing: '-0.3px' }}>{title}</h3>
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: C.textSub }}>{desc}</p>
    </div>
  )
}

/* ─── How It Works ───────────────────────────────────────── */
const STEPS = [
  { n: '01', title: 'Create a Workgroup',  desc: 'Set up a team space and invite members. Assign roles — admin or member — to control who can do what.' },
  { n: '02', title: 'Build your Plans',    desc: 'Create project boards inside the workgroup or keep personal plans. Share with specific people.' },
  { n: '03', title: 'Manage Tasks',        desc: 'Add tasks with priority, assign teammates, and track progress. Completion auto-records who did it and when.' },
]

function HowItWorks() {
  return (
    <section id="how-it-works" style={{
      padding: '100px 48px',
      borderTop: `1px solid ${C.border}`,
      borderBottom: `1px solid ${C.border}`,
      background: C.surface,
    }}>
      <div style={{ maxWidth: 860, margin: '0 auto' }}>
        <SectionLabel>How it works</SectionLabel>
        <SectionTitle>Up and running in minutes</SectionTitle>

        <div style={{ marginTop: 56 }}>
          {STEPS.map((s, i) => <StepRow key={i} {...s} last={i === STEPS.length - 1} />)}
        </div>
      </div>
    </section>
  )
}

function StepRow({ n, title, desc, last }) {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', gap: 28, alignItems: 'flex-start',
        padding: '28px 24px', borderRadius: 16,
        background: hov ? C.surface2 : 'transparent',
        transition: 'background 0.2s',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: hov ? 'linear-gradient(135deg, #6366f1, #a78bfa)' : C.surface2,
          border: `1px solid ${hov ? 'transparent' : C.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 800,
          color: hov ? '#fff' : C.textSub,
          transition: 'all 0.2s',
        }}>{n}</div>
        {!last && <div style={{ width: 1, height: 28, background: C.border, margin: '6px 0' }} />}
      </div>
      <div style={{ paddingTop: 10 }}>
        <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 700, color: C.text, letterSpacing: '-0.3px' }}>{title}</h3>
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: C.textSub, maxWidth: 540 }}>{desc}</p>
      </div>
    </div>
  )
}

/* ─── CTA ────────────────────────────────────────────────── */
function Cta({ onOpen }) {
  return (
    <section style={{ padding: '100px 48px', textAlign: 'center' }}>
      <div style={{
        maxWidth: 600, margin: '0 auto', padding: '60px 48px',
        borderRadius: 24, border: `1px solid ${C.border}`,
        background: C.surface, position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: '70%', height: 1,
          background: 'linear-gradient(90deg, transparent, #6366f1, transparent)',
        }} />
        <h2 style={{ margin: '0 0 14px', fontSize: 'clamp(26px, 4vw, 38px)', fontWeight: 800, color: C.text, letterSpacing: '-0.8px' }}>
          Ready to get organised?
        </h2>
        <p style={{ margin: '0 0 36px', fontSize: 16, color: C.textSub, lineHeight: 1.65 }}>
          Join Monartech and take control of your projects, tasks, and team — all in one place.
        </p>
        <Btn variant="primary" size="lg" onClick={onOpen}>Create your free account →</Btn>
      </div>
    </section>
  )
}

/* ─── Footer ─────────────────────────────────────────────── */
function Footer() {
  return (
    <footer style={{
      borderTop: `1px solid ${C.border}`, padding: '28px 48px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: 16, fontFamily: C.font,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <img src={logoMark} alt="Monartech" style={{ width: 26, height: 26 }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: C.textSub }}>Monartech</span>
      </div>
      <p style={{ margin: 0, fontSize: 13, color: C.textMuted }}>
        © {new Date().getFullYear()} Monartech. All rights reserved.
      </p>
      <div style={{ display: 'flex', gap: 20 }}>
        {['Privacy', 'Terms', 'Contact'].map(l => (
          <a key={l} href="#" style={{ fontSize: 13, color: C.textMuted, textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = C.textSub}
            onMouseLeave={e => e.currentTarget.style.color = C.textMuted}
          >{l}</a>
        ))}
      </div>
    </footer>
  )
}

/* ─── Shared UI primitives ───────────────────────────────── */
function Btn({ variant = 'primary', size = 'md', onClick, href, children }) {
  const [hov, setHov] = useState(false)

  const base = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: size === 'lg' ? 12 : 9,
    fontSize: size === 'lg' ? 15 : 14,
    fontWeight: 600, cursor: 'pointer', textDecoration: 'none',
    padding: size === 'lg' ? '13px 28px' : '8px 18px',
    fontFamily: C.font, border: 'none', transition: 'all 0.15s',
    lineHeight: 1,
  }

  const styles = {
    primary: {
      background: hov ? C.primaryHov : C.primary,
      color: '#fff',
      boxShadow: hov ? `0 0 28px rgba(99,102,241,0.35)` : `0 0 16px rgba(99,102,241,0.2)`,
    },
    ghost: {
      background: hov ? 'rgba(255,255,255,0.07)' : 'transparent',
      color: hov ? C.text : C.textSub,
      border: `1px solid ${hov ? C.borderHover : C.border}`,
    },
    outline: {
      background: hov ? 'rgba(255,255,255,0.05)' : 'transparent',
      color: hov ? C.text : C.textSub,
      border: `1px solid ${hov ? C.borderHover : C.border}`,
    },
  }

  const props = {
    onMouseEnter: () => setHov(true),
    onMouseLeave: () => setHov(false),
    style: { ...base, ...styles[variant] },
  }

  if (href) return <a href={href} {...props}>{children}</a>
  return <button type="button" onClick={onClick} {...props}>{children}</button>
}

function SectionLabel({ children }) {
  return (
    <p style={{ margin: '0 0 12px', fontSize: 12, fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: C.primary, textAlign: 'center' }}>
      {children}
    </p>
  )
}

function SectionTitle({ children }) {
  return (
    <h2 style={{ margin: '0 0 16px', fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 800, letterSpacing: '-1px', color: C.text, textAlign: 'center', lineHeight: 1.15 }}>
      {children}
    </h2>
  )
}

function SectionSub({ children }) {
  return (
    <p style={{ margin: '0 auto', maxWidth: 480, fontSize: 16, color: C.textSub, textAlign: 'center', lineHeight: 1.65 }}>
      {children}
    </p>
  )
}
