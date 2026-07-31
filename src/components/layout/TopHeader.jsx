import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useTheme } from '../../contexts/ThemeContext'
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
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const isModern = theme === 'modern'

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

      {/* Right side */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          title={isModern ? 'Switch to Imperial theme' : 'Switch to Modern theme'}
          style={{
            height: 30, padding: '0 10px',
            borderRadius: 6,
            border: `1px solid ${isModern ? '#2a2a38' : 'rgba(223,207,190,0.2)'}`,
            background: isModern ? 'rgba(99,102,241,0.1)' : 'rgba(223,207,190,0.06)',
            color: isModern ? '#818cf8' : '#c2ab91',
            fontSize: 11, fontWeight: 700,
            letterSpacing: isModern ? 0 : '0.5px',
            textTransform: isModern ? 'none' : 'uppercase',
            cursor: 'pointer',
            fontFamily: 'var(--font-sans)',
            display: 'flex', alignItems: 'center', gap: 5,
            transition: 'all 0.2s',
          }}
        >
          {isModern ? '⚜ Imperial' : '◈ Modern'}
        </button>

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

      </div>
    </header>
  )
}
