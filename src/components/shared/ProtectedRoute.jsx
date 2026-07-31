import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

function FullScreenSpinner() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          border: '3px solid var(--color-border)',
          borderTopColor: 'var(--color-primary)',
          animation: 'panel-spin 0.8s linear infinite',
        }}
      />
    </div>
  )
}

export default function ProtectedRoute() {
  const { user, initialising } = useAuth()

  if (initialising) return <FullScreenSpinner />
  if (user) return <Outlet />
  return <Navigate to="/" replace state={{ openPanel: true }} />
}
