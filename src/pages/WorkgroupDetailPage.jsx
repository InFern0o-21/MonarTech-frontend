import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import apiClient from '../lib/apiClient'
import { useToast } from '../hooks/useToast'
import { usePlans } from '../hooks/usePlans'
import SkeletonCard from '../components/shared/SkeletonCard'
import ConfirmDialog from '../components/shared/ConfirmDialog'

const ROLE_BADGE = {
  owner:  { background: 'rgba(99,102,241,0.18)',  color: '#818cf8' },
  admin:  { background: 'rgba(167,139,250,0.18)', color: '#a78bfa' },
  member: { background: 'rgba(255,255,255,0.08)', color: 'rgba(240,240,248,0.5)' },
}

export default function WorkgroupDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { addToast } = useToast()

  const [members,        setMembers]        = useState([])
  const [membersLoading, setMembersLoading] = useState(true)
  const [membersError,   setMembersError]   = useState(null)
  const [myRole,         setMyRole]         = useState('member')

  const [addUsername, setAddUsername] = useState('')
  const [addRole,     setAddRole]     = useState('member')
  const [addLoading,  setAddLoading]  = useState(false)
  const [removeTarget, setRemoveTarget] = useState(null)

  const { plans, loading: plansLoading, error: plansError, createPlan, deletePlan } = usePlans({ workgroup: id })

  const [showPlanForm,      setShowPlanForm]      = useState(false)
  const [planTitle,         setPlanTitle]         = useState('')
  const [planDesc,          setPlanDesc]          = useState('')
  const [planSaving,        setPlanSaving]        = useState(false)
  const [deletePlanTarget,  setDeletePlanTarget]  = useState(null)

  const loadMembers = useCallback(async () => {
    setMembersLoading(true); setMembersError(null)
    try {
      const { data } = await apiClient.get('/api/workgroup-members/', { params: { workgroup: id } })
      const list = data.results ?? data
      setMembers(list)
      try {
        const me = await apiClient.get('/api/users/me/')
        const mine = list.find(m => m.user === me.data.id)
        if (mine) setMyRole(mine.role)
      } catch {}
    } catch {
      setMembersError('Could not load members.')
    } finally {
      setMembersLoading(false)
    }
  }, [id])

  useEffect(() => { loadMembers() }, [loadMembers])

  const canManageMembers = myRole === 'owner' || myRole === 'admin'

  async function handleAddMember(e) {
    e.preventDefault()
    if (!addUsername.trim()) return
    setAddLoading(true)
    try {
      const { data: users } = await apiClient.get('/api/users/', { params: { search: addUsername.trim() } })
      const userList = users.results ?? users
      const found = userList.find(u => u.username === addUsername.trim() || u.email === addUsername.trim())
      if (!found) { addToast('error', 'User not found.'); setAddLoading(false); return }
      await apiClient.post('/api/workgroup-members/', { workgroup: Number(id), user: found.id, role: addRole })
      addToast('success', 'Member added')
      setAddUsername('')
      loadMembers()
    } catch (err) {
      addToast('error', err?.response?.data?.detail ?? 'Failed to add member.')
    } finally {
      setAddLoading(false)
    }
  }

  async function handleRemoveMember() {
    if (!removeTarget) return
    try {
      await apiClient.delete(`/api/workgroup-members/${removeTarget.id}/`)
      addToast('success', 'Member removed')
      loadMembers()
    } catch (err) {
      addToast('error', err?.response?.data?.detail ?? 'Failed to remove member.')
    } finally {
      setRemoveTarget(null)
    }
  }

  async function handleCreatePlan(e) {
    e.preventDefault()
    if (!planTitle.trim()) return
    setPlanSaving(true)
    try {
      await createPlan({ title: planTitle.trim(), description: planDesc.trim(), workgroup: Number(id) })
      setPlanTitle(''); setPlanDesc(''); setShowPlanForm(false)
    } catch {} finally { setPlanSaving(false) }
  }

  async function handleDeletePlan() {
    if (!deletePlanTarget) return
    try { await deletePlan(deletePlanTarget.id) } catch {} finally { setDeletePlanTarget(null) }
  }

  return (
    <div className="max-w-[800px] mx-auto">
      <Link
        to="/workgroups"
        className="inline-flex items-center gap-1 mb-5 text-[13px] no-underline transition-colors duration-150 hover:text-[var(--color-text)]"
        style={{ color: 'var(--color-text-muted)' }}
      >
        ← Workgroups
      </Link>

      {/* Members section */}
      <section className="mb-10">
        <h2
          className="m-0 mb-4 text-[18px] font-semibold"
          style={{ color: 'var(--color-text)' }}
        >
          Members
        </h2>

        {membersError && (
          <div className="banner-error mb-3">
            {membersError}
            <button onClick={loadMembers} className="btn btn-danger btn-sm">Retry</button>
          </div>
        )}

        {membersLoading ? (
          <div className="flex flex-col gap-2">
            <SkeletonCard variant="list" />
            <SkeletonCard variant="list" />
            <SkeletonCard variant="list" />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {members.map(m => {
              const badge = ROLE_BADGE[m.role] ?? ROLE_BADGE.member
              return (
                <div
                  key={m.id}
                  className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)]"
                  style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                >
                  {/* Avatar initial */}
                  <div style={{
                    width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                    background: m.role === 'owner' ? 'rgba(99,102,241,0.25)' : 'rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 13, fontWeight: 700, color: m.role === 'owner' ? '#818cf8' : 'var(--color-text-muted)',
                  }}>
                    {(m.username ?? m.user?.toString() ?? '?')[0].toUpperCase()}
                  </div>

                  {/* Name + email stacked */}
                  <div className="flex-1 min-w-0">
                    <p className="m-0 text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
                      {m.username ?? `User #${m.user}`}
                    </p>
                    {m.email && (
                      <p className="m-0 text-[12px] truncate" style={{ color: 'var(--color-text-muted)' }}>
                        {m.email}
                      </p>
                    )}
                  </div>

                  <span className="role-badge" style={badge}>{m.role.toUpperCase()}</span>
                  {canManageMembers && m.role !== 'owner' && (
                    <button onClick={() => setRemoveTarget(m)} className="btn btn-danger btn-sm">
                      Remove
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {canManageMembers && (
          <form onSubmit={handleAddMember} className="mt-3.5 flex gap-2 flex-wrap">
            <input
              value={addUsername}
              onChange={e => setAddUsername(e.target.value)}
              placeholder="Username or email"
              className="form-input flex-[1_1_180px]"
            />
            <select
              value={addRole}
              onChange={e => setAddRole(e.target.value)}
              className="form-input w-auto"
              style={{ width: 'auto' }}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
            <button type="submit" disabled={addLoading} className="btn btn-primary" style={{ height: 42 }}>
              {addLoading ? 'Adding…' : 'Add'}
            </button>
          </form>
        )}
      </section>

      {/* Plans section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="m-0 text-[18px] font-semibold" style={{ color: 'var(--color-text)' }}>
            Plans
          </h2>
          {/* All workgroup members can create plans */}
          <button
            onClick={() => setShowPlanForm(v => !v)}
            className="btn btn-primary"
            style={{ height: 36, padding: '0 16px', fontSize: 13 }}
          >
            + New Plan
          </button>
        </div>

        {showPlanForm && (
          <form
            onSubmit={handleCreatePlan}
            className="flex flex-col gap-2.5 p-4 mb-4 rounded-[var(--radius-md)]"
            style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
          >
            <input
              value={planTitle}
              onChange={e => setPlanTitle(e.target.value)}
              placeholder="Plan title *"
              required
              className="form-input"
            />
            <input
              value={planDesc}
              onChange={e => setPlanDesc(e.target.value)}
              placeholder="Description (optional)"
              className="form-input"
            />
            <div className="flex gap-2">
              <button type="submit" disabled={planSaving} className="btn btn-primary" style={{ height: 36, fontSize: 13 }}>
                {planSaving ? 'Creating…' : 'Create'}
              </button>
              <button type="button" onClick={() => setShowPlanForm(false)} className="btn btn-ghost" style={{ height: 36, fontSize: 13 }}>
                Cancel
              </button>
            </div>
          </form>
        )}

        {plansError && (
          <p className="text-sm" style={{ color: 'var(--color-error)' }}>Could not load plans.</p>
        )}

        <div className="flex flex-col gap-2">
          {plansLoading
            ? [1, 2].map(i => <SkeletonCard key={i} variant="list" />)
            : plans.map(plan => {
                const canDelete = canManageMembers || plan.created_by === user?.id
                return (
                  <div
                    key={plan.id}
                    className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)]"
                    style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
                  >
                    <Link
                      to={`/plans/${plan.id}`}
                      className="flex-1 font-medium text-sm no-underline hover:underline"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {plan.title}
                    </Link>
                    {plan.is_archived && (
                      <span
                        className="role-badge"
                        style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--color-text-muted)' }}
                      >
                        Archived
                      </span>
                    )}
                    {canDelete && (
                      <button onClick={() => setDeletePlanTarget(plan)} className="btn btn-danger btn-sm">
                        Delete
                      </button>
                    )}
                  </div>
                )
              })
          }
        </div>
      </section>

      <ConfirmDialog
        open={!!removeTarget}
        title="Remove Member"
        description={`Remove ${removeTarget?.username ?? 'this member'} from the workgroup?`}
        onConfirm={handleRemoveMember}
        onCancel={() => setRemoveTarget(null)}
      />
      <ConfirmDialog
        open={!!deletePlanTarget}
        title="Delete Plan"
        description={`Delete "${deletePlanTarget?.title}"? This cannot be undone.`}
        onConfirm={handleDeletePlan}
        onCancel={() => setDeletePlanTarget(null)}
      />
    </div>
  )
}
