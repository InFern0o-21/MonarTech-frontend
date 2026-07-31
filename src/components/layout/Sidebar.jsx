import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import apiClient from '../../lib/apiClient'
import logoMark from '../../assets/logo/monartech-mark.svg'

export default function Sidebar({ isOpen, onClose, isMobile }) {
  const { logout, user } = useAuth()
  const location = useLocation()

  const [plans,         setPlans]         = useState([])
  const [plansExpanded, setPlansExpanded] = useState(true)

  useEffect(() => {
    if (!user) return
    apiClient.get('/api/plans/')
      .then(({ data }) => setPlans(data.results ?? data))
      .catch(() => {})
  }, [user?.id])

  // Keep plans in sync when navigating (refetch on route change to plan pages)
  useEffect(() => {
    if (user && location.pathname.startsWith('/plans')) {
      apiClient.get('/api/plans/')
        .then(({ data }) => setPlans(data.results ?? data))
        .catch(() => {})
    }
  }, [location.pathname])

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

          {/* Plans section */}
          {plans.length > 0 && (
            <div className="mt-2">
              {/* Section header */}
              <button
                onClick={() => setPlansExpanded(v => !v)}
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

                  {/* Workgroup plans grouped by workgroup */}
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
                </div>
              )}
            </div>
          )}

          {/* Profile */}
          <div className="mt-1">
            <NavLink to="/profile" onClick={isMobile ? onClose : undefined} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
              <span className="text-base leading-none">◉</span> Profile
            </NavLink>
          </div>
        </div>

        {/* Sign out */}
        <div className="p-2" style={{ borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={logout}
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
    </>
  )
}
