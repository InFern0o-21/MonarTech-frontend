import { useState, useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import TopHeader from './TopHeader'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768)
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

export default function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const isMobile = useIsMobile()

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: 'var(--color-bg)' }}
    >
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        isMobile={isMobile}
      />

      <div
        className="flex flex-col flex-1 overflow-hidden transition-[margin-left] duration-300"
        style={{ marginLeft: isMobile ? 0 : 220 }}
      >
        <TopHeader onMenuClick={() => setSidebarOpen(true)} />
        <main
          className="flex-1 overflow-y-auto p-8"
          style={{ background: 'var(--color-bg)' }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
