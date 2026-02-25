// Pure derivation functions - work on data object, no side effects

export function todayKey() {
  return new Date().toISOString().slice(0, 10)
}
export function weekKey(d = new Date()) {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  const day = x.getDay()
  const diff = x.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(x.setDate(diff))
  return monday.toISOString().slice(0, 10)
}
export function monthKey(d = new Date()) {
  return new Date(d).toISOString().slice(0, 7)
}

export function getStarBalance(data, kidId) {
  const kid = data.kids.find((k) => k.id === kidId)
  if (kid && kid.starBalanceOverride != null && kid.starBalanceOverride !== '') {
    return Number(kid.starBalanceOverride) || 0
  }
  const earned = (data.completions || [])
    .filter((c) => c.kidId === kidId && c.status === 'approved')
    .reduce((sum, c) => sum + (c.stars ?? 0), 0)
  const spent = (data.redemptions || [])
    .filter((r) => r.kidId === kidId)
    .reduce((sum, r) => sum + (r.stars ?? 0), 0)
  return earned - spent
}

function completedFor(data, kidId, choreId, periodKey) {
  return (data.completions || []).some(
    (c) =>
      c.kidId === kidId &&
      c.choreId === choreId &&
      c.periodKey === periodKey &&
      (c.status === 'approved' || c.status === 'pending')
  )
}

export function getChoresForKidToday(data, kidId) {
  const kid = data.kids.find((k) => k.id === kidId)
  if (!kid) return { daily: [], weekly: [], monthly: [] }
  const today = todayKey()
  const week = weekKey()
  const month = monthKey()
  const choreById = {}
  ;(data.chores || []).forEach((c) => { choreById[c.id] = c })

  const setChores = (kid.choreSetIds || []).flatMap((setId) => {
    const set = (data.choreSets || []).find((s) => s.id === setId)
    if (!set) return []
    return (set.choreIds || [])
      .map((cid) => ({ chore: choreById[cid], frequency: set.frequency || 'daily', weekdays: set.weekdays }))
      .filter((x) => x.chore)
  })

  const isoWeekday = (() => { const n = new Date().getDay(); return n === 0 ? 7 : n })()

  const daily = []
  const weekly = []
  const monthly = []
  setChores.forEach(({ chore, frequency, weekdays }) => {
    if (!chore) return
    if (frequency === 'daily') {
      if (Array.isArray(weekdays) && weekdays.length > 0 && !weekdays.includes(isoWeekday)) return
      if (!daily.some((d) => d.chore.id === chore.id))
        daily.push({ chore, periodKey: today, alreadyDone: completedFor(data, kidId, chore.id, today) })
    } else if (frequency === 'weekly') {
      if (!weekly.some((w) => w.chore.id === chore.id))
        weekly.push({ chore, periodKey: week, alreadyDone: completedFor(data, kidId, chore.id, week) })
    } else if (frequency === 'monthly') {
      if (!monthly.some((m) => m.chore.id === chore.id))
        monthly.push({ chore, periodKey: month, alreadyDone: completedFor(data, kidId, chore.id, month) })
    }
  })
  return { daily, weekly, monthly }
}

export function getChoresForKidOnDate(data, kidId, dateStr) {
  const kid = data.kids.find((k) => k.id === kidId)
  if (!kid) return { daily: [], weekly: [], monthly: [] }
  const d = new Date(dateStr + 'T12:00:00')
  const day = dateStr.slice(0, 10)
  const week = weekKey(d)
  const month = monthKey(d)
  const choreById = {}
  ;(data.chores || []).forEach((c) => { choreById[c.id] = c })

  const setChores = (kid.choreSetIds || []).flatMap((setId) => {
    const set = (data.choreSets || []).find((s) => s.id === setId)
    if (!set) return []
    return (set.choreIds || [])
      .map((cid) => ({ chore: choreById[cid], frequency: set.frequency || 'daily', weekdays: set.weekdays }))
      .filter((x) => x.chore)
  })

  const isoWeekday = (() => { const n = d.getDay(); return n === 0 ? 7 : n })()

  const daily = []
  const weekly = []
  const monthly = []
  setChores.forEach(({ chore, frequency, weekdays }) => {
    if (!chore) return
    if (frequency === 'daily') {
      if (Array.isArray(weekdays) && weekdays.length > 0 && !weekdays.includes(isoWeekday)) return
      if (!daily.some((d) => d.chore.id === chore.id))
        daily.push({ chore, periodKey: day, alreadyDone: completedFor(data, kidId, chore.id, day) })
    } else if (frequency === 'weekly') {
      if (!weekly.some((w) => w.chore.id === chore.id))
        weekly.push({ chore, periodKey: week, alreadyDone: completedFor(data, kidId, chore.id, week) })
    } else if (frequency === 'monthly') {
      if (!monthly.some((m) => m.chore.id === chore.id))
        monthly.push({ chore, periodKey: month, alreadyDone: completedFor(data, kidId, chore.id, month) })
    }
  })
  return { daily, weekly, monthly }
}

export function getHabitStats(data, kidId, daysBack = 28) {
  const result = []
  for (let i = daysBack - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const { daily, weekly, monthly } = getChoresForKidOnDate(data, kidId, dateStr)
    const all = [...daily, ...weekly, ...monthly]
    const completed = all.filter((x) => x.alreadyDone).length
    const due = all.length
    const skipped = due - completed
    result.push({ date: dateStr, completed, skipped, due })
  }
  return result
}

export function getKidsForChore(data, chore) {
  if (!chore) return []
  return (data.kids || []).filter((k) => {
    const setIds = k.choreSetIds || []
    return setIds.some((setId) => {
      const set = (data.choreSets || []).find((s) => s.id === setId)
      return set && (set.choreIds || []).includes(chore.id)
    })
  })
}

export function getPendingCompletions(data) {
  return (data.completions || []).filter((c) => c.status === 'pending')
}

export function getApprovedCompletions(data) {
  return (data.completions || []).filter((c) => c.status === 'approved')
}

export function getCompletionForPeriod(data, kidId, choreId, periodKey) {
  const completions = data.completions || []
  const approved = completions.find(
    (c) =>
      c.kidId === kidId &&
      c.choreId === choreId &&
      c.periodKey === periodKey &&
      c.status === 'approved'
  )
  if (approved) return approved
  return (
    completions.find(
      (c) =>
        c.kidId === kidId &&
        c.choreId === choreId &&
        c.periodKey === periodKey &&
        c.status === 'pending'
    ) ?? null
  )
}

export function normalizedName(name) {
  return String(name || '').trim().toLowerCase()
}
