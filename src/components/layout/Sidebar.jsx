import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import apiClient from '../../lib/apiClient'
import logoMark from '../../assets/logo/monartech-mark.svg'
import ConfirmDialog from '../shared/ConfirmDialog'

export default function Sidebar({ isOpen, onClose, isMobile }) {
  const { logout, user } = useAuth()
  const location = useLocation()

  const [plans,         setPlans]         = useState([])
  const [plansLoading,  setPlansLoading]  = useState(true)
  const [plansError,    setPlansError]    = useState(false)
  const [plansExpanded, setPlansExpanded] = useState(true)
  const [confirmLogout, setConfirmLogout] = useState(false)

  async function fetchPlans() {
    setPlansLoading(true); setPlansError(false)
    try {
      const { data } = await apiClient.get('/api/plans/')
      setPlans(data.results ?? data)
    } catch {
      setPlansError(true)
    } finally {
      setPlansLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return
    fetchPlans()
  }, [user?.id])

  // Keep plans in sync when navigating (refetch on route change to plan pages)
  useEffect(() => {
    if (user && location.pathname.startsWith('/plans')) {
      fetchPlans()
    }
  }, [location.pathname])

  // Issue #12: refetch when a plan is created from anywhere (e.g. Dashboard)
  useEffect(() => {
    function onPlanCreated() {
      if (!user) return
      fetchPlans()
    }
    window.addEventListener('plan:created', onPlanCreated)
    return () => window.removeEventListener('plan:created', onPlanCreated)
  }, [user?.id])

  const personalPlans  = plans.filter(p => !p.workgroup)
  const workgroupPlans = plans.filter(p =>  p.workgroup)

  return (
    <>
      {isMobile && isOpen && (
        <div aria-hidden="true" onClick={onClose} className="fixed inset-0 z-40 bg-black/55" />
      )}

      <nav
        aria-label="Main navigation"
        className="fixed top-0 left-0 bottom-0 z-50 flex flex-col overflow-y-auto w-[220px]"
        style={{
          background: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          transform: isMobile ? (isOpen ? 'translateX(0)' : 'translateX(-100%)') : 'translateX(0)',
          transition: 'transform 0.3s cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 py-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <img src={logoMark} alt="Monartech" className="w-7 h-7" />
          <span className="text-[15px] font-bold tracking-tight" style={{ color: 'var(--color-text)' }}>
            Monartech
          </span>
        </div>

        {/* Nav */}
        <div className="flex-1 flex flex-col gap-0.5 p-2 overflow-y-auto">

          {/* Main links */}
          <NavLink to="/dashboard"  onClick={isMobile ? onClose : undefined} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <span className="text-base leading-none">⊞</span> Dashboard
          </NavLink>
          <NavLink to="/workgroups" onClick={isMobile ? onClose : undefined} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <span className="text-base leading-none">⬡</span> Workgroups
          </NavLink>

          {/* Plans section — always rendered, issue #12 */}
          <div className="mt-2">
            {/* Section header */}
            <button
              onClick={() => setPlansExpanded(v => !v)}
              aria-expanded={plansExpanded}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-[var(--radius-sm)]
                         border-none bg-transparent cursor-pointer transition-colors duration-150
                         hover:bg-white/5"
              style={{ fontFamily: 'var(--font-sans)' }}
            >
              <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--color-text-subtle)' }}>
                Plans
              </span>
              <span className="text-[10px]" style={{ color: 'var(--color-text-subtle)' }}>
                {plansExpanded ? '▲' : '▼'}
              </span>
            </button>

            {plansExpanded && (
              <div className="flex flex-col gap-0.5 mt-0.5">
                {/* Issue #12: loading skeletons */}
                {plansLoading && (
                  <>
                    {[1,2,3].map(i => (
                      <div key={i} style={{ height: 30, margin: '2px 8px', borderRadius: 6, background: 'rgba(255,255,255,0.05)', animation: 'skeleton-shimmer 1.4s ease-in-out infinite' }} />
                    ))}
                  </>
                )}

                {/* Issue #11: error state with retry */}
                {!plansLoading && plansError && (
                  <div className="px-3 py-2">
                    <p className="text-[11px] mb-1" style={{ color: 'var(--color-error)' }}>Couldn't load plans.</p>
                    <button onClick={fetchPlans} className="text-[11px] font-medium" style={{ color: 'var(--color-primary)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                      Retry ↻
                    </button>
                  </div>
                )}

                {!plansLoading && !plansError && (
                  <>
                    {/* Personal plans */}
                    {personalPlans.map(plan => (
                      <NavLink
                        key={plan.id}
                        to={`/plans/${plan.id}`}
                        onClick={isMobile ? onClose : undefined}
                        className={({ isActive }) => `nav-link pl-7 text-[13px]${isActive ? ' active' : ''}`}
                      >
                        <span className="text-sm leading-none">◫</span>
                        <span className="truncate">{plan.title}</span>
                      </NavLink>
                    ))}

                    {/* Workgroup plans */}
                    {workgroupPlans.length > 0 && personalPlans.length > 0 && (
                      <div className="mx-3 my-1 h-px" style={{ background: 'var(--color-border)' }} />
                    )}
                    {workgroupPlans.map(plan => (
                      <NavLink
                        key={plan.id}
                        to={`/plans/${plan.id}`}
                        onClick={isMobile ? onClose : undefined}
                        className={({ isActive }) => `nav-link pl-7 text-[13px]${isActive ? ' active' : ''}`}
                        style={{ alignItems: 'flex-start' }}
                      >
                        <span className="text-sm leading-none" style={{ marginTop: 1 }}>◫</span>
                        <span className="flex flex-col min-w-0">
                          <span className="truncate">{plan.title}</span>
                          <span className="truncate text-[10px] font-normal" style={{ color: 'var(--color-text-subtle)', marginTop: 1 }}>
                            {plan.workgroup_name ?? `Workgroup #${plan.workgroup}`}
                          </span>
                        </span>
                      </NavLink>
                    ))}

                    {/* No plans yet hint */}
                    {plans.length === 0 && (
                      <p className="px-3 py-1 text-[11px]" style={{ color: 'var(--color-text-subtle)' }}>
                        No plans yet.
                      </p>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="mt-1">
            <NavLink to="/profile" onClick={isMobile ? onClose : undefined} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <span className="text-base leading-none">◉</span> Profile
            </NavLink>
          </div>
        </div>

        {/* Sign out — issue #10: confirm before logging out */}
        <div className="p-2" style={{ borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={() => setConfirmLogout(true)}
            className="w-full flex items-center gap-2.5 px-3 py-[9px] rounded-[var(--radius-sm)]
                       text-sm font-medium cursor-pointer border-none bg-transparent
                       transition-colors duration-150 hover:bg-red-500/10 hover:text-red-400"
            style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-sans)' }}
          >
            <span className="text-base leading-none">⏻</span>
            Sign out
          </button>
        </div>
      </nav>

      {/* Sign-out confirmation dialog — issue #10 */}
      <ConfirmDialog
        open={confirmLogout}
        title="Sign out"
        description="Sign out of Monartech? You'll need to sign in again to access your account."
        onConfirm={() => { setConfirmLogout(false); logout() }}
        onCancel={() => setConfirmLogout(false)}
      />
    </>
  )
}
