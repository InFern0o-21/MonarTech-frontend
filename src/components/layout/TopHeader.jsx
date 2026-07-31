import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import logoMark from '../../assets/logo/monartech-mark.svg'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'

function getInitials(user) {
  if (!user) return '?'
  const first = user.first_name?.[0] ?? ''
  const last  = user.last_name?.[0]  ?? ''
  return (first + last).toUpperCase() || user.username?.[0]?.toUpperCase() || '?'
}

export default function TopHeader({ onMenuClick }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header
      className="h-14 flex items-center justify-between px-4 flex-shrink-0 sticky top-0 z-30"
      style={{
        background: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Hamburger */}
      <button
        onClick={onMenuClick}
        aria-label="Open menu"
        className="w-9 h-9 flex flex-col items-center justify-center gap-[5px]
                   bg-transparent border-none cursor-pointer p-1 rounded-[var(--radius-sm)]
                   hover:bg-white/6 transition-colors"
      >
        <span className="block w-5 h-0.5 rounded-[1px]" style={{ background: 'var(--color-text)' }} />
        <span className="block w-5 h-0.5 rounded-[1px]" style={{ background: 'var(--color-text)' }} />
        <span className="block w-5 h-0.5 rounded-[1px]" style={{ background: 'var(--color-text)' }} />
      </button>

      {/* Logo */}
      <img src={logoMark} alt="Monartech" className="w-7 h-7" />

      {/* Avatar dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            aria-label="User menu"
            className="w-9 h-9 rounded-full text-[13px] font-bold cursor-pointer
                       flex items-center justify-center transition-opacity hover:opacity-80"
            style={{
              background: 'var(--color-primary-dim)',
              border: '2px solid var(--color-primary)',
              color: 'var(--color-primary)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            {getInitials(user)}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => navigate('/profile')}>
            Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={logout} className="text-red-400">
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
