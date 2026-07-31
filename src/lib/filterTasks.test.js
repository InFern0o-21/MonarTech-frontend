import { describe, it, expect } from 'vitest'
import { applyFilters, DEFAULT_FILTERS } from './filterTasks'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const tasks = [
  {
    id: 1,
    title: 'Fix login bug',
    priority: 'high',
    assignees: [{ user: 10 }, { user: 20 }],
    due_date: '2025-06-01',
  },
  {
    id: 2,
    title: 'Write unit tests',
    priority: 'medium',
    assignees: [{ user: 20 }],
    due_date: '2025-07-15',
  },
  {
    id: 3,
    title: 'Update README',
    priority: 'low',
    assignees: [],
    due_date: null,
  },
  {
    id: 4,
    title: 'Deploy to staging',
    priority: 'high',
    assignees: [{ user: 30 }],
    due_date: '2025-08-20',
  },
]

// ---------------------------------------------------------------------------
// DEFAULT_FILTERS
// ---------------------------------------------------------------------------

describe('DEFAULT_FILTERS', () => {
  it('has the expected shape', () => {
    expect(DEFAULT_FILTERS).toEqual({
      search: '',
      priorities: [],
      assigneeId: null,
      dueDateFrom: null,
      dueDateTo: null,
    })
  })
})

// ---------------------------------------------------------------------------
// applyFilters — no filters (pass-through)
// ---------------------------------------------------------------------------

describe('applyFilters — no filters', () => {
  it('returns all tasks when DEFAULT_FILTERS is used', () => {
    expect(applyFilters(tasks, DEFAULT_FILTERS)).toHaveLength(tasks.length)
  })

  it('returns an empty array when the input list is empty', () => {
    expect(applyFilters([], DEFAULT_FILTERS)).toEqual([])
  })
})

// ---------------------------------------------------------------------------
// applyFilters — search
// ---------------------------------------------------------------------------

describe('applyFilters — search', () => {
  it('filters by case-insensitive title substring', () => {
    const result = applyFilters(tasks, { ...DEFAULT_FILTERS, search: 'login' })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
  })

  it('is case-insensitive', () => {
    const lower = applyFilters(tasks, { ...DEFAULT_FILTERS, search: 'unit' })
    const upper = applyFilters(tasks, { ...DEFAULT_FILTERS, search: 'UNIT' })
    expect(lower).toEqual(upper)
  })

  it('returns nothing when no title matches', () => {
    const result = applyFilters(tasks, { ...DEFAULT_FILTERS, search: 'nonexistent' })
    expect(result).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// applyFilters — priority
// ---------------------------------------------------------------------------

describe('applyFilters — priority', () => {
  it('filters to a single priority', () => {
    const result = applyFilters(tasks, { ...DEFAULT_FILTERS, priorities: ['high'] })
    expect(result.every(t => t.priority === 'high')).toBe(true)
    expect(result).toHaveLength(2)
  })

  it('supports multi-select (OR within priorities)', () => {
    const result = applyFilters(tasks, { ...DEFAULT_FILTERS, priorities: ['high', 'low'] })
    expect(result).toHaveLength(3)
  })

  it('returns all tasks when priorities array is empty', () => {
    const result = applyFilters(tasks, { ...DEFAULT_FILTERS, priorities: [] })
    expect(result).toHaveLength(tasks.length)
  })
})

// ---------------------------------------------------------------------------
// applyFilters — assignee
// ---------------------------------------------------------------------------

describe('applyFilters — assigneeId', () => {
  it('returns tasks assigned to a specific user', () => {
    const result = applyFilters(tasks, { ...DEFAULT_FILTERS, assigneeId: 20 })
    expect(result).toHaveLength(2)
    expect(result.map(t => t.id)).toEqual([1, 2])
  })

  it('returns an empty array when no tasks match the assignee', () => {
    const result = applyFilters(tasks, { ...DEFAULT_FILTERS, assigneeId: 999 })
    expect(result).toHaveLength(0)
  })

  it('returns all tasks when assigneeId is null', () => {
    const result = applyFilters(tasks, { ...DEFAULT_FILTERS, assigneeId: null })
    expect(result).toHaveLength(tasks.length)
  })
})

// ---------------------------------------------------------------------------
// applyFilters — due date range
// ---------------------------------------------------------------------------

describe('applyFilters — due date range', () => {
  it('excludes tasks with no due_date when a range is set', () => {
    const result = applyFilters(tasks, { ...DEFAULT_FILTERS, dueDateFrom: '2025-01-01' })
    expect(result.every(t => t.due_date !== null)).toBe(true)
    // task id:3 has no due_date, so it should be excluded
    expect(result.find(t => t.id === 3)).toBeUndefined()
  })

  it('filters by dueDateFrom (inclusive)', () => {
    const result = applyFilters(tasks, { ...DEFAULT_FILTERS, dueDateFrom: '2025-07-01' })
    expect(result.map(t => t.id)).toEqual([2, 4])
  })

  it('filters by dueDateTo (inclusive)', () => {
    const result = applyFilters(tasks, { ...DEFAULT_FILTERS, dueDateTo: '2025-06-30' })
    // task 1 (2025-06-01) passes; task 3 excluded (no due_date)
    expect(result.map(t => t.id)).toEqual([1])
  })

  it('filters within a date range', () => {
    const result = applyFilters(tasks, {
      ...DEFAULT_FILTERS,
      dueDateFrom: '2025-06-01',
      dueDateTo: '2025-07-31',
    })
    expect(result.map(t => t.id)).toEqual([1, 2])
  })

  it('returns no tasks when range excludes everything', () => {
    const result = applyFilters(tasks, {
      ...DEFAULT_FILTERS,
      dueDateFrom: '2030-01-01',
      dueDateTo: '2030-12-31',
    })
    expect(result).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// applyFilters — combined predicates (AND logic)
// ---------------------------------------------------------------------------

describe('applyFilters — combined filters', () => {
  it('applies all active filters together (AND logic)', () => {
    // search: "bug" → task 1; priority: high → task 1, 4; assigneeId: 10 → task 1
    const result = applyFilters(tasks, {
      search: 'bug',
      priorities: ['high'],
      assigneeId: 10,
      dueDateFrom: null,
      dueDateTo: null,
    })
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe(1)
  })
})
