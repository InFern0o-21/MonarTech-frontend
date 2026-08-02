import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../hooks/useToast'
import apiClient from '../lib/apiClient'
import SkeletonCard from '../components/shared/SkeletonCard'

function getInitials(user) {
  const f = user?.first_name?.[0] ?? ''
  const l = user?.last_name?.[0]  ?? ''
  return (f + l).toUpperCase() || user?.username?.[0]?.toUpperCase() || '?'
}

const ROLE_BADGE = {
  owner:  { background: 'var(--color-primary-dim)',          color: 'var(--color-primary)' },
  admin:  { background: 'rgba(167,139,250,0.18)',            color: '#a78bfa' },
  member: { background: 'rgba(255,255,255,0.08)',            color: 'rgba(240,240,248,0.5)' },
}

// ─── WorkgroupChip ────────────────────────────────────────────────────────────
function WorkgroupChip({ wg, selected, onClick }) {
  const role  = wg.role ?? 'member'
  const name  = wg.workgroup_name ?? `Workgroup #${wg.workgroup}`
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        height: 36, padding: '0 14px', borderRadius: 18,
        border: selected ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-border)',
        background: selected ? 'var(--color-primary-dim)' : 'var(--color-surface-2)',
        color: selected ? 'var(--color-text)' : 'var(--color-text-muted)',
        fontSize: 13, fontWeight: selected ? 600 : 500,
        cursor: 'pointer', transition: 'all 0.15s',
        fontFamily: 'var(--font-sans)',
        flexShrink: 0,
      }}
    >
      <span style={{ fontSize: 14 }}>⬡</span>
      {name}
      <span style={{
        fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 4,
        background: ROLE_BADGE[role]?.background,
        color: ROLE_BADGE[role]?.color,
        textTransform: 'uppercase', letterSpacing: '0.05em',
      }}>{role}</span>
    </button>
  )
}

// ─── PlanCard ─────────────────────────────────────────────────────────────────
function PlanCard({ plan }) {
  return (
    <Link to={`/plans/${plan.id}`} className="block no-underline">
      <div className="card cursor-pointer hover:translate-y-[-2px] transition-transform duration-200">
        <div className="h-0.5 flex-shrink-0"
          style={{ background: 'linear-gradient(90deg, var(--color-accent), var(--color-primary))' }} />
        <div className="card-body">
          <div className="flex items-start justify-between mb-3.5">
            <div className="w-10 h-10 rounded-[10px] flex items-center justify-center text-lg"
              style={{ background: 'var(--color-accent-dim)', border: '1px solid rgba(167,139,250,0.2)' }}>
              ◫
            </div>
            {plan.is_archived && (
              <span className="role-badge" style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--color-text-muted)' }}>
                Archived
              </span>
            )}
          </div>
          <p className="m-0 mb-1 font-bold text-[15px] tracking-tight" style={{ color: 'var(--color-text)' }}>
            {plan.title}
          </p>
          <p className="m-0 text-[12px]" style={{ color: 'var(--color-text-muted)' }}>
            {plan.workgroup_name ?? (plan.workgroup ? `Workgroup #${plan.workgroup}` : 'Personal board')}
          </p>
        </div>
      </div>
    </Link>
  )
}

// ─── ActivityItem ─────────────────────────────────────────────────────────────
const EVENT_ICON = { completed: '✓', created: '+', updated: '↻' }
const EVENT_COLOR = {
  completed: { bg: 'rgba(74,222,128,0.1)',  border: 'rgba(74,222,128,0.25)',  color: '#4ade80' },
  created:   { bg: 'rgba(99,102,241,0.1)',  border: 'rgba(99,102,241,0.25)',  color: '#818cf8' },
  updated:   { bg: 'rgba(255,255,255,0.04)', border: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.45)' },
}

function timeAgo(iso) {
  if (!iso) return ''
  const diff = (Date.now() - new Date(iso)) / 1000
  if (diff < 60)  return 'just now'
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`
  return `${Math.floor(diff/86400)}d ago`
}

function ActivityItem({ event }) {
  const style = EVENT_COLOR[event.event_type] ?? EVENT_COLOR.updated
  const verb  = event.event_type === 'completed' ? 'completed'
              : event.event_type === 'created'   ? 'created'
              : 'updated'

  return (
    <div style={{
      display: 'flex', gap: 10, alignItems: 'flex-start',
      padding: '10px 12px', borderRadius: 10,
      background: style.bg, border: `1px solid ${style.border}`,
    }}>
      <span style={{
        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 700, color: style.color,
        background: 'rgba(0,0,0,0.2)',
      }}>
        {EVENT_ICON[event.event_type]}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text)', fontWeight: 500, lineHeight: 1.4 }}>
          <span style={{ color: style.color, fontWeight: 600 }}>
            {event.actor ?? 'Someone'}
          </span>
          {' '}{verb}{' '}
          <Link to={`/plans/${event.plan_id}`} style={{ color: 'var(--color-text)', textDecoration: 'none', fontWeight: 600 }}
            onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
            onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
            {event.task_title}
          </Link>
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--color-text-muted)' }}>
          {event.plan_title} · {timeAgo(event.timestamp)}
        </p>
      </div>
    </div>
  )
}

function EmptyState({ icon, text }) {
  return (
    <div className="empty-state col-span-full">
      <div className="text-4xl mb-2.5 opacity-50">{icon}</div>
      <p className="m-0 text-sm" style={{ color: 'var(--color-text-muted)' }}>{text}</p>
    </div>
  )
}

// ─── DashboardPage ────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuth()
  const { addToast } = useToast()
  const navigate = useNavigate()

  const [wgMembers,    setWgMembers]    = useState([])
  const [wgLoading,    setWgLoading]    = useState(true)
  const [plans,        setPlans]        = useState([])
  const [plansLoading, setPlansLoading] = useState(true)
  const [plansError,   setPlansError]   = useState(null)
  const [activity,     setActivity]     = useState([])
  const [actLoading,   setActLoading]   = useState(true)

  // selected workgroup IDs for filter (null = All)
  const [selectedWg, setSelectedWg]    = useState(null)

  // new plan form
  const [showPlanForm, setShowPlanForm] = useState(false)
  const [planTitle,    setPlanTitle]    = useState('')
  const [planDesc,     setPlanDesc]     = useState('')
  const [planSaving,   setPlanSaving]   = useState(false)

  async function loadWorkgroups() {
    setWgLoading(true)
    try {
      const { data } = await apiClient.get('/api/workgroup-members/', { params: { me: 'true' } })
      setWgMembers(data.results ?? data)
    } catch {}
    finally { setWgLoading(false) }
  }

  async function loadPlans() {
    setPlansLoading(true); setPlansError(null)
    try {
      const { data } = await apiClient.get('/api/plans/')
      setPlans(data.results ?? data)
    } catch { setPlansError('Could not load plans.') }
    finally { setPlansLoading(false) }
  }

  async function loadActivity() {
    setActLoading(true)
    try {
      const { data } = await apiClient.get('/api/activity/', { params: { limit: 5 } })
      setActivity(data)
    } catch {}
    finally { setActLoading(false) }
  }

  useEffect(() => { Promise.all([loadWorkgroups(), loadPlans(), loadActivity()]) }, [])

  async function handleCreatePlan(e) {
    e.preventDefault()
    if (!planTitle.trim()) return
    setPlanSaving(true)
    try {
      const payload = { title: planTitle.trim(), description: planDesc.trim() || undefined }
      if (selectedWg && selectedWg !== 'personal') payload.workgroup = selectedWg
      const { data } = await apiClient.post('/api/plans/', payload)
      addToast('success', 'Plan created')
      setPlans(prev => [...prev, data])
      setPlanTitle(''); setPlanDesc(''); setShowPlanForm(false)
      navigate(`/plans/${data.id}`)
    } catch (err) {
      addToast('error', err?.response?.data?.detail ?? 'Failed to create plan.')
    } finally { setPlanSaving(false) }
  }

  // Filtered plans based on selected workgroup chip
  const filteredPlans = selectedWg === null
    ? plans
    : selectedWg === 'personal'
      ? plans.filter(p => !p.workgroup)
      : plans.filter(p => p.workgroup === selectedWg)

  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.username || 'there'

  // Workgroup ID the current user owns/admins (for "new plan in this workgroup" hint)
  const selectedWgMember = wgMembers.find(m => m.workgroup === selectedWg)
  const selectedWgName   = selectedWgMember?.workgroup_name ?? null

  return (
    <div className="max-w-[1100px] mx-auto">

      {/* Greeting hero */}
      <div className="card mb-8 relative overflow-hidden">
        <div className="card-top-bar" />
        <div className="absolute top-0 left-1/4 w-[400px] h-[140px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.1) 0%, transparent 70%)' }} />
        <div className="flex items-center gap-5 p-6">
          <div className="w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center text-xl font-extrabold text-white"
            style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))', boxShadow: '0 0 0 3px rgba(99,102,241,0.25)' }}>
            {getInitials(user)}
          </div>
          <div>
            <p className="m-0 mb-0.5 text-[13px]" style={{ color: 'var(--color-text-muted)' }}>Welcome back</p>
            <h1 className="m-0 text-2xl font-extrabold tracking-tight" style={{ color: 'var(--color-text)' }}>
              {displayName}
            </h1>
            <p className="m-0 mt-0.5 text-[13px]" style={{ color: 'var(--color-text-muted)' }}>{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Main layout — left column (workgroup filter + plans) + right column (activity) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>

        {/* ── Left column ── */}
        <div>

          {/* Workgroup filter chips */}
          <section className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="page-label">Teams</p>
                <h2 className="m-0 text-[17px] font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
                  My Workgroups
                </h2>
              </div>
              <Link to="/workgroups" className="text-[13px] font-medium no-underline" style={{ color: 'var(--color-accent)' }}>
                Manage →
              </Link>
            </div>

            {/* Chip row */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {/* "All" chip */}
              <button
                type="button"
                onClick={() => setSelectedWg(null)}
                style={{
                  height: 36, padding: '0 14px', borderRadius: 18,
                  border: selectedWg === null ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                  background: selectedWg === null ? 'var(--color-primary-dim)' : 'var(--color-surface-2)',
                  color: selectedWg === null ? 'var(--color-text)' : 'var(--color-text-muted)',
                  fontSize: 13, fontWeight: selectedWg === null ? 600 : 500,
                  cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'var(--font-sans)',
                }}
              >
                All plans
              </button>

              {/* Personal chip */}
              <button
                type="button"
                onClick={() => setSelectedWg('personal')}
                style={{
                  height: 36, padding: '0 14px', borderRadius: 18,
                  border: selectedWg === 'personal' ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-border)',
                  background: selectedWg === 'personal' ? 'var(--color-primary-dim)' : 'var(--color-surface-2)',
                  color: selectedWg === 'personal' ? 'var(--color-text)' : 'var(--color-text-muted)',
                  fontSize: 13, fontWeight: selectedWg === 'personal' ? 600 : 500,
                  cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'var(--font-sans)',
                }}
              >
                Personal
              </button>

              {/* Workgroup chips */}
              {wgLoading
                ? [1,2].map(i => (
                    <div key={i} style={{ height: 36, width: 110, borderRadius: 18, background: 'var(--color-surface-2)', opacity: 0.5 }} />
                  ))
                : wgMembers.map(wg => (
                    <WorkgroupChip
                      key={wg.id}
                      wg={wg}
                      selected={selectedWg === wg.workgroup}
                      onClick={() => setSelectedWg(wg.workgroup === selectedWg ? null : wg.workgroup)}
                    />
                  ))
              }
            </div>
          </section>

          {/* Plans section */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="page-label">Boards</p>
                <h2 className="m-0 text-[17px] font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
                  {selectedWg === null ? 'All Plans'
                   : selectedWg === 'personal' ? 'Personal Plans'
                   : (selectedWgName ? `${selectedWgName} Plans` : 'Plans')}
                </h2>
              </div>
              <button
                onClick={() => setShowPlanForm(v => !v)}
                className={`btn btn-sm ${showPlanForm ? 'btn-ghost' : 'btn-primary'}`}
              >
                {showPlanForm ? '✕ Cancel' : '+ New Plan'}
              </button>
            </div>

            {showPlanForm && (
              <form onSubmit={handleCreatePlan} className="card mb-4"
                style={{ border: '1px solid var(--color-border-light)' }}>
                <div className="card-top-bar" />
                <div className="card-body flex flex-col gap-3">
                  <p className="m-0 text-[13px]" style={{ color: 'var(--color-text-muted)' }}>
                    {selectedWgName
                      ? `Creating under workgroup: ${selectedWgName}`
                      : 'Personal plan — only you can see it unless shared.'}
                  </p>
                  <input value={planTitle} onChange={e => setPlanTitle(e.target.value)}
                    placeholder="Plan title *" required autoFocus className="form-input" />
                  <input value={planDesc} onChange={e => setPlanDesc(e.target.value)}
                    placeholder="Description (optional)" className="form-input" />
                  <div className="flex gap-2">
                    <button type="submit" disabled={planSaving} className="btn btn-primary btn-sm">
                      {planSaving ? 'Creating…' : 'Create Plan'}
                    </button>
                    <button type="button" onClick={() => { setShowPlanForm(false); setPlanTitle(''); setPlanDesc('') }}
                      className="btn btn-ghost btn-sm">Cancel</button>
                  </div>
                </div>
              </form>
            )}

            {plansError && (
              <div className="banner-error mb-3">
                {plansError}
                <button onClick={loadPlans} className="btn btn-danger btn-sm">Retry</button>
              </div>
            )}

            <div className="grid gap-3.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
              {plansLoading
                ? [1,2,3].map(i => <SkeletonCard key={i} />)
                : filteredPlans.length === 0
                  ? <EmptyState icon="◫" text="No plans here yet." />
                  : filteredPlans.map(plan => <PlanCard key={plan.id} plan={plan} />)
              }
            </div>
          </section>

        </div>

        {/* ── Right column — Recent Activity ── */}
        <aside>
          <div style={{
            position: 'sticky', top: 20,
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 14, overflow: 'hidden',
          }}>
            <div style={{
              padding: '14px 16px 12px',
              borderBottom: '1px solid var(--color-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <p className="page-label" style={{ marginBottom: 2 }}>Live</p>
                <h3 className="m-0 text-[15px] font-bold" style={{ color: 'var(--color-text)' }}>
                  Recent Activity
                </h3>
              </div>
              <button onClick={loadActivity} title="Refresh"
                style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer', fontSize: 16 }}>
                ↻
              </button>
            </div>

            <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {actLoading
                ? [1,2,3].map(i => (
                    <div key={i} style={{ height: 56, borderRadius: 10, background: 'var(--color-surface-2)', opacity: 0.5 }} />
                  ))
                : activity.length === 0
                  ? <p style={{ margin: '8px 0', fontSize: 13, color: 'var(--color-text-muted)', textAlign: 'center' }}>
                      No recent activity.
                    </p>
                  : activity.map(ev => <ActivityItem key={`${ev.task_id}-${ev.event_type}`} event={ev} />)
              }
            </div>
          </div>
        </aside>

      </div>

      {/* Responsive: stack on mobile */}
      <style>{`
        @media (max-width: 768px) {
          .dashboard-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

    </div>
  )
}
