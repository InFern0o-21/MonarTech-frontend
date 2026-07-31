/**
 * SkeletonCard — context-aware loading placeholder.
 *
 * variant="task"    — matches TaskCard (compact, board column width)
 * variant="card"    — matches dashboard/workgroup cards (taller, grid layout)
 * variant="list"    — matches list rows (WorkgroupDetailPage members/plans)
 */

const shimmer = {
  background: 'linear-gradient(90deg, var(--color-surface-2) 25%, rgba(255,255,255,0.04) 50%, var(--color-surface-2) 75%)',
  backgroundSize: '200% 100%',
  animation: 'skeleton-shimmer 1.4s ease-in-out infinite',
}

function Bar({ w = 'w-full', h = 'h-3', style = {} }) {
  return (
    <div
      className={`${w} ${h} rounded-[4px]`}
      style={{ ...shimmer, ...style }}
    />
  )
}

export default function SkeletonCard({ variant = 'card' }) {
  if (variant === 'task') {
    return (
      <div
        className="flex flex-col gap-2.5 p-3.5 rounded-[var(--radius-md)]"
        style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
      >
        {/* Title line */}
        <Bar w="w-3/4" h="h-3.5" />
        {/* Badge row */}
        <div className="flex items-center gap-2">
          <Bar w="w-16" h="h-5" style={{ borderRadius: 6 }} />
          <Bar w="w-20" h="h-5" style={{ borderRadius: 6 }} />
        </div>
      </div>
    )
  }

  if (variant === 'list') {
    return (
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-[var(--radius-md)]"
        style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
      >
        {/* Avatar */}
        <div className="w-[34px] h-[34px] rounded-full flex-shrink-0" style={shimmer} />
        <div className="flex-1 flex flex-col gap-2">
          <Bar w="w-1/3" h="h-3" />
          <Bar w="w-1/2" h="h-2.5" />
        </div>
        <Bar w="w-14" h="h-5" style={{ borderRadius: 6 }} />
      </div>
    )
  }

  // default: 'card' — dashboard / workgroup grid cards
  return (
    <div
      className="flex flex-col gap-3 p-4 rounded-[var(--radius-lg)]"
      style={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
    >
      {/* Icon placeholder */}
      <div className="w-10 h-10 rounded-[10px]" style={shimmer} />
      {/* Title */}
      <Bar w="w-3/5" h="h-3.5" />
      {/* Subtitle */}
      <Bar w="w-2/5" h="h-2.5" />
    </div>
  )
}
