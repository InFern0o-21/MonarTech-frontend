import { useToast } from '../../hooks/useToast'

const STRIP_COLOR = {
  success: 'var(--color-success)',
  error:   'var(--color-error)',
  info:    'var(--color-text-subtle)',
}

export function Toast() {
  const { toasts, removeToast } = useToast()
  if (toasts.length === 0) return null

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
    >
      {toasts.map(toast => (
        <div
          key={toast.id}
          role="alert"
          className="flex items-stretch min-w-[280px] max-w-[360px] overflow-hidden rounded-[var(--radius-md)]"
          style={{
            animation: 'slideInRight 0.3s ease-out',
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {/* Colour strip */}
          <span
            aria-hidden="true"
            className="w-1 flex-shrink-0"
            style={{ background: STRIP_COLOR[toast.variant] ?? STRIP_COLOR.info }}
          />

          {/* Message */}
          <p
            className="flex-1 m-0 py-3 pl-3 pr-2 text-sm leading-snug"
            style={{ color: 'var(--color-text)' }}
          >
            {toast.message}
          </p>

          {/* Close */}
          <button
            onClick={() => removeToast(toast.id)}
            aria-label="Dismiss notification"
            className="flex-shrink-0 self-start px-3 py-2 bg-transparent border-none cursor-pointer
                       text-lg leading-none transition-colors duration-150
                       text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
