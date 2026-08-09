import PriorityBadge from './PriorityBadge'

/**
 * TaskCard — a clickable card summarising a single task.
 *
 * Props:
 *   task    {object} — task object
 *   onClick {function}
 */
export default function TaskCard({ task, onClick, isTerminalColumn = false }) {
  const assigneeCount = task.assignees?.length ?? 0
  const assigneeLabel = assigneeCount === 1 ? '1 assignee' : `${assigneeCount} assignees`

  const dueDate = task.due_date ? new Date(task.due_date) : null
  // Use isTerminalColumn (from parent) as the authoritative source — task.status.is_terminal
  // may be missing if the API returns status as a plain ID or a partial object.
  const isTerminal = isTerminalColumn || (task.status?.is_terminal ?? false)
  const isOverdue  = dueDate && !isTerminal && dueDate < new Date()

  const formattedDue = dueDate
    ? dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={task.title}
      onClick={onClick}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick?.(e)}
      className="flex flex-col gap-2 p-3.5 rounded-[var(--radius-md)] cursor-pointer
                 transition-[border-color,box-shadow] duration-150
                 hover:border-[var(--color-border-light)] hover:shadow-[var(--shadow-card)]"
      style={{
        background: 'var(--color-surface-2)',
        border: `1px solid ${isOverdue ? 'rgba(251,146,60,0.35)' : 'var(--color-border)'}`,
        opacity: task.is_archived ? 0.5 : 1,
      }}
    >
      {/* Title */}
      <span
        className="font-semibold text-[0.9rem] leading-snug"
        style={{ color: 'var(--color-text)' }}
      >
        {task.title}
      </span>

      {/* Priority + meta row */}
      <div className="flex items-center gap-2 flex-wrap">
        <PriorityBadge priority={task.priority} />

        {assigneeCount > 0 && (
          <span
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[0.72rem] font-semibold whitespace-nowrap"
            style={{
              background: 'var(--color-primary-dim)',
              color: 'var(--color-primary)',
            }}
          >
            {assigneeLabel}
          </span>
        )}

        {formattedDue && (
          <span
            className="text-[0.72rem] whitespace-nowrap ml-auto font-medium"
            style={{ color: isOverdue ? '#fb923c' : 'var(--color-text-muted)' }}
          >
            {isOverdue ? `⚠ Overdue · ${formattedDue}` : formattedDue}
          </span>
        )}
      </div>
    </div>
  )
}
