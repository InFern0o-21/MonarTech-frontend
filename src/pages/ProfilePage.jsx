import { useState, useEffect } from 'react'
import { useProfile } from '../hooks/useProfile'

function getInitials(profile) {
  const f = profile?.first_name?.[0] ?? ''
  const l = profile?.last_name?.[0]  ?? ''
  return (f + l).toUpperCase() || profile?.username?.[0]?.toUpperCase() || '?'
}

function Field({ label, id, value, onChange, readOnly = false, error, type = 'text', hint }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[11px] font-semibold tracking-widest uppercase"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value ?? ''}
        onChange={e => onChange?.(e.target.value)}
        readOnly={readOnly}
        className="form-input h-11"
        style={{
          ...(error ? { borderColor: 'var(--color-error)' } : {}),
          ...(readOnly ? { opacity: 0.6, cursor: 'default' } : {}),
        }}
      />
      {hint && !error && (
        <span className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>{hint}</span>
      )}
      {error && (
        <span className="text-[12px]" style={{ color: 'var(--color-error)' }}>{error}</span>
      )}
    </div>
  )
}

export default function ProfilePage() {
  const { profile, loading, updateProfile } = useProfile()

  const [form,        setForm]        = useState({})
  const [fieldErrors, setFieldErrors] = useState({})
  const [formError,   setFormError]   = useState('')
  const [saving,      setSaving]      = useState(false)
  const [saved,       setSaved]       = useState(false)

  useEffect(() => {
    if (profile) {
      setForm({
        username:   profile.username   ?? '',
        first_name: profile.first_name ?? '',
        last_name:  profile.last_name  ?? '',
        mname:      profile.mname      ?? '',
        exname:     profile.exname     ?? '',
        number:     profile.number     ?? '',
      })
    }
  }, [profile])

  const set = k => v => { setForm(p => ({ ...p, [k]: v })); setSaved(false) }

  async function handleSubmit(e) {
    e.preventDefault()
    setFieldErrors({}); setFormError(''); setSaved(false)
    setSaving(true)
    try {
      await updateProfile(form)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      const status = err?.response?.status ?? err?.status
      if (status === 400) {
        const data = err?.response?.data ?? {}
        const { non_field_errors, ...fields } = data
        setFieldErrors(Object.fromEntries(
          Object.entries(fields).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
        ))
        if (non_field_errors?.length) setFormError(non_field_errors[0])
      } else {
        setFormError('Something went wrong. Please try again.')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[200px]">
        <div className="spinner" />
      </div>
    )
  }

  const displayName = [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') || profile?.username || ''

  return (
    <div className="max-w-[640px] mx-auto">

      {/* Page header */}
      <div className="mb-8">
        <p className="page-label">Account</p>
        <h1 className="page-title">Your Profile</h1>
      </div>

      {/* Avatar card */}
      <div className="card mb-6">
        <div className="card-top-bar" />
        <div className="flex items-center gap-4 p-5">
          <div
            className="w-[52px] h-[52px] rounded-full flex-shrink-0 flex items-center justify-center
                       text-lg font-extrabold text-white"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
              boxShadow: '0 0 0 3px rgba(99,102,241,0.25)',
            }}
          >
            {getInitials(profile)}
          </div>
          <div>
            <p className="m-0 mb-0.5 text-base font-bold" style={{ color: 'var(--color-text)' }}>
              {displayName || profile?.username}
            </p>
            <p className="m-0 text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
              {profile?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Form card */}
      <div className="card">
        <div className="card-top-bar" />
        <div
          className="px-6 py-4 text-[15px] font-semibold"
          style={{ color: 'var(--color-text)', borderBottom: '1px solid var(--color-border)' }}
        >
          Edit details
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-[18px]">
          <Field label="Email" id="email" value={profile?.email} readOnly hint="To change your email, contact support." />
          <Field label="Username" id="username" value={form.username}  onChange={set('username')} error={fieldErrors.username} />
          <div className="grid grid-cols-2 gap-3.5">
            <Field label="First name" id="first_name" value={form.first_name} onChange={set('first_name')} error={fieldErrors.first_name} />
            <Field label="Last name"  id="last_name"  value={form.last_name}  onChange={set('last_name')}  error={fieldErrors.last_name} />
          </div>
          <div className="grid grid-cols-2 gap-3.5">
            <Field label="Middle name"    id="mname"  value={form.mname}  onChange={set('mname')}  error={fieldErrors.mname} />
            <Field label="Extension name" id="exname" value={form.exname} onChange={set('exname')} error={fieldErrors.exname} />
          </div>
          <Field label="Phone number" id="number" value={form.number} onChange={set('number')} error={fieldErrors.number} type="tel" />

          {formError && (
            <div className="banner-error">{formError}</div>
          )}

          <div className="flex items-center gap-3.5 pt-1">
            <button type="submit" disabled={saving} className="btn btn-primary h-11 px-7">
              {saving ? 'Saving…' : 'Save changes'}
            </button>
            {saved && (
              <span className="text-sm font-medium" style={{ color: 'var(--color-success)' }}>
                ✓ Saved
              </span>
            )}
          </div>
        </form>
      </div>

    </div>
  )
}
