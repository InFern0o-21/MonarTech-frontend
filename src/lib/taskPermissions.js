/**
 * Determine what level of editing the current user can do on a task.
 *
 * Returns:
 *   'full'        — user can edit all fields
 *   'status-only' — user is an assignee; only status dropdown is editable
 *   'read-only'   — no editing allowed
 */
export function getTaskEditLevel(task, currentUserId, userPlanRole, wgRole) {
  if (!currentUserId) return 'read-only'

  const isOwnerOrAdmin =
    wgRole === 'owner' || wgRole === 'admin' ||
    userPlanRole === 'owner' || userPlanRole === 'admin'

  if (isOwnerOrAdmin) return 'full'
  if (task?.created_by === currentUserId) return 'full'

  const isAssignee = task?.assignees?.some(a => a.user === currentUserId)
  if (isAssignee) return 'status-only'

  return 'read-only'
}
