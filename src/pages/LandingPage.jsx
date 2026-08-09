import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import LoginPanel from '../components/LoginPanel'
import logoMark from '../assets/logo/monartech-mark.svg'
import { useTheme } from '../contexts/ThemeContext'

/* ─── Theme-aware palettes ───────────────────────────────── */
const IMPERIAL = {
  bg:          '#0c0612',
  surface:     '#160a21',
  surface2:    'rgba(26,15,36,0.6)',
  border:      'rgba(223,207,190,0.12)',
  borderHover: 'rgba(223,207,190,0.30)',
  accent:      '#dfcfbe',   /* gold */
  accentMuted: '#c2ab91',
  text:        '#ffffff',
  textSub:     'rgba(255,255,255,0.65)',
  textMuted:   'rgba(255,255,255,0.35)',
  font:        "'Plus Jakarta Sans', system-ui, sans-serif",
  gradHero:    'linear-gradient(135deg, #6366f1 0%, #a78bfa 50%, #dfcfbe 100%)',
  gradBtn:     'linear-gradient(180deg, #321c40 0%, #170b21 100%)',
  gradBtnHov:  'linear-gradient(180deg, #422654 0%, #21102e 100%)',
}

const MODERN = {
  bg:          '#0a0a0f',
  surface:     '#111118',
  surface2:    '#1a1a24',
  border:      '#2a2a38',
  borderHover: '#3a3a50',
  accent:      '#6366f1',
  accentMuted: '#818cf8',
  text:        '#f0f0f8',
  textSub:     '#8b8ba8',
  textMuted:   '#5a5a70',
  font:        "'Plus Jakarta Sans', system-ui, sans-serif",
  gradHero:    'linear-gradient(135deg, #6366f1 0%, #a78bfa 50%, #818cf8 100%)',
  gradBtn:     '#6366f1',
  gradBtnHov:  '#7c7ff5',
}

export default function LandingPage() {
  const [panelOpen,    setPanelOpen]    = useState(false)
  const [panelMode,    setPanelMode]    = useState('login')
  const location = useLocation()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const C = theme === 'modern' ? MODERN : IMPERIAL

  // Sign in — opens login form
  const openLogin    = () => { setPanelMode('login');    setPanelOpen(true) }
  // Get started / Register — opens register form
  const openRegister = () => { setPanelMode('register'); setPanelOpen(true) }

  useEffect(() => {
    if (location.state?.openPanel) {
      setPanelMode(location.state.mode ?? 'login')
      setPanelOpen(true)
      navigate('/', { replace: true, state: {} })
    }
  }, [location.state?.openPanel])

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: C.font, color: C.text,
      backgroundImage: theme === 'imperial'
        ? 'radial-gradient(circle at 80% 80%, #2f1238 0%, #0c0612 70%)'
        : 'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(99,102,241,0.12) 0%, transparent 70%)',
    }}>
      <Navbar onSignIn={openLogin} onGetStarted={openRegister} C={C} theme={theme} onToggleTheme={toggleTheme} />
      <Hero onGetStarted={openRegister} C={C} theme={theme} />
      <Features C={C} theme={theme} />
      <HowItWorks C={C} theme={theme} />
      <Cta onGetStarted={openRegister} C={C} theme={theme} />
      <Footer C={C} />
      <LoginPanel
        isOpen={panelOpen}
        onClose={() => setPanelOpen(false)}
        onSuccess={() => setPanelOpen(false)}
        initialMode={panelMode}
      />
    </div>
  )
}

/* ─── Navbar ─────────────────────────────────────────────── */
function Navbar({ onSignIn, onGetStarted, C, theme, onToggleTheme }) {
  const [hov,        setHov]        = useState(null)
  const [menuOpen,   setMenuOpen]   = useState(false)
  const isImperial = theme === 'imperial'
  const links = ['Features', 'How it works']

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 30,
      height: 64, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 48px',
      background: isImperial ? 'rgba(12,6,18,0.92)' : 'rgba(10,10,15,0.92)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${C.border}`,
      fontFamily: C.font,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
        <img src={logoMark} alt="Monartech" style={{ width: 34, height: 34 }} />
        <span style={{
          fontSize: 15, fontWeight: 700, color: C.accent,
          letterSpacing: isImperial ? '2px' : '-0.3px',
          textTransform: isImperial ? 'uppercase' : 'none',
        }}>Monartech</span>
      </div>

      {/* Nav links — hidden on mobile */}
      <div className="navbar-links" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {links.map(l => (
          <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`}
            onMouseEnter={() => setHov(l)} onMouseLeave={() => setHov(null)}
            style={{
              padding: '7px 16px', borderRadius: isImperial ? 4 : 8,
              textDecoration: 'none',
              fontSize: isImperial ? 12 : 14,
              fontWeight: 500,
              letterSpacing: isImperial ? '1px' : '0',
              textTransform: isImperial ? 'uppercase' : 'none',
              color: hov === l ? C.accent : C.textSub,
              background: hov === l ? (isImperial ? 'rgba(223,207,190,0.06)' : 'rgba(255,255,255,0.07)') : 'transparent',
              transition: 'all 0.15s',
            }}>{l}</a>
        ))}
      </div>

      {/* Right side — theme toggle + auth (hidden on mobile) */}
      <div className="navbar-ctas" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        {/* Theme toggle — issue #15: clearer label */}
        <button
          onClick={onToggleTheme}
          title={isImperial ? 'Switch to Modern theme' : 'Switch to Imperial theme'}
          style={{
            height: 30, padding: '0 10px', borderRadius: isImperial ? 4 : 6,
            border: `1px solid ${isImperial ? 'rgba(223,207,190,0.25)' : '#2a2a38'}`,
            background: isImperial ? 'rgba(223,207,190,0.06)' : 'rgba(99,102,241,0.1)',
            color: isImperial ? '#c2ab91' : '#818cf8',
            fontSize: 11, fontWeight: 700,
            letterSpacing: isImperial ? '0.5px' : '0',
            textTransform: isImperial ? 'uppercase' : 'none',
            cursor: 'pointer', fontFamily: C.font,
            display: 'flex', alignItems: 'center', gap: 5,
            transition: 'all 0.2s',
          }}
        >
          {/* Show which theme you'll switch TO */}
          {isImperial ? '◈ Modern' : '⚜ Imperial'}
        </button>
        <Btn variant="ghost"   onClick={onSignIn}     C={C} theme={theme}>Sign in</Btn>
        <Btn variant="primary" onClick={onGetStarted} C={C} theme={theme}>Get started</Btn>
      </div>

      {/* Hamburger — mobile only */}
      <button
        className="navbar-hamburger"
        onClick={() => setMenuOpen(v => !v)}
        aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        style={{
          display: 'none', /* shown via CSS media query */
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 5,
          width: 36, height: 36, background: 'transparent',
          border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer',
        }}
      >
        <span style={{ width: 18, height: 1.5, background: C.textSub, display: 'block', transition: 'all 0.2s',
          transform: menuOpen ? 'rotate(45deg) translate(5px, 5px)' : 'none' }} />
        <span style={{ width: 18, height: 1.5, background: C.textSub, display: 'block', transition: 'all 0.2s',
          opacity: menuOpen ? 0 : 1 }} />
        <span style={{ width: 18, height: 1.5, background: C.textSub, display: 'block', transition: 'all 0.2s',
          transform: menuOpen ? 'rotate(-45deg) translate(5px, -5px)' : 'none' }} />
      </button>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{
          position: 'absolute', top: 64, left: 0, right: 0,
          background: isImperial ? 'rgba(12,6,18,0.98)' : 'rgba(10,10,15,0.98)',
          borderBottom: `1px solid ${C.border}`,
          backdropFilter: 'blur(20px)',
          padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12,
        }}>
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g,'-')}`}
              onClick={() => setMenuOpen(false)}
              style={{
                textDecoration: 'none', fontSize: 15, fontWeight: 500, color: C.textSub,
                padding: '8px 0',
              }}>{l}</a>
          ))}
          <div style={{ height: 1, background: C.border }} />
          <button onClick={onToggleTheme} style={{
            textAlign: 'left', background: 'transparent', border: 'none',
            color: isImperial ? '#c2ab91' : '#818cf8', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', padding: '4px 0', fontFamily: C.font,
          }}>
            Switch to {isImperial ? 'Modern' : 'Imperial'} theme
          </button>
          <div style={{ display: 'flex', gap: 10, paddingBottom: 4 }}>
            <Btn variant="ghost"   onClick={() => { onSignIn();     setMenuOpen(false) }} C={C} theme={theme}>Sign in</Btn>
            <Btn variant="primary" onClick={() => { onGetStarted(); setMenuOpen(false) }} C={C} theme={theme}>Get started</Btn>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 767px) {
          .navbar-links, .navbar-ctas { display: none !important; }
          .navbar-hamburger { display: flex !important; }
          nav { padding: 0 20px !important; }
        }
      `}</style>
    </nav>
  )
}

/* ─── Binary Rain (imperial) / Grid (modern) ─────────────── */
function BinaryRain({ theme }) {
  const containerRef = useRef(null)
  const isImperial = theme === 'imperial'

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const COLORS = isImperial
      ? ['#dfcfbe', '#c2ab91', 'rgba(223,207,190,0.5)']
      : ['#6366f1', '#a78bfa', '#818cf8']
    const CHARS = ['0', '1']
    const COUNT = 40
    const digits = []
    function rand(min, max) { return Math.random() * (max - min) + min }
    for (let i = 0; i < COUNT; i++) {
      const el = document.createElement('span')
      el.textContent = CHARS[Math.floor(Math.random() * CHARS.length)]
      el.style.cssText = `
        position:absolute;font-family:'Plus Jakarta Sans',monospace;
        font-size:${rand(11,22)}px;font-weight:700;
        color:${COLORS[Math.floor(Math.random()*COLORS.length)]};
        opacity:0;left:${rand(0,100)}%;top:${rand(-10,90)}%;
        pointer-events:none;user-select:none;
        animation:digit-float ${rand(4,9)}s linear ${rand(0,4)}s infinite;
        text-shadow:0 0 10px currentColor;
      `
      container.appendChild(el)
      digits.push(el)
    }
    return () => { digits.forEach(el => el.remove()) }
  }, [isImperial])

  const gridColor = isImperial ? 'rgba(223,207,190,0.05)' : 'rgba(99,102,241,0.08)'

  return (
    <>
      <div style={{
        position:'absolute', inset:0, pointerEvents:'none',
        backgroundImage: `linear-gradient(${gridColor} 1px, transparent 1px), linear-gradient(90deg, ${gridColor} 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
        WebkitMaskImage: 'radial-gradient(ellipse 90% 80% at 50% 10%, black 30%, transparent 100%)',
        maskImage: 'radial-gradient(ellipse 90% 80% at 50% 10%, black 30%, transparent 100%)',
      }} />
      <div ref={containerRef} style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }} />
    </>
  )
}

/* ─── Hero ───────────────────────────────────────────────── */
function Hero({ onGetStarted, C, theme }) {
  const isImperial = theme === 'imperial'
  return (
    <section style={{
      minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center',
      padding:'120px 40px 80px', textAlign:'center',
      position:'relative', overflow:'hidden',
    }}>
      <BinaryRain theme={theme} />

      {/* Imperial vignette border */}
      {isImperial && (
        <div style={{
          position:'absolute', top:20, left:20, right:20, bottom:20,
          border:'1px solid rgba(223,207,190,0.06)',
          pointerEvents:'none', zIndex:0,
        }} />
      )}

      <div style={{ position:'relative', maxWidth:760, width:'100%', zIndex:1 }}>
        {/* Badge */}
        <div className="animate-fade-in-up" style={{
          display:'inline-flex', alignItems:'center', gap:8,
          padding:'6px 14px', borderRadius: isImperial ? 4 : 100,
          border:`1px solid ${C.border}`,
          background: isImperial ? 'rgba(26,15,36,0.8)' : C.surface,
          fontSize:12, fontWeight:500,
          color: isImperial ? C.accentMuted : C.accentMuted,
          letterSpacing: isImperial ? '1px' : '0',
          textTransform: isImperial ? 'uppercase' : 'none',
          marginBottom:28,
        }}>
          <span style={{ width:6, height:6, borderRadius:'50%', background:C.accent, boxShadow:`0 0 8px ${C.accent}` }} />
          {isImperial ? '⚜ Now in public beta' : 'Now in public beta — free to try'}
        </div>

        {/* Headline */}
        <h1 className="animate-fade-in-up animate-delay-100" style={{
          margin:'0 0 20px', lineHeight:1.1,
          letterSpacing: isImperial ? '-0.5px' : '-2px',
          fontSize:'clamp(40px, 6vw, 72px)', fontWeight:800,
          color: isImperial ? '#dfcfbe' : C.text,
        }}>
          {isImperial ? (
            <>The legacy of<br />
            <span className="gradient-text-imperial">
              Monartech
            </span></>
          ) : (
            <>Manage projects,<br />
            <span className="gradient-text">
              not complexity.
            </span></>
          )}
        </h1>

        {/* Sub */}
        <p className="animate-fade-in-up animate-delay-200" style={{
          margin:'0 auto 40px', maxWidth:520,
          fontSize:'clamp(16px, 2vw, 19px)', lineHeight:1.65, color:C.textSub,
        }}>
          {isImperial
            ? 'A sovereign platform where heritage meets innovation. Orchestrate your workgroups, plans, and tasks with imperial precision.'
            : 'Stop juggling spreadsheets, chats, and sticky notes. Monartech gives your team one place to plan work, assign tasks, and actually get things done.'}
        </p>

        {/* CTAs */}
        <div className="animate-fade-in-up animate-delay-300"
          style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}>
          <Btn variant="primary" size="lg" onClick={onGetStarted} C={C} theme={theme}>
            {isImperial ? '⚜ Enter the Vault' : 'Start for free →'}
          </Btn>
          <Btn variant="outline" size="lg" href="#how-it-works" C={C} theme={theme}>
            {isImperial ? 'See the Chronicle' : 'See how it works'}
          </Btn>
        </div>

        {/* App preview */}
        <div className="animate-fade-in-up animate-delay-400" style={{
          marginTop:64, borderRadius: isImperial ? 6 : 16,
          border:`1px solid ${C.border}`,
          background: isImperial ? 'linear-gradient(180deg, rgba(25,14,36,0.7) 0%, rgba(13,6,20,0.9) 100%)' : C.surface,
          overflow:'hidden',
          boxShadow: isImperial ? '0 25px 50px -12px rgba(0,0,0,0.8)' : '0 4px 48px rgba(0,0,0,0.5)',
        }}>
          <div style={{
            height:40,
            background: isImperial ? 'rgba(26,15,36,0.6)' : C.surface2,
            borderBottom:`1px solid ${C.border}`,
            display:'flex', alignItems:'center', padding:'0 16px', gap:8,
          }}>
            {['#ef4444','#f59e0b','#22c55e'].map(c => (
              <div key={c} style={{ width:10, height:10, borderRadius:'50%', background:c, opacity:0.8 }} />
            ))}
            <div style={{ flex:1, height:22, borderRadius:6, background:C.border, margin:'0 12px' }} />
          </div>
          <div style={{ height:320, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ color:C.textMuted, fontSize:13, fontStyle:'italic' }}>
              {isImperial ? '— App preview coming soon —' : 'App screenshot coming soon'}
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ─── Features ───────────────────────────────────────────── */
const FEATURES = [
  { icon:'⬡', title:'Bring your team together',  desc:'Create a workspace for your team, invite people, and decide who gets to do what — all in a few clicks. No IT setup required.' },
  { icon:'◫', title:'Your projects, your boards', desc:'Build a board for every project — or keep one just for yourself. Drag it from idea to done, your way.' },
  { icon:'✓', title:'Never lose track of a task', desc:'Assign work to teammates, set a due date, add a priority. When it\'s done, you\'ll know exactly who did it and when.' },
  { icon:'🔒', title:'Control who can do what',      desc:'Invite someone as a viewer, a contributor, or a full member. Everyone sees what they need — nothing more, nothing less.' },
  { icon:'↩', title:'Start solo, share when ready', desc:'Use Monartech just for yourself — plan your week, track your own goals. When you\'re ready, share a board with a friend or teammate in one click.' },
  { icon:'📎', title:'Everything in one place',   desc:'Attach files, leave checklists, add descriptions — everything about a task lives on the task. No more hunting through emails.' },
]

function Features({ C, theme }) {
  const isImperial = theme === 'imperial'
  return (
    <section id="features" style={{ padding:'100px 48px', maxWidth:1100, margin:'0 auto' }}>
      <SectionLabel C={C} theme={theme}>Features</SectionLabel>
      <SectionTitle C={C}>
        {isImperial ? <>Instruments of<br />the Imperial Order</> : <>What you can do<br />with Monartech</>}
      </SectionTitle>
      <SectionSub C={C}>
        {isImperial
          ? 'Crafted for sovereign workflows — from personal estates to multi-house collaborations.'
          : 'Whether you\'re managing a side project solo or coordinating a whole team — Monartech keeps everyone on the same page.'}
      </SectionSub>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:20, marginTop:56 }}>
        {FEATURES.map((f, i) => <FeatureCard key={i} {...f} C={C} theme={theme} />)}
      </div>
    </section>
  )
}

function FeatureCard({ icon, title, desc, C, theme }) {
  const [hov, setHov] = useState(false)
  const isImperial = theme === 'imperial'
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        padding:28, borderRadius: isImperial ? 6 : 16,
        border:`1px solid ${hov ? C.borderHover : C.border}`,
        background: hov
          ? (isImperial ? 'linear-gradient(180deg, rgba(25,14,36,0.7) 0%, rgba(13,6,20,0.9) 100%)' : C.surface)
          : 'transparent',
        transition:'all 0.2s', cursor:'default',
        boxShadow: hov && isImperial ? 'inset 0 1px 0 rgba(223,207,190,0.08)' : 'none',
      }}
    >
      <div style={{
        width:44, height:44, borderRadius: isImperial ? 4 : 12, marginBottom:16,
        background: hov
          ? (isImperial ? 'rgba(223,207,190,0.1)' : 'rgba(99,102,241,0.15)')
          : C.surface2,
        border:`1px solid ${hov ? C.accent : C.border}`,
        display:'flex', alignItems:'center', justifyContent:'center',
        fontSize:20, transition:'all 0.2s',
        color: hov ? C.accent : C.textSub,
      }}>{icon}</div>
      <h3 style={{
        margin:'0 0 8px', fontSize:16, fontWeight:700, color:C.text,
        letterSpacing: isImperial ? '0.3px' : '-0.3px',
      }}>{title}</h3>
      <p style={{ margin:0, fontSize:14, lineHeight:1.65, color:C.textSub }}>{desc}</p>
    </div>
  )
}

/* ─── How It Works ───────────────────────────────────────── */
const STEPS = [
  { n:'01', title:'Set up your workspace in 2 minutes', desc:'Sign up, create a workspace, and invite your team. Assign who\'s an admin and who\'s a member — you\'re already more organised than a group chat.' },
  { n:'02', title:'Create a board for what you\'re working on', desc:'Think of a board like a project. Add columns for your stages — To Do, In Progress, Done — or whatever makes sense for your work.' },
  { n:'03', title:'Add tasks and get things moving',   desc:'Create tasks, assign them to people, set a deadline and priority. Watch your team actually move work forward — and know exactly who\'s doing what.' },
]

function HowItWorks({ C, theme }) {
  const isImperial = theme === 'imperial'
  return (
    <section id="how-it-works" style={{
      padding:'100px 48px',
      borderTop:`1px solid ${C.border}`,
      borderBottom:`1px solid ${C.border}`,
      background: isImperial
        ? 'linear-gradient(180deg, rgba(22,10,33,0.6) 0%, rgba(12,6,18,0.8) 100%)'
        : C.surface,
    }}>
      <div style={{ maxWidth:860, margin:'0 auto' }}>
        <SectionLabel C={C} theme={theme}>{isImperial ? 'The Chronicle' : 'How it works'}</SectionLabel>
        <SectionTitle C={C}>{isImperial ? 'Three pillars of the Order' : 'Up and running in 3 steps'}</SectionTitle>
        <div style={{ marginTop:56 }}>
          {STEPS.map((s, i) => <StepRow key={i} {...s} last={i===STEPS.length-1} C={C} theme={theme} />)}
        </div>
      </div>
    </section>
  )
}

function StepRow({ n, title, desc, last, C, theme }) {
  const [hov, setHov] = useState(false)
  const isImperial = theme === 'imperial'
  return (
    <div
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display:'flex', gap:28, alignItems:'flex-start',
        padding:'28px 24px', borderRadius: isImperial ? 6 : 16,
        background: hov
          ? (isImperial ? 'rgba(223,207,190,0.04)' : C.surface2)
          : 'transparent',
        border: hov && isImperial ? `1px solid ${C.border}` : '1px solid transparent',
        transition:'all 0.2s',
      }}
    >
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', flexShrink:0 }}>
        <div style={{
          width:48, height:48, borderRadius: isImperial ? 4 : 12,
          background: hov
            ? (isImperial ? 'linear-gradient(135deg, #321c40, #170b21)' : 'linear-gradient(135deg, #6366f1, #a78bfa)')
            : C.surface2,
          border:`1px solid ${hov ? (isImperial ? C.accentMuted : 'transparent') : C.border}`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:13, fontWeight:800,
          color: hov ? (isImperial ? C.accent : '#fff') : C.textSub,
          transition:'all 0.2s',
          boxShadow: hov && isImperial ? `inset 0 1px 0 rgba(255,255,255,0.08)` : 'none',
        }}>{n}</div>
        {!last && <div style={{ width:1, height:28, background:C.border, margin:'6px 0' }} />}
      </div>
      <div style={{ paddingTop:10 }}>
        <h3 style={{ margin:'0 0 8px', fontSize:18, fontWeight:700, color:C.text, letterSpacing: isImperial ? '0.2px' : '-0.3px' }}>{title}</h3>
        <p style={{ margin:0, fontSize:15, lineHeight:1.65, color:C.textSub, maxWidth:540 }}>{desc}</p>
      </div>
    </div>
  )
}

/* ─── CTA ────────────────────────────────────────────────── */
function Cta({ onGetStarted, C, theme }) {
  const isImperial = theme === 'imperial'
  return (
    <section style={{ padding:'100px 48px', textAlign:'center' }}>
      <div style={{
        maxWidth:600, margin:'0 auto', padding:'60px 48px',
        borderRadius: isImperial ? 6 : 24,
        border:`1px solid ${C.borderHover}`,
        background: isImperial
          ? 'linear-gradient(180deg, rgba(25,14,36,0.8) 0%, rgba(13,6,20,0.95) 100%)'
          : C.surface,
        position:'relative', overflow:'hidden',
        boxShadow: isImperial ? 'inset 0 1px 0 rgba(223,207,190,0.08), 0 25px 50px -12px rgba(0,0,0,0.8)' : 'none',
      }}>
        {/* Top divider line */}
        <div style={{
          position:'absolute', top:0, left:'50%', transform:'translateX(-50%)',
          width:'70%', height: isImperial ? 1 : 1,
          background: isImperial
            ? 'linear-gradient(90deg, transparent, rgba(223,207,190,0.4), transparent)'
            : 'linear-gradient(90deg, transparent, #6366f1, transparent)',
        }} />
        {/* Imperial crest */}
        {isImperial && (
          <div style={{ fontSize:28, color:C.accent, marginBottom:16, opacity:0.7 }}>⚜</div>
        )}
        <h2 style={{
          margin:'0 0 14px',
          fontSize:'clamp(26px, 4vw, 38px)', fontWeight:800, color:C.text,
          letterSpacing: isImperial ? '0.5px' : '-0.8px',
        }}>
          {isImperial ? 'Claim your seat at the Council' : 'Ready to get organised?'}
        </h2>
        <p style={{ margin:'0 0 36px', fontSize:16, color:C.textSub, lineHeight:1.65 }}>
          {isImperial
            ? 'Join the ranks of Monartech and command your projects, tasks, and estates — with imperial precision.'
            : 'Free to start. No credit card. Just sign up, invite your team, and start getting things done.'}
        </p>
        <Btn variant="primary" size="lg" onClick={onGetStarted} C={C} theme={theme}>
          {isImperial ? '⚜ Enter the Imperial Portal' : 'Create your free account →'}
        </Btn>
      </div>
    </section>
  )
}

/* ─── Footer ─────────────────────────────────────────────── */
function Footer({ C }) {
  return (
    <footer style={{
      borderTop:`1px solid ${C.border}`, padding:'28px 48px',
      display:'flex', alignItems:'center', justifyContent:'space-between',
      flexWrap:'wrap', gap:16, fontFamily:C.font,
    }}>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <img src={logoMark} alt="Monartech" style={{ width:26, height:26 }} />
        <span style={{ fontSize:14, fontWeight:600, color:C.textSub }}>Monartech</span>
      </div>
      <p style={{ margin:0, fontSize:13, color:C.textMuted }}>
        © {new Date().getFullYear()} Monartech. All rights reserved.
      </p>
      <div style={{ display:'flex', gap:20 }}>
        {['Privacy','Terms','Contact'].map(l => (
          <span key={l} style={{ fontSize:13, color:C.textMuted, cursor:'default', opacity: 0.5 }}
            title="Coming soon"
          >{l}</span>
        ))}
      </div>
    </footer>
  )
}

/* ─── Shared UI primitives ───────────────────────────────── */
function Btn({ variant='primary', size='md', onClick, href, children, C, theme }) {
  const [hov, setHov] = useState(false)
  const isImperial = theme === 'imperial'

  const base = {
    display:'inline-flex', alignItems:'center', justifyContent:'center',
    borderRadius: isImperial ? 4 : (size === 'lg' ? 12 : 9),
    fontSize: isImperial ? (size === 'lg' ? 13 : 12) : (size === 'lg' ? 15 : 14),
    fontWeight: 600, cursor:'pointer', textDecoration:'none',
    padding: size === 'lg' ? '14px 32px' : '8px 18px',
    fontFamily: C.font,
    transition:'all 0.2s',
    lineHeight:1,
    letterSpacing: isImperial ? '1.5px' : '0',
    textTransform: isImperial ? 'uppercase' : 'none',
  }

  const styles = {
    primary: isImperial ? {
      background: hov ? C.gradBtnHov : C.gradBtn,
      color: C.accent,
      border:`1px solid ${hov ? '#dfcfbe' : C.accentMuted}`,
      boxShadow: hov ? 'inset 0 0 20px rgba(223,207,190,0.15), 0 6px 25px rgba(0,0,0,0.6)' : 'inset 0 1px 0 rgba(255,255,255,0.08)',
    } : {
      background: hov ? '#7c7ff5' : '#6366f1',
      color:'#fff',
      border:'none',
      boxShadow: hov ? '0 0 28px rgba(99,102,241,0.4)' : '0 0 16px rgba(99,102,241,0.2)',
    },
    ghost: isImperial ? {
      background: hov ? 'rgba(223,207,190,0.08)' : 'transparent',
      color: hov ? C.accent : C.accentMuted,
      border:`1px solid ${hov ? C.borderHover : C.border}`,
    } : {
      background: hov ? 'rgba(255,255,255,0.07)' : 'transparent',
      color: hov ? C.text : C.textSub,
      border:`1px solid ${hov ? C.borderHover : C.border}`,
    },
    outline: isImperial ? {
      background: hov ? 'rgba(223,207,190,0.06)' : 'transparent',
      color: hov ? C.accent : C.accentMuted,
      border:`1px solid ${hov ? C.borderHover : C.border}`,
    } : {
      background: hov ? 'rgba(255,255,255,0.05)' : 'transparent',
      color: hov ? C.text : C.textSub,
      border:`1px solid ${hov ? C.borderHover : C.border}`,
    },
  }

  const props = {
    onMouseEnter:() => setHov(true),
    onMouseLeave:() => setHov(false),
    style:{ ...base, ...styles[variant] },
  }

  if (href) return <a href={href} {...props}>{children}</a>
  return <button type="button" onClick={onClick} {...props}>{children}</button>
}

function SectionLabel({ children, C, theme }) {
  const isImperial = theme === 'imperial'
  return (
    <p style={{
      margin:'0 0 12px', fontSize:11, fontWeight:700,
      letterSpacing: isImperial ? '2.5px' : '1.5px',
      textTransform:'uppercase',
      color: isImperial ? C.accentMuted : '#6366f1',
      textAlign:'center',
    }}>{children}</p>
  )
}

function SectionTitle({ children, C }) {
  return (
    <h2 style={{
      margin:'0 0 16px',
      fontSize:'clamp(28px, 4vw, 44px)', fontWeight:800,
      letterSpacing:'-1px', color:C.text,
      textAlign:'center', lineHeight:1.15,
    }}>{children}</h2>
  )
}

function SectionSub({ children, C }) {
  return (
    <p style={{
      margin:'0 auto', maxWidth:480, fontSize:16,
      color:C.textSub, textAlign:'center', lineHeight:1.65,
    }}>{children}</p>
  )
}
