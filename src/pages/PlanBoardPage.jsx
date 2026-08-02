import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useTasks } from '../hooks/useTasks'
import { useTaskStatuses } from '../hooks/useTaskStatuses'
import apiClient from '../lib/apiClient'
import { applyFilters, DEFAULT_FILTERS } from '../lib/filterTasks'
import { getTaskEditLevel } from '../lib/taskPermissions'
import TaskCard from '../components/shared/TaskCard'
import SkeletonCard from '../components/shared/SkeletonCard'
import DatePicker from '../components/shared/DatePicker'

const PRIORITY_OPTIONS = [
  { value: 'LOW',       label: 'Low' },
  { value: 'MEDIUM',    label: 'Medium' },
  { value: 'HIGH',      label: 'High' },
  { value: 'VERY_HIGH', label: 'Very High' },
  { value: 'URGENT',    label: 'Urgent' },
]

const nativeSelectStyle = {
  width: '100%', height: 38, padding: '0 10px',
  borderRadius: 8, boxSizing: 'border-box',
  border: '1.5px solid var(--color-border)',
  background: 'var(--color-surface-2)', color: 'var(--color-text)',
  colorScheme: 'dark', fontSize: 14,
  fontFamily: 'var(--font-sans)', outline: 'none', cursor: 'pointer',
}

const P = {
  bg:      'var(--color-surface)',
  surface: 'var(--color-surface-2)',
  border:  'var(--color-border)',
  text:    'var(--color-text)',
  muted:   'var(--color-text-muted)',
  accent:  'var(--color-primary)',
  success: 'var(--color-success)',
}

// ─── AssigneesSection ─────────────────────────────────────────────────────────
function AssigneesSection({ task, planId, planWorkgroup, canEdit, currentUserId, onAdd, onRemove }) {
  const [planMembers, setPlanMembers] = useState([])
  const [showPicker,  setShowPicker]  = useState(false)
  const [adding,      setAdding]      = useState(null)
  const [searchInput, setSearchInput] = useState('')
  const [searchError, setSearchError] = useState('')

  useEffect(() => {
    if (!planId) return
    apiClient.get('/api/user-plans/', { params: { plan: planId } })
      .then(({ data }) => setPlanMembers(data.results ?? data))
      .catch(() => {})
  }, [planId])

  const assignees   = task.assignees ?? []
  const assignedIds = new Set(assignees.map(a => a.user))
  const isPersonal  = !planWorkgroup
  const candidates  = planMembers.filter(m => m.user !== currentUserId && !assignedIds.has(m.user))

  async function handleAddById(userId) {
    setAdding(userId)
    try { await onAdd(task.id, userId) } finally { setAdding(null); setShowPicker(false) }
  }

  async function handleAddBySearch(e) {
    e.preventDefault()
    if (!searchInput.trim()) return
    setSearchError(''); setAdding('search')
    try {
      const { data } = await apiClient.get('/api/users/', { params: { search: searchInput.trim() } })
      const list = data.results ?? data
      const found = list.find(u => u.username === searchInput.trim() || u.email === searchInput.trim())
      if (!found) { setSearchError('User not found.'); return }
      if (found.id === currentUserId) { setSearchError("That's you."); return }
      if (assignedIds.has(found.id)) { setSearchError('Already assigned.'); return }
      await onAdd(task.id, found.id)
      setSearchInput(''); setShowPicker(false)
    } catch { setSearchError('Failed to add assignee.') }
    finally { setAdding(null) }
  }

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
        <label className="panel-label" style={{ marginBottom:0 }}>👤 Assignees</label>
        {canEdit && (isPersonal || candidates.length > 0) && (
          <button type="button" onClick={() => { setShowPicker(v=>!v); setSearchInput(''); setSearchError('') }}
            className="btn-action-sm"
          >{showPicker ? 'Cancel' : '+ Assign'}</button>
        )}
      </div>
      {assignees.length === 0
        ? <p style={{ margin:'0 0 8px', fontSize:13, color:P.muted }}>No assignees yet.</p>
        : <div style={{ display:'flex', flexDirection:'column', gap:6, marginBottom:8 }}>
            {assignees.map(a => {
              const isMe = a.user === currentUserId
              return (
                <div key={a.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 10px', borderRadius:8, background: isMe?'var(--color-primary-dim)':'rgba(255,255,255,0.04)', border:`1px solid ${isMe?'rgba(99,102,241,0.3)':'transparent'}` }}>
                  <div style={{ width:26, height:26, borderRadius:'50%', background: isMe?'rgba(99,102,241,0.4)':'rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', flexShrink:0 }}>
                    {(a.username??'?')[0].toUpperCase()}
                  </div>
                  <span style={{ flex:1, fontSize:13, color:P.text, fontWeight: isMe?600:400 }}>
                    {a.username??`User #${a.user}`}
                    {isMe && <span style={{ marginLeft:6, fontSize:11, color:P.accent }}>(you)</span>}
                  </span>
                  {canEdit && (
                    <button onClick={() => onRemove(a.id, task.id)} style={{ background:'none', border:'none', cursor:'pointer', color:P.muted, fontSize:15, padding:2, lineHeight:1 }}
                      onMouseEnter={e=>e.currentTarget.style.color='#f87171'} onMouseLeave={e=>e.currentTarget.style.color=P.muted}>×</button>
                  )}
                </div>
              )
            })}
          </div>
      }
      {showPicker && (isPersonal ? (
        <form onSubmit={handleAddBySearch} style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <div style={{ display:'flex', gap:6 }}>
            <input value={searchInput} onChange={e=>{setSearchInput(e.target.value);setSearchError('')}}
              placeholder="Username or email" autoFocus className="panel-input" style={{ flex:1 }} />
            <button type="submit" disabled={adding==='search'||!searchInput.trim()}
              className="btn btn-primary btn-sm" style={{ flexShrink:0, opacity:adding==='search'?0.7:1 }}>
              {adding==='search'?'…':'Add'}
            </button>
          </div>
          {searchError && <span style={{ fontSize:12, color:'#f87171' }}>{searchError}</span>}
        </form>
      ) : (
        <div style={{ border:`1px solid ${P.border}`, borderRadius:8, overflow:'hidden' }}>
          {candidates.map((m,i) => (
            <button key={m.user} type="button" disabled={adding===m.user} onClick={()=>handleAddById(m.user)}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:8, padding:'8px 12px', border:'none', borderBottom: i<candidates.length-1?`1px solid ${P.border}`:'none', background:'rgba(255,255,255,0.03)', color:P.text, fontSize:13, cursor:'pointer', fontFamily:'var(--font-sans)', opacity:adding===m.user?0.6:1 }}
              onMouseEnter={e=>e.currentTarget.style.background='var(--color-primary-dim)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,0.03)'}>
              <div style={{ width:26, height:26, borderRadius:'50%', background:'rgba(255,255,255,0.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', flexShrink:0 }}>
                {(m.username??'?')[0].toUpperCase()}
              </div>
              {adding===m.user?'Assigning…':(m.username??`User #${m.user}`)}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}

// ─── AttachmentsSection ───────────────────────────────────────────────────────
function AttachmentsSection({ taskId, canUpload, canDelete }) {
  const [attachments, setAttachments] = useState([])
  const [uploading,   setUploading]   = useState(false)
  const fileRef = React.useRef(null)

  useEffect(() => {
    apiClient.get('/api/task-attachments/', { params: { task: taskId } })
      .then(({ data }) => setAttachments(data.results ?? data))
      .catch(() => {})
  }, [taskId])

  async function handleUpload(e) {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append('file', file); form.append('task', taskId)
      const { data } = await apiClient.post('/api/task-attachments/', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      setAttachments(prev => [...prev, data])
    } catch (err) { alert(err?.response?.data?.file?.[0] ?? 'Upload failed.') }
    finally { setUploading(false); e.target.value = '' }
  }

  async function handleDelete(id) {
    await apiClient.delete(`/api/task-attachments/${id}/`)
    setAttachments(prev => prev.filter(a => a.id !== id))
  }

  function fileIcon(mime='') {
    if (mime.startsWith('image/')) return '🖼️'
    if (mime==='application/pdf') return '📄'
    if (mime.includes('word')) return '📝'
    if (mime.includes('excel')||mime.includes('spreadsheet')) return '📊'
    return '📎'
  }
  function humanSize(b) {
    if (b<1024) return `${b} B`
    if (b<1024*1024) return `${(b/1024).toFixed(1)} KB`
    return `${(b/(1024*1024)).toFixed(1)} MB`
  }

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
        <label className="panel-label" style={{ marginBottom:0 }}>📎 Attachments {attachments.length>0&&`(${attachments.length})`}</label>
        {canUpload && (
          <>
            <button type="button" onClick={()=>fileRef.current?.click()} disabled={uploading}
              className="btn-action-sm" style={{ opacity:uploading?0.6:1 }}>
              {uploading?'Uploading…':'+ Add'}
            </button>
            <input ref={fileRef} type="file" style={{ display:'none' }} onChange={handleUpload} />
          </>
        )}
      </div>
      {attachments.length===0
        ? <p style={{ margin:0, fontSize:13, color:P.muted }}>No attachments yet.</p>
        : <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
            {attachments.map(a => (
              <div key={a.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', borderRadius:8, background:'rgba(255,255,255,0.04)', border:`1px solid ${P.border}` }}>
                <span style={{ fontSize:18, flexShrink:0 }}>{fileIcon(a.mimetype)}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ margin:0, fontSize:13, color:P.text, fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{a.filename}</p>
                  <p style={{ margin:0, fontSize:11, color:P.muted }}>{humanSize(a.size)}</p>
                </div>
                <a href={a.url} target="_blank" rel="noreferrer" style={{ color:P.muted, fontSize:16, textDecoration:'none', flexShrink:0 }} title="Open">↗</a>
                {canDelete && (
                  <button onClick={()=>handleDelete(a.id)} style={{ background:'none', border:'none', cursor:'pointer', color:P.muted, fontSize:14, padding:2, flexShrink:0 }}
                    onMouseEnter={e=>e.currentTarget.style.color='#f87171'} onMouseLeave={e=>e.currentTarget.style.color=P.muted}>×</button>
                )}
              </div>
            ))}
          </div>
      }
    </div>
  )
}

// ─── ChecklistSection ─────────────────────────────────────────────────────────
function ChecklistSection({ taskId, canEdit }) {
  const [items,    setItems]    = useState([])
  const [newText,  setNewText]  = useState('')
  const [adding,   setAdding]   = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    apiClient.get('/api/task-checklist/', { params: { task: taskId } })
      .then(({ data }) => setItems(data.results ?? data))
      .catch(() => {})
  }, [taskId])

  async function handleAdd(e) {
    e.preventDefault(); if (!newText.trim()) return
    setAdding(true)
    try {
      const { data } = await apiClient.post('/api/task-checklist/', { task: taskId, text: newText.trim() })
      setItems(prev => [...prev, data]); setNewText(''); setShowForm(false)
    } catch {} finally { setAdding(false) }
  }

  async function handleToggle(item) {
    const { data } = await apiClient.patch(`/api/task-checklist/${item.id}/`, { is_done: !item.is_done })
    setItems(prev => prev.map(i => i.id===item.id ? data : i))
  }

  async function handleDelete(id) {
    await apiClient.delete(`/api/task-checklist/${id}/`)
    setItems(prev => prev.filter(i => i.id!==id))
  }

  const done=items.filter(i=>i.is_done).length, total=items.length
  const pct=total>0?Math.round((done/total)*100):0

  return (
    <div>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:8 }}>
        <label className="panel-label" style={{ marginBottom:0 }}>☑ Checklist {total>0&&`${done}/${total}`}</label>
        {canEdit && (
          <button type="button" onClick={()=>setShowForm(v=>!v)}
            className="btn-action-sm">
            {showForm?'Cancel':'+ Add item'}
          </button>
        )}
      </div>
      {total>0 && (
        <div style={{ marginBottom:10 }}>
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
            <span style={{ fontSize:11, color:P.muted }}>{pct}%</span>
          </div>
          <div style={{ height:4, borderRadius:2, background:'rgba(255,255,255,0.08)', overflow:'hidden' }}>
            <div style={{ height:'100%', width:`${pct}%`, borderRadius:2, background:pct===100?P.success:P.accent, transition:'width 0.3s' }} />
          </div>
        </div>
      )}
      <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
        {items.map(item => (
          <div key={item.id} style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'6px 8px', borderRadius:6, background:'rgba(255,255,255,0.03)' }}>
            <input type="checkbox" checked={item.is_done} onChange={()=>canEdit&&handleToggle(item)}
              style={{ marginTop:2, accentColor:P.accent, cursor:canEdit?'pointer':'default', flexShrink:0 }} />
            <span style={{ flex:1, fontSize:13, color:item.is_done?P.muted:P.text, textDecoration:item.is_done?'line-through':'none', lineHeight:1.4 }}>{item.text}</span>
            {canEdit && (
              <button onClick={()=>handleDelete(item.id)} style={{ background:'none', border:'none', cursor:'pointer', color:P.muted, fontSize:14, padding:2, lineHeight:1 }}
                onMouseEnter={e=>e.currentTarget.style.color='#f87171'} onMouseLeave={e=>e.currentTarget.style.color=P.muted}>×</button>
            )}
          </div>
        ))}
      </div>
      {showForm && (
        <form onSubmit={handleAdd} style={{ display:'flex', gap:6, marginTop:8 }}>
          <input value={newText} onChange={e=>setNewText(e.target.value)} placeholder="Add an item…" autoFocus className="panel-input" style={{ flex:1 }} />
          <button type="submit" disabled={adding||!newText.trim()}
            className="btn btn-primary btn-sm" style={{ flexShrink:0, opacity:adding?0.7:1 }}>
            {adding?'…':'Add'}
          </button>
        </form>
      )}
    </div>
  )
}

// ─── TaskDetailModal ──────────────────────────────────────────────────────────
// On mobile  → slides up from the bottom as a bottom sheet (max 92vh, drag handle)
// On desktop → centered modal, max 600px wide
function TaskDetailModal({ task, statuses, editLevel, onUpdate, onClose, onRemoveAssignee, onAddAssignee, currentUserId, userPlanRole }) {
  const [saving,    setSaving]    = useState(false)
  const [mounted,   setMounted]   = useState(false)
  const [visible,   setVisible]   = useState(false)

  // ── Draft state — nothing hits the API until Save is clicked ──
  const [draft, setDraft] = useState({
    title:       task.title       ?? '',
    description: task.description ?? '',
    priority:    task.priority    ?? 'MEDIUM',
    due_date:    task.due_date ? task.due_date.split('T')[0] : '',
  })
  const [discardWarning, setDiscardWarning] = useState(false)

  const isDirty = (
    draft.title       !== (task.title       ?? '')       ||
    draft.description !== (task.description ?? '')       ||
    draft.priority    !== (task.priority    ?? 'MEDIUM') ||
    draft.due_date    !== (task.due_date ? task.due_date.split('T')[0] : '')
  )

  function setField(key) { return val => setDraft(d => ({ ...d, [key]: val })) }

  // animate in
  useEffect(() => {
    setMounted(true)
    requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
  }, [])

  function handleClose() {
    if (isDirty) { setDiscardWarning(true); return }
    doClose()
  }
  function doClose() {
    setVisible(false)
    setTimeout(() => { setMounted(false); onClose() }, 280)
  }

  // Escape key — warn if dirty
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isDirty])

  if (!mounted) return null

  const canEdit   = editLevel === 'full'
  const canStatus = editLevel !== 'read-only'

  const canUploadAttachment = editLevel !== 'read-only'
  const isPrivileged = canEdit || userPlanRole === 'owner' || userPlanRole === 'admin'
  const canDeleteAttachment = isPrivileged

  // Status changes remain instant — no draft needed
  async function handleStatusChange(statusId) {
    setSaving(true)
    try { await onUpdate(task.id, { status: statusId }) } finally { setSaving(false) }
  }

  // Explicit save of draft fields
  async function handleSaveDraft() {
    if (!draft.title.trim()) return
    setSaving(true)
    try {
      await onUpdate(task.id, {
        title:       draft.title.trim(),
        description: draft.description,
        priority:    draft.priority,
        due_date:    draft.due_date || null,
      })
      setDiscardWarning(false)
    } finally { setSaving(false) }
  }

  const priorityMeta = {
    LOW:       { label:'Low',       color:'#6ee7b7' },
    MEDIUM:    { label:'Medium',    color:'#93c5fd' },
    HIGH:      { label:'High',      color:'#fcd34d' },
    VERY_HIGH: { label:'Very High', color:'#fb923c' },
    URGENT:    { label:'Urgent',    color:'#f87171' },
  }

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={handleClose}
        style={{
          position:'fixed', inset:0, zIndex:50,
          background:'rgba(0,0,0,0.6)',
          backdropFilter:'blur(2px)',
          transition:'opacity 0.28s ease',
          opacity: visible ? 1 : 0,
        }}
      />

      {/* Sheet / Modal */}
      <div
        role="dialog"
        aria-modal
        aria-label="Task details"
        style={{
          position:'fixed', zIndex:51,
          fontFamily:'var(--font-sans)',
          background: 'var(--gradient-card)',
          display:'flex', flexDirection:'column',

          /* ── mobile: bottom sheet ── */
          bottom:0, left:0, right:0,
          maxHeight:'92dvh',
          borderRadius:'20px 20px 0 0',
          boxShadow:'0 -8px 40px rgba(0,0,0,0.6)',
          transition:'transform 0.28s cubic-bezier(0.32,0.72,0,1)',
          transform: visible ? 'translateY(0)' : 'translateY(100%)',
        }}
        className="task-detail-modal"
      >
        {/* Drag handle (mobile visual cue) */}
        <div style={{ display:'flex', justifyContent:'center', paddingTop:10, paddingBottom:4, flexShrink:0 }}>
          <div style={{ width:36, height:4, borderRadius:2, background:'rgba(255,255,255,0.15)' }} />
        </div>

        {/* Header — sticky */}
        <div style={{
          display:'flex', alignItems:'flex-start', gap:12,
          padding:'8px 16px 12px',
          borderBottom:`1px solid ${P.border}`,
          flexShrink:0,
        }}>
          <div style={{ flex:1, minWidth:0 }}>
            {canEdit
              ? <input
                  value={draft.title}
                  onChange={e => setField('title')(e.target.value)}
                  placeholder="Task title"
                  style={{
                    width:'100%', background:'transparent', border:'none', outline:'none',
                    fontSize:17, fontWeight:700, color:'#fff', fontFamily:'var(--font-sans)',
                    padding:0, lineHeight:1.3,
                  }}
                />
              : <h2 style={{ margin:0, fontSize:17, fontWeight:700, color:'#fff', lineHeight:1.3 }}>{task.title}</h2>
            }
            {/* Status pills row */}
            <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginTop:8 }}>
              {canStatus ? (
                statuses.map(s => {
                  const active = (task.status?.id ?? task.status) === s.id
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => { if (!active) handleStatusChange(s.id) }}
                      style={{
                        height:28, padding:'0 10px', borderRadius:14,
                        border: active ? `1.5px solid ${s.color || P.accent}` : `1.5px solid rgba(255,255,255,0.1)`,
                        background: active ? (s.color ? s.color + '22' : 'var(--color-primary-dim)') : 'rgba(255,255,255,0.04)',
                        color: active ? (s.color || P.accent) : 'rgba(255,255,255,0.45)',
                        fontSize:12, fontWeight: active ? 700 : 500,
                        cursor: active ? 'default' : 'pointer',
                        fontFamily:'var(--font-sans)',
                        transition:'all 0.15s',
                        flexShrink:0,
                      }}
                    >
                      {s.name}
                    </button>
                  )
                })
              ) : (
                <span style={{
                  height:28, lineHeight:'28px', padding:'0 10px', borderRadius:14,
                  background:'rgba(255,255,255,0.06)', color:'rgba(255,255,255,0.5)',
                  fontSize:12, fontWeight:500,
                }}>
                  {task.status?.name ?? '—'}
                </span>
              )}
            </div>
          </div>

          {/* Close button — large tap target */}
          <button
            onClick={handleClose}
            aria-label="Close"
            style={{
              flexShrink:0, width:36, height:36,
              borderRadius:10, border:`1px solid ${P.border}`,
              background:'rgba(255,255,255,0.05)',
              color:'rgba(255,255,255,0.5)', fontSize:18,
              cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
              marginTop:2,
            }}
          >✕</button>
        </div>

        {/* Scrollable body */}
        <div style={{ flex:1, overflowY:'auto', WebkitOverflowScrolling:'touch', padding:'16px 16px 32px' }}>

          {/* Completion banner */}
          {task.status?.is_terminal && task.completed_by && (
            <div style={{
              marginBottom:16, padding:'10px 14px', borderRadius:10,
              background:'rgba(74,222,128,0.08)', border:'1px solid rgba(74,222,128,0.2)', color:'#4ade80',
              fontSize:13,
            }}>
              ✓ Completed by <strong>{task.completed_by_username ?? task.completed_by}</strong>
              {task.completed_at && ` on ${new Date(task.completed_at).toLocaleDateString()}`}
            </div>
          )}

          {/* Priority + Due date row */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
            <div>
              <label style={{ display:'block', fontSize:11, fontWeight:600, color:P.muted, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>Priority</label>
              {canEdit ? (
                <select
                  value={draft.priority}
                  onChange={e => setField('priority')(e.target.value)}
                  style={{ ...nativeSelectStyle, height:40, fontSize:13 }}
                >
                  {PRIORITY_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>
              ) : (
                <span style={{
                  display:'inline-flex', alignItems:'center', gap:5,
                  height:32, padding:'0 10px', borderRadius:8,
                  background:'rgba(255,255,255,0.05)', fontSize:13,
                  color: priorityMeta[task.priority]?.color ?? '#fff',
                  fontWeight:600,
                }}>
                  {priorityMeta[task.priority]?.label ?? task.priority}
                </span>
              )}
            </div>
            <div>
              <label style={{ display:'block', fontSize:11, fontWeight:600, color:P.muted, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>Due date</label>
              {canEdit ? (
                <DatePicker
                  value={draft.due_date}
                  onChange={val => setField('due_date')(val)}
                  placeholder="Pick a date"
                />
              ) : task.due_date ? (
                <span style={{ fontSize:13, color:'#fff' }}>{new Date(task.due_date).toLocaleDateString()}</span>
              ) : (
                <span style={{ fontSize:13, color:P.muted }}>—</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div style={{ marginBottom:16 }}>
            <label style={{ display:'block', fontSize:11, fontWeight:600, color:P.muted, textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:6 }}>Description</label>
            {canEdit ? (
              <textarea
                value={draft.description}
                onChange={e => setField('description')(e.target.value)}
                placeholder="Add a description…"
                rows={3}
                style={{
                  width:'100%', boxSizing:'border-box',
                  background:'rgba(255,255,255,0.04)', border:`1.5px solid ${P.border}`,
                  borderRadius:10, padding:'10px 12px', color:'#fff',
                  fontSize:14, fontFamily:'var(--font-sans)', lineHeight:1.55,
                  resize:'vertical', outline:'none', minHeight:80,
                }}
              />
            ) : task.description ? (
              <p style={{ margin:0, fontSize:14, color:'rgba(255,255,255,0.85)', lineHeight:1.6, whiteSpace:'pre-wrap' }}>{task.description}</p>
            ) : (
              <p style={{ margin:0, fontSize:13, color:P.muted }}>No description.</p>
            )}
          </div>

          {/* Divider */}
          <div style={{ height:1, background:P.border, margin:'4px 0 16px' }} />

          {/* Assignees */}
          <div style={{ marginBottom:16 }}>
            <AssigneesSection
              task={task}
              planId={task.plan}
              planWorkgroup={task.plan_workgroup ?? null}
              canEdit={canEdit}
              currentUserId={currentUserId}
              onAdd={onAddAssignee}
              onRemove={onRemoveAssignee}
            />
          </div>

          {/* Divider */}
          <div style={{ height:1, background:P.border, margin:'4px 0 16px' }} />

          {/* Checklist */}
          <div style={{ marginBottom:16 }}>
            <ChecklistSection taskId={task.id} canEdit={canEdit} />
          </div>

          {/* Divider */}
          <div style={{ height:1, background:P.border, margin:'4px 0 16px' }} />

          {/* Attachments */}
          <div style={{ marginBottom:16 }}>
            <AttachmentsSection taskId={task.id} canUpload={canUploadAttachment} canDelete={canDeleteAttachment} />
          </div>

          {/* Meta */}
          <div style={{ marginTop:8, fontSize:12, color:P.muted, display:'flex', flexDirection:'column', gap:3 }}>
            {task.created_by_username && <span>Created by {task.created_by_username}</span>}
            {task.is_archived && <span style={{ color:'#f59e0b' }}>⚠ Archived</span>}
          </div>
        </div>

        {/* ── Discard warning — shown when closing with unsaved changes ── */}
        {discardWarning && (
          <div style={{
            flexShrink:0, padding:'12px 16px',
            borderTop:`1px solid rgba(251,146,60,0.3)`,
            background:'rgba(251,146,60,0.08)',
            display:'flex', alignItems:'center', justifyContent:'space-between', gap:12,
          }}>
            <span style={{ fontSize:13, color:'#fb923c' }}>You have unsaved changes.</span>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={() => { setDiscardWarning(false); doClose() }}
                style={{ height:32, padding:'0 14px', borderRadius:6, border:'1px solid rgba(251,146,60,0.4)',
                  background:'transparent', color:'#fb923c', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:'var(--font-sans)' }}>
                Discard
              </button>
              <button onClick={async () => { await handleSaveDraft(); doClose() }}
                className="btn btn-primary btn-sm">
                Save & close
              </button>
            </div>
          </div>
        )}

        {/* ── Sticky save footer — only visible when there are unsaved changes ── */}
        {canEdit && isDirty && !discardWarning && (
          <div style={{
            flexShrink:0, padding:'10px 16px',
            borderTop:`1px solid ${P.border}`,
            background:'var(--color-surface)',
            display:'flex', alignItems:'center', justifyContent:'space-between', gap:12,
          }}>
            <span style={{ fontSize:12, color:P.muted }}>Unsaved changes</span>
            <div style={{ display:'flex', gap:8 }}>
              <button
                onClick={() => setDraft({ title: task.title ?? '', description: task.description ?? '', priority: task.priority ?? 'MEDIUM', due_date: task.due_date ? task.due_date.split('T')[0] : '' })}
                className="btn btn-ghost btn-sm">
                Discard
              </button>
              <button onClick={handleSaveDraft} disabled={saving || !draft.title.trim()}
                className="btn btn-primary btn-sm" style={{ opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving…' : 'Save changes'}
              </button>
            </div>
          </div>
        )}

        {/* Saving progress bar */}
        {saving && (
          <div style={{
            position:'absolute', top:0, left:0, right:0, height:2,
            background:`linear-gradient(90deg, ${P.accent}, #8b5cf6)`,
            borderRadius:'20px 20px 0 0',
            animation:'saving-pulse 1s ease-in-out infinite',
          }} />
        )}
      </div>

      <style>{`
        @media (min-width: 640px) {
          .task-detail-modal {
            top: 50% !important;
            bottom: auto !important;
            left: 50% !important;
            right: auto !important;
            width: calc(100% - 32px) !important;
            max-width: 580px !important;
            max-height: 88vh !important;
            border-radius: 18px !important;
            transform: ${visible ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.96)'} !important;
            transition: opacity 0.25s ease, transform 0.25s ease !important;
            opacity: ${visible ? 1 : 0} !important;
            box-shadow: 0 24px 80px rgba(0,0,0,0.7) !important;
          }
        }
        @keyframes saving-pulse {
          0%,100% { opacity:1 } 50% { opacity:0.4 }
        }
      `}</style>
    </>
  )
}

// ─── TaskFormModal ────────────────────────────────────────────────────────────
function TaskFormModal({ planId, statuses, createTask, onCreated, onClose }) {
  const [title,   setTitle]   = useState('')
  const [desc,    setDesc]    = useState('')
  const [priority,setPriority]= useState('MEDIUM')
  const [dueDate, setDueDate] = useState('')
  const [saving,  setSaving]  = useState(false)
  const [errors,  setErrors]  = useState({})

  // default to the first non-terminal status (i.e. "To Do")
  const defaultStatus = statuses.find(s => !s.is_terminal) ?? statuses[0]

  async function handleSubmit(e) {
    e.preventDefault(); setErrors({})
    if (!title.trim()) { setErrors({ title:'Title is required.' }); return }
    if (!defaultStatus) { setErrors({ status: 'No statuses available for this plan.' }); return }
    setSaving(true)
    try {
      const created = await createTask({ title:title.trim(), plan:Number(planId), status:defaultStatus.id, description:desc.trim()||undefined, priority, due_date:dueDate||undefined })
      onCreated(created); onClose()
    } catch (err) {
      const data = err?.response?.data??{}
      setErrors(Object.fromEntries(Object.entries(data).map(([k,v])=>[k,Array.isArray(v)?v[0]:v])))
    } finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-5">
      <div aria-hidden onClick={onClose} className="absolute inset-0" style={{ background:'rgba(0,0,0,0.6)' }} />
      <div role="dialog" aria-modal aria-label="New task"
        style={{ position:'relative', width:'100%', maxWidth:480, borderRadius:16, padding:24, background:'var(--gradient-card)', border:`1px solid ${P.border}`, fontFamily:'var(--font-sans)' }}>
        <h2 style={{ margin:'0 0 20px', fontSize:18, fontWeight:700, color:'#fff' }}>New Task</h2>
        <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
          <div>
            <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title *" className="panel-input" />
            {errors.title&&<span style={{ fontSize:12, color:'#f87171', display:'block', marginTop:4 }}>{errors.title}</span>}
          </div>
          <textarea value={desc} onChange={e=>setDesc(e.target.value)} placeholder="Description (optional)" rows={3}
            className="panel-input" style={{ height:'auto', padding:'8px 12px', resize:'vertical' }} />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            <div>
              <label className="panel-label">Priority</label>
              <select value={priority} onChange={e=>setPriority(e.target.value)} style={nativeSelectStyle}>
                {PRIORITY_OPTIONS.map(p=><option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="panel-label">Due date (optional)</label>
            <DatePicker value={dueDate} onChange={setDueDate} placeholder="Pick a due date" />
          </div>
          <div style={{ display:'flex', gap:8, marginTop:4 }}>
            <button type="submit" disabled={saving}
              className="btn btn-primary" style={{ flex:1, height:42, borderRadius:9, opacity:saving?0.7:1 }}>
              {saving?'Creating…':'Create Task'}
            </button>
            <button type="button" onClick={onClose}
              className="btn btn-ghost" style={{ height:42, padding:'0 18px', borderRadius:9 }}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── ManageStatusesModal ──────────────────────────────────────────────────────
function ManageStatusesModal({ planId, statuses, onClose, createStatus, updateStatus, deleteStatus }) {
  const [editingId,  setEditingId]  = useState(null)
  const [editName,   setEditName]   = useState('')
  const [editColor,  setEditColor]  = useState('')
  const [editOrder,  setEditOrder]  = useState(0)
  const [editTerm,   setEditTerm]   = useState(false)
  const [newName,    setNewName]    = useState('')
  const [newColor,   setNewColor]   = useState('#6366f1')
  const [newTerm,    setNewTerm]    = useState(false)
  const [saving,     setSaving]     = useState(false)
  const [deleting,   setDeleting]   = useState(null)
  const [error,      setError]      = useState('')

  function startEdit(s) {
    setEditingId(s.id); setEditName(s.name); setEditColor(s.color || ''); setEditOrder(s.order); setEditTerm(s.is_terminal); setError('')
  }

  async function handleUpdate(e) {
    e.preventDefault(); setError('')
    if (!editName.trim()) { setError('Name is required.'); return }
    setSaving(true)
    try {
      await updateStatus(editingId, { name: editName.trim(), color: editColor, order: editOrder, is_terminal: editTerm })
      setEditingId(null)
    } catch (err) {
      setError(err?.response?.data?.detail ?? err?.response?.data?.name?.[0] ?? 'Failed to update.')
    } finally { setSaving(false) }
  }

  async function handleCreate(e) {
    e.preventDefault(); setError('')
    if (!newName.trim()) { setError('Name is required.'); return }
    setSaving(true)
    try {
      await createStatus({ name: newName.trim(), color: newColor, is_terminal: newTerm, order: (statuses[statuses.length - 1]?.order ?? 0) + 10 })
      setNewName(''); setNewColor('#6366f1'); setNewTerm(false)
    } catch (err) {
      setError(err?.response?.data?.detail ?? err?.response?.data?.name?.[0] ?? 'Failed to create.')
    } finally { setSaving(false) }
  }

  async function handleDelete(s) {
    if (!window.confirm(`Delete status "${s.name}"? Tasks using it must be re-assigned first.`)) return
    setDeleting(s.id); setError('')
    try {
      await deleteStatus(s.id)
    } catch (err) {
      const msg = err?.response?.data
      const text = typeof msg === 'string' ? msg : (msg?.detail ?? msg?.[0] ?? 'Cannot delete — tasks may still use this status.')
      setError(text)
    } finally { setDeleting(null) }
  }

  const colorDot = (color) => color
    ? <span style={{ display:'inline-block', width:10, height:10, borderRadius:'50%', background:color, marginRight:6, verticalAlign:'middle', flexShrink:0 }} />
    : <span style={{ display:'inline-block', width:10, height:10, borderRadius:'50%', background:'rgba(255,255,255,0.15)', marginRight:6, verticalAlign:'middle', flexShrink:0 }} />

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-5">
      <div aria-hidden onClick={onClose} className="absolute inset-0" style={{ background:'rgba(0,0,0,0.65)' }} />
      <div role="dialog" aria-modal aria-label="Manage statuses"
        style={{ position:'relative', width:'100%', maxWidth:460, borderRadius:16, background:'var(--gradient-card)', border:`1px solid ${P.border}`, fontFamily:'var(--font-sans)', maxHeight:'90vh', display:'flex', flexDirection:'column' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:`1px solid ${P.border}` }}>
          <h2 style={{ margin:0, fontSize:16, fontWeight:700, color:'#fff' }}>Manage Statuses</h2>
          <button onClick={onClose} style={{ background:'none', border:`1px solid ${P.border}`, borderRadius:6, color:'rgba(255,255,255,0.5)', width:30, height:30, cursor:'pointer', fontSize:16 }}>✕</button>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:20, display:'flex', flexDirection:'column', gap:12 }}>
          {error && <div style={{ padding:'8px 12px', borderRadius:8, background:'rgba(248,113,113,0.1)', border:'1px solid rgba(248,113,113,0.3)', color:'#f87171', fontSize:13 }}>{error}</div>}

          {/* Existing statuses */}
          {statuses.map(s => (
            <div key={s.id}>
              {editingId === s.id ? (
                <form onSubmit={handleUpdate} style={{ display:'flex', flexDirection:'column', gap:8, padding:12, borderRadius:10, background:'rgba(255,255,255,0.04)', border:`1px solid ${P.border}` }}>
                  <div style={{ display:'flex', gap:8 }}>
                    <input value={editName} onChange={e=>setEditName(e.target.value)} placeholder="Status name" autoFocus
                      style={{ flex:1, height:36, padding:'0 10px', borderRadius:8, border:`1.5px solid ${P.border}`, background:'var(--color-surface)', color:'var(--color-text)', fontSize:13, fontFamily:'var(--font-sans)', outline:'none' }} />
                    <input type="color" value={editColor || '#6366f1'} onChange={e=>setEditColor(e.target.value)}
                      style={{ width:36, height:36, padding:2, borderRadius:8, border:`1.5px solid ${P.border}`, background:'var(--color-surface)', cursor:'pointer' }} title="Pick a color" />
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <input type="number" value={editOrder} onChange={e=>setEditOrder(Number(e.target.value))} placeholder="Order"
                      style={{ width:70, height:34, padding:'0 8px', borderRadius:8, border:`1.5px solid ${P.border}`, background:'var(--color-surface)', color:'var(--color-text)', fontSize:13, fontFamily:'var(--font-sans)', outline:'none' }} />
                    <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'rgba(255,255,255,0.6)', cursor:'pointer', userSelect:'none' }}>
                      <input type="checkbox" checked={editTerm} onChange={e=>setEditTerm(e.target.checked)} style={{ accentColor:P.accent }} />
                      Mark as "Done" (terminal)
                    </label>
                  </div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button type="submit" disabled={saving}
                      className="btn btn-primary btn-sm" style={{ flex:1, opacity:saving?0.7:1 }}>
                      {saving ? 'Saving…' : 'Save'}
                    </button>
                    <button type="button" onClick={()=>setEditingId(null)}
                      className="btn btn-ghost btn-sm">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 12px', borderRadius:10, background:'rgba(255,255,255,0.03)', border:`1px solid ${P.border}` }}>
                  {colorDot(s.color)}
                  <span style={{ flex:1, fontSize:13, color:'#fff', fontWeight:500 }}>{s.name}</span>
                  {s.is_terminal && <span style={{ fontSize:11, padding:'2px 6px', borderRadius:4, background:'rgba(74,222,128,0.12)', color:'#4ade80', fontWeight:600 }}>DONE</span>}
                  <button onClick={() => startEdit(s)} style={{ background:'none', border:`1px solid ${P.border}`, borderRadius:6, color:'rgba(255,255,255,0.5)', padding:'3px 8px', cursor:'pointer', fontSize:12, fontFamily:'var(--font-sans)' }}>Edit</button>
                  <button onClick={() => handleDelete(s)} disabled={deleting === s.id}
                    style={{ background:'none', border:'1px solid rgba(248,113,113,0.3)', borderRadius:6, color:'#f87171', padding:'3px 8px', cursor:'pointer', fontSize:12, fontFamily:'var(--font-sans)', opacity:deleting===s.id?0.5:1 }}>
                    {deleting === s.id ? '…' : 'Delete'}
                  </button>
                </div>
              )}
            </div>
          ))}

          {/* Add new status */}
          <div style={{ borderTop:`1px solid ${P.border}`, paddingTop:12, marginTop:4 }}>
            <p style={{ margin:'0 0 10px', fontSize:12, fontWeight:600, color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.08em' }}>Add New Status</p>
            <form onSubmit={handleCreate} style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <div style={{ display:'flex', gap:8 }}>
                <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Status name (e.g. In Review)"
                  style={{ flex:1, height:36, padding:'0 10px', borderRadius:8, border:`1.5px solid ${P.border}`, background:'var(--color-surface)', color:'var(--color-text)', fontSize:13, fontFamily:'var(--font-sans)', outline:'none' }} />
                <input type="color" value={newColor} onChange={e=>setNewColor(e.target.value)}
                  style={{ width:36, height:36, padding:2, borderRadius:8, border:`1.5px solid ${P.border}`, background:'var(--color-surface)', cursor:'pointer' }} title="Pick a color" />
              </div>
              <label style={{ display:'flex', alignItems:'center', gap:6, fontSize:13, color:'rgba(255,255,255,0.6)', cursor:'pointer', userSelect:'none' }}>
                <input type="checkbox" checked={newTerm} onChange={e=>setNewTerm(e.target.checked)} style={{ accentColor:P.accent }} />
                Mark as "Done" (terminal)
              </label>
              <button type="submit" disabled={saving || !newName.trim()}
                className="btn-action-sm" style={{ width:'100%', padding:'7px 12px', opacity:saving||!newName.trim()?0.5:1 }}>
                {saving ? 'Adding…' : '+ Add Status'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── PlanBoardPage ────────────────────────────────────────────────────────────
export default function PlanBoardPage() {
  const { id: planId } = useParams()
  const { user } = useAuth()
  const { tasks, loading: tasksLoading, error: tasksError, fetchTasks, createTask, updateTask, addAssignee, removeAssignee } = useTasks()
  const { statuses, loading: statusesLoading, error: statusesError, refetch: refetchStatuses, createStatus, updateStatus, deleteStatus } = useTaskStatuses(planId)

  const [filters,         setFilters]         = useState(DEFAULT_FILTERS)
  const [selectedTask,    setSelectedTask]    = useState(null)
  const [showNewTask,     setShowNewTask]     = useState(false)
  const [showManageStatuses, setShowManageStatuses] = useState(false)
  const [userPlanRole,    setUserPlanRole]    = useState('member')

  useEffect(() => { fetchTasks(planId) }, [planId])

  useEffect(() => {
    if (!user) return
    apiClient.get('/api/user-plans/', { params: { plan: planId } })
      .then(({ data }) => {
        const list = data.results ?? data
        const me = list.find(up => up.user === user?.id)
        if (me) setUserPlanRole(me.role)
      })
      .catch(() => {})
  }, [planId, user?.id])

  const isLoading = tasksLoading || statusesLoading
  const hasError  = tasksError || statusesError
  const filtered  = applyFilters(tasks, filters)
  const hasActiveFilters = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS)
  const editLevel = selectedTask ? getTaskEditLevel(selectedTask, user?.id, userPlanRole, null) : 'read-only'
  const canManageStatuses = userPlanRole === 'owner' || userPlanRole === 'admin'

  function handleTaskUpdated(updated) {
    if (selectedTask?.id === updated.id) setSelectedTask(updated)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-2.5 pb-4 flex-wrap flex-shrink-0">
        <input value={filters.search} onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
          placeholder="Search tasks…" className="form-input h-9 w-[200px] text-[13px]" />
        <select value={filters.priorities[0] ?? ''} onChange={e => setFilters(f => ({ ...f, priorities: e.target.value ? [e.target.value] : [] }))}
          style={{ ...nativeSelectStyle, width:160, height:36, background:'var(--color-surface-2)', border:'1.5px solid var(--color-border)', color:'var(--color-text)' }}>
          <option value="">All priorities</option>
          {PRIORITY_OPTIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
        </select>
        {hasActiveFilters && (
          <button onClick={() => setFilters(DEFAULT_FILTERS)} className="btn btn-ghost h-9 px-3 text-[13px]">Clear filters</button>
        )}
        <div className="flex gap-2 ml-auto">
          {canManageStatuses && (
            <button onClick={() => setShowManageStatuses(true)} className="btn btn-ghost h-9 px-3 text-[13px]" title="Add or edit board columns">
              ⚙ Statuses
            </button>
          )}
          <button onClick={() => setShowNewTask(true)} className="btn btn-primary h-9 px-4 text-[13px]">+ New Task</button>
        </div>
      </div>

      {hasError && (
        <div className="banner-error mb-4">Could not load board data. Please refresh the page.</div>
      )}

      <div className="flex-1 overflow-auto">
        <div className="flex gap-3.5 items-start min-w-max pb-4">
          {isLoading ? (
            // Mirror real column structure: header row + task card skeletons
            [1,2,3].map(i => (
              <div key={i} className="w-[270px] flex-shrink-0 flex flex-col gap-2">
                {/* Column header skeleton */}
                <div className="flex items-center justify-between px-1 py-2">
                  <div style={{
                    height: 10, width: 64, borderRadius: 4,
                    background: 'rgba(255,255,255,0.08)',
                    animation: 'skeleton-shimmer 1.4s ease-in-out infinite',
                    backgroundSize: '200% 100%',
                  }} />
                  <div style={{
                    height: 18, width: 24, borderRadius: 10,
                    background: 'rgba(255,255,255,0.06)',
                  }} />
                </div>
                {/* Task card skeletons */}
                <SkeletonCard variant="task" />
                <SkeletonCard variant="task" />
                <SkeletonCard variant="task" />
              </div>
            ))
          ) : statuses.length === 0 ? (
            <div className="flex flex-col items-center gap-3 pt-16 w-full">
              <p className="text-sm" style={{ color:'var(--color-text-muted)' }}>No statuses yet.</p>
              {canManageStatuses && (
                <button onClick={() => setShowManageStatuses(true)} className="btn btn-ghost btn-sm">+ Add a status</button>
              )}
            </div>
          ) : (
            statuses.map(status => {
              const dot = status.color
                ? <span style={{ display:'inline-block', width:8, height:8, borderRadius:'50%', background:status.color, marginRight:6, verticalAlign:'middle' }} />
                : null
              const colTasks = filtered.filter(t => {
                const sid = t.status?.id ?? t.status
                return sid != null && Number(sid) === status.id
              })
              return (
                <div key={status.id} className="w-[270px] flex-shrink-0 flex flex-col gap-2">
                  <div className="flex items-center justify-between px-1 py-2">
                    <span className="text-[12px] font-bold uppercase tracking-widest" style={{ color:'var(--color-text-muted)' }}>
                      {dot}{status.name}
                    </span>
                    <span className="text-[12px] px-2 py-0.5 rounded-[10px]" style={{ color:'var(--color-text-muted)', background:'rgba(255,255,255,0.06)' }}>{colTasks.length}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {colTasks.map(task => (
                      <TaskCard key={task.id} task={task} onClick={() => setSelectedTask(task)} />
                    ))}
                    {colTasks.length === 0 && (
                      <div className="px-3 py-4 rounded-[10px] text-center" style={{ border:'1px dashed var(--color-border)' }}>
                        <span className="text-[12px]" style={{ color:'var(--color-text-muted)' }}>No tasks</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          statuses={statuses}
          editLevel={editLevel}
          currentUserId={user?.id}
          userPlanRole={userPlanRole}
          onUpdate={async (id, patch) => { const updated = await updateTask(id, patch); handleTaskUpdated(updated) }}
          onAddAssignee={addAssignee}
          onRemoveAssignee={removeAssignee}
          onClose={() => setSelectedTask(null)}
        />
      )}

      {showNewTask && (
        <TaskFormModal planId={planId} statuses={statuses} createTask={createTask} onCreated={() => {}} onClose={() => setShowNewTask(false)} />
      )}

      {showManageStatuses && (
        <ManageStatusesModal
          planId={planId}
          statuses={statuses}
          onClose={() => setShowManageStatuses(false)}
          createStatus={createStatus}
          updateStatus={updateStatus}
          deleteStatus={deleteStatus}
        />
      )}
    </div>
  )
}
