import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useWorkgroups } from '../hooks/useWorkgroups'
import SkeletonCard from '../components/shared/SkeletonCard'
import ConfirmDialog from '../components/shared/ConfirmDialog'

const ROLE_BADGE = {
  owner:  { background: 'rgba(99,102,241,0.18)',  color: '#818cf8' },
  admin:  { background: 'rgba(167,139,250,0.18)', color: '#a78bfa' },
  member: { background: 'rgba(255,255,255,0.08)', color: 'rgba(240,240,248,0.5)' },
}

function WorkgroupCard({ wg, onEdit, onDelete }) {
  const isOwner = wg.role === 'owner'
  const badge   = ROLE_BADGE[wg.role] ?? ROLE_BADGE.member

  return (
    <div className="card">
      <div className="card-top-bar" />
      <div className="card-body">
        <div className="flex items-start gap-3.5 mb-3.5">
          {/* Icon */}
          <div
            className="w-10 h-10 rounded-[10px] flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: 'var(--color-primary-dim)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            ⬡
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="font-bold text-[15px] tracking-tight"
                style={{ color: 'var(--color-text)' }}
              >
                {wg.name}
              </span>
              <span className="role-badge" style={badge}>{wg.role}</span>
            </div>
            {wg.description && (
              <p
                className="mt-1 text-[13px] truncate"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {wg.description}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-wrap">
          <Link
            to={`/workgroups/${wg.id}`}
            className="btn btn-ghost btn-sm"
          >
            View details →
          </Link>
          {isOwner && (
            <>
              <button onClick={() => onEdit(wg)} className="btn btn-ghost btn-sm">Edit</button>
              <button onClick={() => onDelete(wg)} className="btn btn-danger btn-sm">Delete</button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function WorkgroupsPage() {
  const { workgroups, loading, error, refetch, createWorkgroup, updateWorkgroup, deleteWorkgroup } = useWorkgroups()

  const [showForm,     setShowForm]     = useState(false)
  const [editTarget,   setEditTarget]   = useState(null)
  const [name,         setName]         = useState('')
  const [desc,         setDesc]         = useState('')
  const [saving,       setSaving]       = useState(false)
  const [formErr,      setFormErr]      = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)

  function openNew()   { setEditTarget(null); setName(''); setDesc(''); setFormErr(''); setShowForm(true) }
  function openEdit(w) { setEditTarget(w); setName(w.name); setDesc(w.description ?? ''); setFormErr(''); setShowForm(true) }
  function closeForm() { setShowForm(false); setEditTarget(null) }

  async function handleFormSubmit(e) {
    e.preventDefault()
    if (!name.trim()) { setFormErr('Name is required.'); return }
    setSaving(true); setFormErr('')
    try {
      if (editTarget) await updateWorkgroup(editTarget.id, { name: name.trim(), description: desc.trim() })
      else await createWorkgroup({ name: name.trim(), description: desc.trim() })
      closeForm()
    } catch {} finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    try { await deleteWorkgroup(deleteTarget.id) } catch {} finally { setDeleteTarget(null) }
  }

  return (
    <div className="max-w-[800px] mx-auto">

      {/* Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="page-label">Teams</p>
          <h1 className="page-title">Workgroups</h1>
        </div>
        <button
          onClick={showForm ? closeForm : openNew}
          className={`btn ${showForm ? 'btn-ghost' : 'btn-primary'}`}
        >
          {showForm ? '✕ Cancel' : '+ New Workgroup'}
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="card mb-6" style={{ border: '1px solid rgba(99,102,241,0.4)' }}>
          <div className="card-top-bar" />
          <form onSubmit={handleFormSubmit} className="card-body flex flex-col gap-3.5">
            <h3
              className="m-0 text-[15px] font-semibold"
              style={{ color: 'var(--color-text)' }}
            >
              {editTarget ? 'Edit Workgroup' : 'New Workgroup'}
            </h3>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Name *"
              maxLength={100}
              required
              className="form-input"
            />
            <input
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Description (optional)"
              className="form-input"
            />
            {formErr && (
              <span className="text-[13px]" style={{ color: 'var(--color-error)' }}>{formErr}</span>
            )}
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn btn-primary" style={{ height: 38, fontSize: 13 }}>
                {saving ? 'Saving…' : (editTarget ? 'Update' : 'Create')}
              </button>
              <button type="button" onClick={closeForm} className="btn btn-ghost" style={{ height: 38, fontSize: 13 }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="banner-error mb-5">
          Could not load workgroups.
          <button onClick={refetch} className="btn btn-danger btn-sm">Retry</button>
        </div>
      )}

      {/* List */}
      <div className="flex flex-col gap-3">
        {loading
          ? [1, 2, 3].map(i => <SkeletonCard key={i} />)
          : workgroups.length === 0 && !error
            ? (
              <div className="empty-state">
                <div className="text-4xl mb-3 opacity-40">⬡</div>
                <p className="m-0 mb-1 text-base font-semibold" style={{ color: 'var(--color-text)' }}>
                  No workgroups yet
                </p>
                <p className="m-0 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  Create your first team to start collaborating.
                </p>
              </div>
            )
            : workgroups.map(wg => (
              <WorkgroupCard key={wg.id} wg={wg} onEdit={openEdit} onDelete={setDeleteTarget} />
            ))
        }
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Workgroup"
        description={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
