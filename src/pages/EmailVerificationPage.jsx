import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import apiClient from '../lib/apiClient'
import LoginPanel from '../components/LoginPanel'

export default function EmailVerificationPage() {
  const [searchParams] = useSearchParams()
  const key = searchParams.get('key')

  const [status,    setStatus]    = useState(key ? 'loading' : 'no-key')
  const [errorMsg,  setErrorMsg]  = useState('')
  const [panelOpen, setPanelOpen] = useState(false)

  useEffect(() => {
    if (!key) return
    let cancelled = false
    apiClient.post('/api/auth/registration/verify-email/', { key })
      .then(() => { if (!cancelled) setStatus('success') })
      .catch(err => {
        if (cancelled) return
        const data = err?.response?.data
        const msg =
          data?.detail ??
          data?.non_field_errors?.[0] ??
          (typeof data === 'string' ? data : null) ??
          'Verification failed. The link may have expired or already been used.'
        setErrorMsg(msg)
        setStatus('error')
      })
    return () => { cancelled = true }
  }, [key])

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'var(--color-bg)' }}
    >
      <div className="max-w-[480px] w-full text-center">

        {status === 'loading' && (
          <>
            <div className="spinner mx-auto mb-6" style={{ width: 48, height: 48 }} />
            <p className="text-[15px]" style={{ color: 'var(--color-text-muted)' }}>
              Verifying your email…
            </p>
          </>
        )}

        {status === 'success' && (
          <div className="card">
            <div className="card-top-bar" />
            <div className="card-body text-center">
              <div className="text-5xl mb-4">✓</div>
              <h1
                className="m-0 mb-3 text-2xl font-bold tracking-tight"
                style={{ color: 'var(--color-text)' }}
              >
                Email verified!
              </h1>
              <p
                className="m-0 mb-7 text-[15px] leading-relaxed"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Your email has been confirmed. You can now sign in to your account.
              </p>
              <button
                onClick={() => setPanelOpen(true)}
                className="btn btn-primary"
              >
                Sign in →
              </button>
            </div>
          </div>
        )}

        {(status === 'error' || status === 'no-key') && (
          <div className="card">
            <div className="card-top-bar" />
            <div className="card-body text-center">
              <div className="text-5xl mb-4">✗</div>
              <h1
                className="m-0 mb-3 text-2xl font-bold tracking-tight"
                style={{ color: 'var(--color-text)' }}
              >
                Verification failed
              </h1>
              <p
                className="m-0 mb-7 text-[15px] leading-relaxed"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {status === 'no-key'
                  ? 'This verification link is invalid or missing. Please check your email and try again.'
                  : errorMsg}
              </p>
              <button
                onClick={() => setPanelOpen(true)}
                className="btn btn-ghost"
              >
                Register again
              </button>
            </div>
          </div>
        )}
      </div>

      <LoginPanel isOpen={panelOpen} onClose={() => setPanelOpen(false)} />
    </div>
  )
}
