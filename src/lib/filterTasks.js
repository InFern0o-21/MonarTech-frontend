/**
 * Default filter state — use this as the initial value for any filter UI.
 */
export const DEFAULT_FILTERS = {
  search: '',
  priorities: [],
  assigneeId: null,
  dueDateFrom: null,
  dueDateTo: null,
}

/**
 * Pure function that applies a filter state to an array of tasks.
 *
 * Filter pipeline (all predicates are AND-combined):
 *   1. Search  — case-insensitive substring match on task.title
 *   2. Priority — multi-select; task.priority must be in filters.priorities
 *   3. Assignee — task.assignees must contain an entry where a.user === filters.assigneeId
 *   4. Due-date range — when either bound is set, tasks with no due_date are excluded;
 *                       remaining tasks must fall within [dueDateFrom, dueDateTo]
 *
 * @param {Object[]} tasks   - Array of task objects from the API.
 * @param {Object}   filters - Filter state (see DEFAULT_FILTERS for shape).
 * @returns {Object[]} Filtered array of tasks.
 */
export function applyFilters(tasks, filters) {
  return tasks.filter(task => {
    // 1. Search
    if (filters.search &&
        !task.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }

    // 2. Priority
    if (filters.priorities.length > 0 &&
        !filters.priorities.includes(task.priority)) {
      return false
    }

    // 3. Assignee
    if (filters.assigneeId !== null &&
        !(task.assignees ?? []).some(a => a.user === filters.assigneeId)) {
      return false
    }

    // 4. Due date range — tasks with no due_date are excluded when range is active
    const hasRange = filters.dueDateFrom !== null || filters.dueDateTo !== null
    if (hasRange) {
      if (!task.due_date) return false
      const due = new Date(task.due_date)
      if (filters.dueDateFrom && due < new Date(filters.dueDateFrom)) return false
      if (filters.dueDateTo   && due > new Date(filters.dueDateTo))   return false
    }

    return true
  })
}
