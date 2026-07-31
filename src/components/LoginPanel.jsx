import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import logoMark from '../assets/logo/monartech-mark.svg'
import apiClient from '../lib/apiClient'

// Hardcoded panel colors — no CSS variables to avoid inheritance issues
const P = {
  bg:          '#1e1e2e',
  bgInput:     '#2a2a3d',
  bgInputHover:'#303045',
  border:      'rgba(255,255,255,0.10)',
  borderFocus: '#6366f1',
  accent:      '#6366f1',
  accentHover: '#7c7ff5',
  text:        '#ffffff',
  textSub:     'rgba(255,255,255,0.60)',
  textMuted:   'rgba(255,255,255,0.35)',
  error:       '#f87171',
  errorBg:     'rgba(248,113,113,0.10)',
  errorBorder: 'rgba(248,113,113,0.25)',
  success:     '#4ade80',
  successBg:   'rgba(74,222,128,0.10)',
  successBorder:'rgba(74,222,128,0.25)',
}

export default function LoginPanel({ isOpen, onClose, onSuccess, initialMode = 'login' }) {
  const [mode, setMode]         = useState(initialMode)
  const [visible, setVisible]   = useState(false)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode)
      setVisible(true)
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimating(true)))
    } else {
      setAnimating(false)
      const t = setTimeout(() => setVisible(false), 350)
      return () => clearTimeout(t)
    }
  }, [isOpen, initialMode])

  // tiny helper to avoid double rAF issue
  function setAnimationFrame(fn) { requestAnimationFrame(fn) }

  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  if (!visible) return null

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 40,
          background: 'rgba(0,0,0,0.5)',
          opacity: animating ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Authentication"
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 50,
          width: '100%', maxWidth: '420px',
          background: P.bg,
          borderLeft: `1px solid ${P.border}`,
          boxShadow: '-4px 0 60px rgba(0,0,0,0.7)',
          display: 'flex', flexDirection: 'column',
          transform: animating ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.35s cubic-bezier(0.32,0.72,0,1)',
          overflow: 'hidden',
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        }}
      >
        {/* Top gradient line */}
        <div style={{ height: 3, background: 'linear-gradient(90deg, #6366f1, #a78bfa)' }} />

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px 18px',
          borderBottom: `1px solid ${P.border}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={logoMark} alt="Monartech" style={{ width: 32, height: 32 }} />
            <span style={{ fontSize: 15, fontWeight: 700, color: P.text }}>Monartech</span>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: `1px solid ${P.border}`,
              background: 'transparent', color: P.textSub,
              cursor: 'pointer', fontSize: 16, lineHeight: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = P.text }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = P.textSub }}
          >✕</button>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px 24px' }}>
          {mode === 'login'    && <LoginForm    onSwitch={setMode} onSuccess={onSuccess} />}
          {mode === 'register' && <RegisterForm onSwitch={setMode} />}
          {mode === 'forgot'   && <ForgotForm   onSwitch={setMode} />}
        </div>
      </div>
    </>
  )
}

/* ─── Login Form ─────────────────────────────────────────── */
function LoginForm({ onSwitch, onSuccess }) {
  const { login } = useAuth()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const abortRef = useRef(null)

  useEffect(() => {
    abortRef.current = new AbortController()
    return () => abortRef.current.abort()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password, abortRef.current.signal)
      onSuccess?.()
    } catch (err) {
      if (err?.name === 'AbortError' || err?.code === 'ERR_CANCELED') return
      const status = err?.response?.status ?? err?.status
      if (status === 401) {
        setError('Invalid credentials')
      } else if (status === 400) {
        const data = err?.response?.data ?? {}
        const msg =
          data.non_field_errors?.[0] ??
          Object.values(data)[0]?.[0] ??
          'Login failed. Please try again.'
        setError(msg)
      } else {
        setError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: P.text, letterSpacing: '-0.5px' }}>
          Welcome back
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: P.textSub }}>
          Sign in to your Monartech account
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" required />
        <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" required />

        {error && <ErrorBox>{error}</ErrorBox>}

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <LinkBtn onClick={() => onSwitch('forgot')}>Forgot password?</LinkBtn>
        </div>

        <SubmitBtn loading={loading}>Sign in</SubmitBtn>
      </form>

      <Rule />

      <p style={{ margin: 0, fontSize: 14, color: P.textSub, textAlign: 'center' }}>
        Don't have an account?{' '}
        <LinkBtn onClick={() => onSwitch('register')}>Create one</LinkBtn>
      </p>
    </div>
  )
}

/* ─── Register Form ──────────────────────────────────────── */
function RegisterForm({ onSwitch }) {
  const [f, setF]           = useState({ email: '', username: '', password1: '', password2: '' })
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError, setFormError]     = useState('')
  const [loading, setLoading]         = useState(false)
  const [success, setSuccess]         = useState(false)
  const set = k => v => setF(prev => ({ ...prev, [k]: v }))
  const abortRef = useRef(null)

  useEffect(() => {
    abortRef.current = new AbortController()
    return () => abortRef.current.abort()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFieldErrors({})
    setFormError('')

    // Client-side validation
    if (f.password1 !== f.password2) {
      setFormError('Passwords do not match.')
      return
    }
    if (f.password1.length < 8) {
      setFormError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)
    try {
      await apiClient.post('/api/auth/registration/', f, { signal: abortRef.current.signal })
      setSuccess(true)
    } catch (err) {
      if (err?.name === 'AbortError' || err?.code === 'ERR_CANCELED') return
      const status = err?.response?.status ?? err?.status
      if (status === 400) {
        const data = err?.response?.data ?? {}
        const { non_field_errors, ...fields } = data
        setFieldErrors(
          Object.fromEntries(
            Object.entries(fields).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
          )
        )
        if (non_field_errors?.length) setFormError(non_field_errors[0])
      } else {
        setFormError('Something went wrong. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div style={{
          padding: '16px', borderRadius: 10,
          background: P.successBg, border: `1px solid ${P.successBorder}`,
          color: P.success, fontSize: 14, lineHeight: 1.6,
        }}>
          ✓ Account created! Check your email to verify your address before signing in.
        </div>
        <p style={{ margin: 0, fontSize: 14, color: P.textSub, textAlign: 'center' }}>
          <LinkBtn onClick={() => onSwitch('login')}>← Back to sign in</LinkBtn>
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: P.text, letterSpacing: '-0.5px' }}>
          Create account
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: P.textSub }}>
          Get started with Monartech for free
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Field label="Email"            type="email"    value={f.email}     onChange={set('email')}     placeholder="you@example.com"  required error={fieldErrors.email} />
        <Field label="Username"         type="text"     value={f.username}  onChange={set('username')}  placeholder="johndoe"           required error={fieldErrors.username} />
        <Field label="Password"         type="password" value={f.password1} onChange={set('password1')} placeholder="Min. 8 characters" required error={fieldErrors.password1} />
        <Field label="Confirm Password" type="password" value={f.password2} onChange={set('password2')} placeholder="••••••••"           required error={fieldErrors.password2} />

        {formError && <ErrorBox>{formError}</ErrorBox>}

        <SubmitBtn loading={loading} style={{ marginTop: 4 }}>Create account</SubmitBtn>
      </form>

      <Rule />

      <p style={{ margin: 0, fontSize: 14, color: P.textSub, textAlign: 'center' }}>
        Already have an account?{' '}
        <LinkBtn onClick={() => onSwitch('login')}>Sign in</LinkBtn>
      </p>
    </div>
  )
}

/* ─── Forgot Form ────────────────────────────────────────── */
function ForgotForm({ onSwitch }) {
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')
  const abortRef = useRef(null)

  useEffect(() => {
    abortRef.current = new AbortController()
    return () => abortRef.current.abort()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await apiClient.post('/api/auth/password/reset/', { email }, { signal: abortRef.current.signal })
      setSent(true)
    } catch (err) {
      if (err?.name === 'AbortError' || err?.code === 'ERR_CANCELED') return
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      <div>
        <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: P.text, letterSpacing: '-0.5px' }}>
          Reset password
        </h2>
        <p style={{ margin: 0, fontSize: 14, color: P.textSub }}>
          Enter your email and we'll send a reset link
        </p>
      </div>

      {sent ? (
        <div style={{
          padding: '14px 16px', borderRadius: 10,
          background: P.successBg, border: `1px solid ${P.successBorder}`,
          color: P.success, fontSize: 14, lineHeight: 1.5,
        }}>
          ✓ If that email is registered, a reset link is on its way. Check your inbox.
        </div>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" required />
          {error && <ErrorBox>{error}</ErrorBox>}
          <SubmitBtn loading={loading}>Send reset link</SubmitBtn>
        </form>
      )}

      <p style={{ margin: 0, fontSize: 14, color: P.textSub, textAlign: 'center' }}>
        <LinkBtn onClick={() => onSwitch('login')}>← Back to sign in</LinkBtn>
      </p>
    </div>
  )
}

/* ─── Shared primitives ──────────────────────────────────── */
function Field({ label, type, value, onChange, placeholder, required, error }) {
  const [focused, setFocused] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 500, color: P.textSub }}>
        {label}
        {required && <span style={{ color: P.accent, marginLeft: 2 }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        required={required}
        disabled={false}
        style={{
          height: 44,
          padding: '0 14px',
          borderRadius: 10,
          border: `1.5px solid ${error ? P.error : focused ? P.borderFocus : P.border}`,
          background: focused ? P.bgInputHover : P.bgInput,
          color: P.text,
          fontSize: 14,
          outline: 'none',
          width: '100%',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
          boxShadow: focused ? `0 0 0 3px rgba(99,102,241,0.18)` : 'none',
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        }}
      />
      {error && (
        <span style={{ fontSize: 12, color: P.error }}>{error}</span>
      )}
    </div>
  )
}

function SubmitBtn({ children, loading, style: extra }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      type="submit"
      disabled={loading}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        height: 44, borderRadius: 10, border: 'none',
        background: hov && !loading ? P.accentHover : P.accent,
        color: '#fff', fontSize: 14, fontWeight: 600,
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.75 : 1,
        transition: 'all 0.15s',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        ...extra,
      }}
    >
      {loading ? <><Spinner /> Processing…</> : children}
    </button>
  )
}

function Spinner() {
  return (
    <span style={{
      width: 14, height: 14, borderRadius: '50%',
      border: '2px solid rgba(255,255,255,0.25)',
      borderTopColor: '#fff',
      display: 'inline-block',
      animation: 'panel-spin 0.6s linear infinite',
    }} />
  )
}

function ErrorBox({ children }) {
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 8,
      background: P.errorBg, border: `1px solid ${P.errorBorder}`,
      color: P.error, fontSize: 13, lineHeight: 1.5,
    }}>{children}</div>
  )
}

function Rule() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{ flex: 1, height: 1, background: P.border }} />
      <span style={{ fontSize: 12, color: P.textMuted }}>or</span>
      <div style={{ flex: 1, height: 1, background: P.border }} />
    </div>
  )
}

function LinkBtn({ onClick, children }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: 'none', border: 'none', padding: 0,
        color: hov ? P.accentHover : P.accent,
        fontSize: 14, fontWeight: 500, cursor: 'pointer',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        transition: 'color 0.15s',
      }}
    >{children}</button>
  )
}
