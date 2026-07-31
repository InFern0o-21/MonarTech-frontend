/**
 * PriorityBadge — coloured pill for a task priority level.
 * Props: priority {string} — "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH" | "URGENT"
 */

const PRIORITY_STYLES = {
  LOW:       { background: 'var(--color-surface-2)',           color: 'var(--color-text-muted)' },
  MEDIUM:    { background: 'rgba(59,130,246,0.15)',            color: '#60a5fa' },
  HIGH:      { background: 'rgba(245,158,11,0.15)',            color: 'var(--color-warning)' },
  VERY_HIGH: { background: 'rgba(249,115,22,0.15)',            color: '#fb923c' },
  URGENT:    { background: 'rgba(239,68,68,0.15)',             color: 'var(--color-error)' },
}

const PRIORITY_LABELS = {
  LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High', VERY_HIGH: 'Very High', URGENT: 'Urgent',
}

export default function PriorityBadge({ priority }) {
  const style = PRIORITY_STYLES[priority] ?? PRIORITY_STYLES.LOW
  const label = PRIORITY_LABELS[priority] ?? priority

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.72rem] font-semibold tracking-wide whitespace-nowrap"
      style={style}
    >
      {label}
    </span>
  )
}
