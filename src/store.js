import { AGE_CHORE_PRESETS } from './agePresets';

const STORAGE_KEY = 'gamichore-data';
const PARENT_PIN_KEY = 'gamichore-parent-pin';
const PARENT_SESSION_KEY = 'gamichore-parent-auth';

const defaultData = {
  kids: [],
  chores: [],
  choreSets: [], // { id, name, choreIds, frequency: 'daily'|'weekly'|'monthly' }
  shopItems: [],
  completions: [], // { id, choreId, kidId, stars, date, periodKey, status: 'pending'|'approved', submittedAt, approvedAt? }
  redemptions: [],
};

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}
function weekKey(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  const day = x.getDay();
  const diff = x.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(x.setDate(diff));
  return monday.toISOString().slice(0, 10);
}
function monthKey(d = new Date()) {
  return new Date(d).toISOString().slice(0, 7);
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...defaultData };
    const data = JSON.parse(raw);
    const kids = (data.kids ?? defaultData.kids).map((k) => ({
      ...k,
      age: k.age ?? '',
      starBalanceOverride: k.starBalanceOverride ?? null,
      choreSetIds: Array.isArray(k.choreSetIds) ? k.choreSetIds : (k.choreSetId ? [k.choreSetId] : []),
    }));
    const choreSets = (data.choreSets ?? defaultData.choreSets).map((s) => ({
      ...s,
      frequency: s.frequency || 'daily',
    }));
    const completions = (data.completions ?? defaultData.completions).map((c) => {
      if (c.status) return c;
      const completedAt = c.completedAt ? new Date(c.completedAt) : new Date();
      return {
        ...c,
        date: c.date || completedAt.toISOString().slice(0, 10),
        periodKey: c.periodKey || completedAt.toISOString().slice(0, 10),
        status: 'approved',
        submittedAt: c.submittedAt || c.completedAt,
        approvedAt: c.approvedAt || c.completedAt,
      };
    });
    const chores = (data.chores ?? defaultData.chores).map((c) => {
      const { assignedToKidId, ...rest } = c;
      return rest;
    });
    return {
      kids,
      chores,
      choreSets,
      shopItems: data.shopItems ?? defaultData.shopItems,
      completions,
      redemptions: data.redemptions ?? defaultData.redemptions,
    };
  } catch {
    return { ...defaultData };
  }
}

function save(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function id() {
  return Math.random().toString(36).slice(2, 11);
}

function isSameCompletion(a, kidId, choreId, periodKey) {
  return a.kidId === kidId && a.choreId === choreId && a.periodKey === periodKey;
}

function isOpenOrApproved(status) {
  return status === 'pending' || status === 'approved';
}

function normalizedName(name) {
  return String(name || '').trim().toLowerCase();
}

const DEMO_KID_1 = 'demo-kid-1';
const DEMO_KID_2 = 'demo-kid-2';
const DEMO_CHORE_1 = 'demo-chore-1';
const DEMO_CHORE_2 = 'demo-chore-2';
const DEMO_CHORE_3 = 'demo-chore-3';
const DEMO_CHORE_4 = 'demo-chore-4';
const DEMO_ITEM_1 = 'demo-item-1';
const DEMO_ITEM_2 = 'demo-item-2';
const DEMO_ITEM_3 = 'demo-item-3';

export function seedDemoData() {
  const t = new Date().toISOString().slice(0, 10);
  const data = {
    kids: [
      { id: DEMO_KID_1, name: 'Sam', avatar: '🌟', age: '8', starBalanceOverride: null, choreSetIds: ['demo-set-1'] },
      { id: DEMO_KID_2, name: 'Alex', avatar: '⭐', age: '6', starBalanceOverride: null, choreSetIds: ['demo-set-2'] },
    ],
    chores: [
      { id: DEMO_CHORE_1, name: 'Set the table', starValue: 2 },
      { id: DEMO_CHORE_2, name: 'Tidy your room', starValue: 3 },
      { id: DEMO_CHORE_3, name: 'Feed the pet', starValue: 1 },
      { id: DEMO_CHORE_4, name: 'Take out recycling', starValue: 2 },
    ],
    choreSets: [
      { id: 'demo-set-1', name: 'Daily routine', choreIds: [DEMO_CHORE_1, DEMO_CHORE_2], frequency: 'daily' },
      { id: 'demo-set-2', name: 'Weekly tasks', choreIds: [DEMO_CHORE_3, DEMO_CHORE_4], frequency: 'weekly' },
    ],
    shopItems: [
      { id: DEMO_ITEM_1, name: 'Ice cream trip', priceStars: 5, priceRands: 35, image: '' },
      { id: DEMO_ITEM_2, name: 'Screen time +30 min', priceStars: 3, priceRands: 0, image: '' },
      { id: DEMO_ITEM_3, name: 'Choose family movie', priceStars: 8, priceRands: 0, image: '' },
    ],
    completions: [
      { id: id(), choreId: DEMO_CHORE_1, kidId: DEMO_KID_1, stars: 2, date: t, periodKey: t, status: 'approved', submittedAt: new Date(Date.now() - 86400000).toISOString(), approvedAt: new Date(Date.now() - 86400000).toISOString() },
      { id: id(), choreId: DEMO_CHORE_2, kidId: DEMO_KID_1, stars: 3, date: t, periodKey: t, status: 'approved', submittedAt: new Date(Date.now() - 3600000).toISOString(), approvedAt: new Date(Date.now() - 3600000).toISOString() },
      { id: id(), choreId: DEMO_CHORE_3, kidId: DEMO_KID_2, stars: 1, date: t, periodKey: t, status: 'approved', submittedAt: new Date(Date.now() - 7200000).toISOString(), approvedAt: new Date(Date.now() - 7200000).toISOString() },
      { id: id(), choreId: DEMO_CHORE_3, kidId: DEMO_KID_2, stars: 1, date: t, periodKey: t, status: 'approved', submittedAt: new Date(Date.now() - 3600000).toISOString(), approvedAt: new Date(Date.now() - 3600000).toISOString() },
      { id: id(), choreId: DEMO_CHORE_4, kidId: DEMO_KID_2, stars: 2, date: t, periodKey: weekKey(), status: 'pending', submittedAt: new Date().toISOString() },
      { id: id(), choreId: DEMO_CHORE_2, kidId: DEMO_KID_1, stars: 3, date: t, periodKey: t, status: 'pending', submittedAt: new Date().toISOString() },
    ],
    redemptions: [
      { id: id(), kidId: DEMO_KID_1, shopItemId: DEMO_ITEM_2, stars: 3, at: new Date(Date.now() - 43200000).toISOString() },
    ],
  };
  save(data);
}

export function isDataEmpty() {
  const d = load();
  return d.kids.length === 0 && d.chores.length === 0 && d.shopItems.length === 0;
}

// --- Parent auth (local PIN) ---
export function hasParentPin() {
  return !!localStorage.getItem(PARENT_PIN_KEY);
}

export function setParentPin(pin) {
  const normalized = String(pin || '').trim();
  if (!/^\d{4,8}$/.test(normalized)) return false;
  localStorage.setItem(PARENT_PIN_KEY, normalized);
  return true;
}

export function verifyParentPin(pin) {
  const saved = localStorage.getItem(PARENT_PIN_KEY);
  if (!saved) return false;
  return String(pin || '').trim() === saved;
}

export function setParentAuthenticated(isAuthenticated) {
  if (isAuthenticated) sessionStorage.setItem(PARENT_SESSION_KEY, '1');
  else sessionStorage.removeItem(PARENT_SESSION_KEY);
}

export function isParentAuthenticated() {
  return sessionStorage.getItem(PARENT_SESSION_KEY) === '1';
}

export function logoutParent() {
  setParentAuthenticated(false);
}

// --- Kids ---
export function getKids() {
  return load().kids;
}

export function addKid(name, avatar = '', age = '') {
  const data = load();
  const kid = { id: id(), name: name.trim(), avatar: avatar.trim(), age: String(age).trim(), starBalanceOverride: null, choreSetIds: [] };
  data.kids.push(kid);
  save(data);
  return kid;
}

export function updateKid(id, updates) {
  const data = load();
  const i = data.kids.findIndex((k) => k.id === id);
  if (i === -1) return null;
  data.kids[i] = { ...data.kids[i], ...updates };
  save(data);
  return data.kids[i];
}

export function deleteKid(id) {
  const data = load();
  data.kids = data.kids.filter((k) => k.id !== id);
  data.completions = data.completions.filter((c) => c.kidId !== id);
  data.redemptions = data.redemptions.filter((r) => r.kidId !== id);
  save(data);
}

export function getStarBalance(kidId) {
  const data = load();
  const kid = data.kids.find((k) => k.id === kidId);
  if (kid && kid.starBalanceOverride != null && kid.starBalanceOverride !== '') {
    return Number(kid.starBalanceOverride) || 0;
  }
  const earned = data.completions
    .filter((c) => c.kidId === kidId && c.status === 'approved')
    .reduce((sum, c) => sum + (c.stars ?? 0), 0);
  const spent = data.redemptions
    .filter((r) => r.kidId === kidId)
    .reduce((sum, r) => sum + (r.stars ?? 0), 0);
  return earned - spent;
}

// --- Chores ---
export function getChores() {
  return load().chores;
}

export function addChore(name, starValue) {
  const data = load();
  const chore = { id: id(), name: name.trim(), starValue: Number(starValue) || 0 };
  data.chores.push(chore);
  save(data);
  return chore;
}

export function updateChore(id, updates) {
  const data = load();
  const i = data.chores.findIndex((c) => c.id === id);
  if (i === -1) return null;
  data.chores[i] = { ...data.chores[i], ...updates };
  save(data);
  return data.chores[i];
}

export function deleteChore(id) {
  const data = load();
  data.chores = data.chores.filter((c) => c.id !== id);
  data.completions = data.completions.filter((c) => c.choreId !== id);
  data.choreSets = (data.choreSets || []).map((s) => ({
    ...s,
    choreIds: (s.choreIds || []).filter((cid) => cid !== id),
  }));
  save(data);
}

// --- Chore sets ---
export function getChoreSets() {
  return load().choreSets || [];
}

export function addChoreSet(name, choreIds = [], frequency = 'daily') {
  const data = load();
  const set = { id: id(), name: (name || '').trim(), choreIds: [...(choreIds || [])], frequency: frequency || 'daily' };
  data.choreSets = data.choreSets || [];
  data.choreSets.push(set);
  save(data);
  return set;
}

export function updateChoreSet(setId, updates) {
  const data = load();
  data.choreSets = data.choreSets || [];
  const i = data.choreSets.findIndex((s) => s.id === setId);
  if (i === -1) return null;
  data.choreSets[i] = { ...data.choreSets[i], ...updates };
  save(data);
  return data.choreSets[i];
}

export function deleteChoreSet(setId) {
  const data = load();
  data.choreSets = (data.choreSets || []).filter((s) => s.id !== setId);
  data.kids = data.kids.map((k) => ({
    ...k,
    choreSetIds: (k.choreSetIds || []).filter((id) => id !== setId),
  }));
  save(data);
}

export function getAvailableAgePresets() {
  return AGE_CHORE_PRESETS.map((p) => p.age);
}

export function importAgePresetData(age = null, options = {}) {
  const assignToMatchingKids = options.assignToMatchingKids !== false;
  const data = load();
  const sourcePresets = age == null
    ? AGE_CHORE_PRESETS
    : AGE_CHORE_PRESETS.filter((p) => p.age === Number(age));

  let choresCreated = 0;
  let setsCreated = 0;
  let setsUpdated = 0;
  let kidsAssigned = 0;

  sourcePresets.forEach((preset) => {
    preset.sets.forEach((setPreset) => {
      const choreIds = setPreset.chores.map((chorePreset) => {
        const existing = data.chores.find((c) => normalizedName(c.name) === normalizedName(chorePreset.name));
        if (existing) return existing.id;
        const created = {
          id: id(),
          name: chorePreset.name.trim(),
          starValue: Number(chorePreset.starValue) || 0,
        };
        data.chores.push(created);
        choresCreated += 1;
        return created.id;
      });

      const setName = `Age ${preset.age} - ${setPreset.name}`;
      const existingSet = (data.choreSets || []).find((s) => normalizedName(s.name) === normalizedName(setName));
      if (existingSet) {
        existingSet.frequency = setPreset.frequency || 'daily';
        existingSet.choreIds = [...new Set(choreIds)];
        setsUpdated += 1;
      } else {
        data.choreSets = data.choreSets || [];
        data.choreSets.push({
          id: id(),
          name: setName,
          choreIds: [...new Set(choreIds)],
          frequency: setPreset.frequency || 'daily',
        });
        setsCreated += 1;
      }
    });
  });

  if (assignToMatchingKids) {
    sourcePresets.forEach((preset) => {
      const setIdsForAge = (data.choreSets || [])
        .filter((s) => normalizedName(s.name).startsWith(normalizedName(`Age ${preset.age} - `)))
        .map((s) => s.id);

      data.kids.forEach((kid) => {
        const kidAge = parseInt(String(kid.age || '').trim(), 10);
        if (kidAge !== preset.age) return;
        const current = new Set(kid.choreSetIds || []);
        const before = current.size;
        setIdsForAge.forEach((setId) => current.add(setId));
        if (current.size > before) {
          kid.choreSetIds = Array.from(current);
          kidsAssigned += 1;
        }
      });
    });
  }

  save(data);
  return {
    agesLoaded: sourcePresets.map((p) => p.age),
    choresCreated,
    setsCreated,
    setsUpdated,
    kidsAssigned,
  };
}

/** Kids who have this chore (directly assigned or via assigned chore sets) */
/** Kids who have this chore via a chore set (chores are only assigned through sets) */
export function getKidsForChore(chore) {
  const data = load();
  if (!chore) return [];
  return data.kids.filter((k) => {
    const setIds = k.choreSetIds || [];
    return setIds.some((setId) => {
      const set = (data.choreSets || []).find((s) => s.id === setId);
      return set && (set.choreIds || []).includes(chore.id);
    });
  });
}

/** Tasks for a kid for "today" (daily + weekly not done this week + monthly not done this month) */
export function getChoresForKidToday(kidId) {
  const data = load();
  const kid = data.kids.find((k) => k.id === kidId);
  if (!kid) return { daily: [], weekly: [], monthly: [] };
  const today = todayKey();
  const week = weekKey();
  const month = monthKey();
  const choreById = {};
  data.chores.forEach((c) => { choreById[c.id] = c; });

  const completedFor = (choreId, pKey) =>
    data.completions.some((c) => c.kidId === kidId && c.choreId === choreId && c.periodKey === pKey && (c.status === 'approved' || c.status === 'pending'));

  const setChores = (kid.choreSetIds || []).flatMap((setId) => {
    const set = (data.choreSets || []).find((s) => s.id === setId);
    if (!set) return [];
    return (set.choreIds || []).map((cid) => ({ chore: choreById[cid], frequency: set.frequency || 'daily' })).filter((x) => x.chore);
  });

  const daily = [];
  const weekly = [];
  const monthly = [];
  setChores.forEach(({ chore, frequency }) => {
    if (!chore) return;
    if (frequency === 'daily') {
      if (!daily.some((d) => d.chore.id === chore.id)) daily.push({ chore, periodKey: today, alreadyDone: completedFor(chore.id, today) });
    } else if (frequency === 'weekly') {
      if (!weekly.some((w) => w.chore.id === chore.id)) weekly.push({ chore, periodKey: week, alreadyDone: completedFor(chore.id, week) });
    } else if (frequency === 'monthly') {
      if (!monthly.some((m) => m.chore.id === chore.id)) monthly.push({ chore, periodKey: month, alreadyDone: completedFor(chore.id, month) });
    }
  });

  return { daily, weekly, monthly };
}

/** Tasks for a kid for a specific date (daily, weekly, monthly for that date). */
export function getChoresForKidOnDate(kidId, dateStr) {
  const data = load();
  const kid = data.kids.find((k) => k.id === kidId);
  if (!kid) return { daily: [], weekly: [], monthly: [] };
  const d = new Date(dateStr + 'T12:00:00');
  const day = dateStr.slice(0, 10);
  const week = weekKey(d);
  const month = monthKey(d);
  const choreById = {};
  data.chores.forEach((c) => { choreById[c.id] = c; });

  const completedFor = (choreId, pKey) =>
    data.completions.some((c) => c.kidId === kidId && c.choreId === choreId && c.periodKey === pKey && (c.status === 'approved' || c.status === 'pending'));

  const setChores = (kid.choreSetIds || []).flatMap((setId) => {
    const set = (data.choreSets || []).find((s) => s.id === setId);
    if (!set) return [];
    return (set.choreIds || []).map((cid) => ({ chore: choreById[cid], frequency: set.frequency || 'daily' })).filter((x) => x.chore);
  });

  const daily = [];
  const weekly = [];
  const monthly = [];
  setChores.forEach(({ chore, frequency }) => {
    if (!chore) return;
    if (frequency === 'daily') {
      if (!daily.some((d) => d.chore.id === chore.id)) daily.push({ chore, periodKey: day, alreadyDone: completedFor(chore.id, day) });
    } else if (frequency === 'weekly') {
      if (!weekly.some((w) => w.chore.id === chore.id)) weekly.push({ chore, periodKey: week, alreadyDone: completedFor(chore.id, week) });
    } else if (frequency === 'monthly') {
      if (!monthly.some((m) => m.chore.id === chore.id)) monthly.push({ chore, periodKey: month, alreadyDone: completedFor(chore.id, month) });
    }
  });

  return { daily, weekly, monthly };
}

/** Habit stats for a kid over the last N days: { date, completed, skipped, due } */
export function getHabitStats(kidId, daysBack = 28) {
  const result = []
  const today = todayKey()
  for (let i = daysBack - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const { daily, weekly, monthly } = getChoresForKidOnDate(kidId, dateStr)
    const all = [...daily, ...weekly, ...monthly]
    const completed = all.filter((x) => x.alreadyDone).length
    const due = all.length
    const skipped = due - completed
    result.push({ date: dateStr, completed, skipped, due })
  }
  return result
}

/** Kid submits checked tasks; creates pending completions */
export function submitCompletions(kidId, items) {
  const data = load();
  const choreById = {};
  data.chores.forEach((c) => { choreById[c.id] = c; });
  const now = new Date().toISOString();
  let created = 0;
  let skipped = 0;
  items.forEach(({ choreId, periodKey }) => {
    const alreadyExists = data.completions.some(
      (c) => isSameCompletion(c, kidId, choreId, periodKey) && isOpenOrApproved(c.status)
    );
    if (alreadyExists) {
      skipped += 1;
      return;
    }
    const chore = choreById[choreId] || data.chores.find((c) => c.id === choreId);
    if (!chore) return;
    data.completions.push({
      id: id(),
      choreId,
      kidId,
      stars: chore.starValue,
      date: periodKey.slice(0, 10),
      periodKey,
      status: 'pending',
      submittedAt: now,
    });
    created += 1;
  });
  save(data);
  return { created, skipped };
}

export function getPendingCompletions() {
  return load().completions.filter((c) => c.status === 'pending');
}

export function approveCompletion(completionId) {
  const data = load();
  const c = data.completions.find((x) => x.id === completionId);
  if (!c) return null;
  const existingApproved = data.completions.find(
    (x) => x.id !== c.id && isSameCompletion(x, c.kidId, c.choreId, c.periodKey) && x.status === 'approved'
  );
  if (existingApproved) {
    data.completions = data.completions.filter((x) => x.id !== c.id);
    save(data);
    return existingApproved;
  }
  c.status = 'approved';
  c.approvedAt = new Date().toISOString();
  data.completions = data.completions.filter(
    (x) => x.id === c.id || !isSameCompletion(x, c.kidId, c.choreId, c.periodKey) || x.status !== 'pending'
  );
  save(data);
  return c;
}

export function rejectCompletion(completionId) {
  const data = load();
  data.completions = data.completions.filter((c) => c.id !== completionId);
  save(data);
}

/** All approved completions (for daily log). */
export function getApprovedCompletions() {
  return load().completions.filter((c) => c.status === 'approved');
}

/** Remove an approved completion (unmark as done); stars are no longer counted. */
export function removeCompletion(completionId) {
  rejectCompletion(completionId);
}

/** Find the completion for this kid/chore/period (for unmark). */
export function getCompletionForPeriod(kidId, choreId, periodKey) {
  const completions = load().completions;
  const approved = completions.find(
    (c) => c.kidId === kidId && c.choreId === choreId && c.periodKey === periodKey && c.status === 'approved'
  );
  if (approved) return approved;
  return completions.find(
    (c) => c.kidId === kidId && c.choreId === choreId && c.periodKey === periodKey && c.status === 'pending'
  ) ?? null;
}

/** Parent marks a task done (creates approved completion). Use dateStr for backdating (e.g. approval log). */
export function recordCompletion(kidId, choreId, periodKey, dateStr = null) {
  const data = load();
  const chore = data.chores.find((c) => c.id === choreId);
  if (!chore) return null;
  const now = new Date().toISOString();
  const existing = data.completions.find(
    (c) => isSameCompletion(c, kidId, choreId, periodKey) && isOpenOrApproved(c.status)
  );
  if (existing) {
    if (existing.status === 'pending') {
      existing.status = 'approved';
      existing.approvedAt = now;
      save(data);
      return { stars: existing.stars ?? chore.starValue };
    }
    return { stars: 0 };
  }
  const date = dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? dateStr : todayKey();
  data.completions.push({
    id: id(),
    choreId,
    kidId,
    stars: chore.starValue,
    date,
    periodKey,
    status: 'approved',
    submittedAt: now,
    approvedAt: now,
  });
  save(data);
  return { stars: chore.starValue };
}

// --- Shop ---
export function getShopItems() {
  return load().shopItems;
}

export function addShopItem({ name, priceStars, priceRands, image }) {
  const data = load();
  const item = {
    id: id(),
    name: (name || '').trim(),
    priceStars: Number(priceStars) || 0,
    priceRands: Number(priceRands) || 0,
    image: image || '',
  };
  data.shopItems.push(item);
  save(data);
  return item;
}

export function updateShopItem(id, updates) {
  const data = load();
  const i = data.shopItems.findIndex((s) => s.id === id);
  if (i === -1) return null;
  data.shopItems[i] = { ...data.shopItems[i], ...updates };
  save(data);
  return data.shopItems[i];
}

export function deleteShopItem(id) {
  const data = load();
  data.shopItems = data.shopItems.filter((s) => s.id !== id);
  data.redemptions = data.redemptions.filter((r) => r.shopItemId !== id);
  save(data);
}

export function redeemItem(kidId, shopItemId) {
  const data = load();
  const item = data.shopItems.find((s) => s.id === shopItemId);
  if (!item) return null;
  const balance = getStarBalance(kidId);
  if (balance < item.priceStars) return { error: 'Not enough stars' };
  data.redemptions.push({
    id: id(),
    kidId,
    shopItemId,
    stars: item.priceStars,
    at: new Date().toISOString(),
  });
  save(data);
  return { success: true };
}

export function getCompletions() {
  return load().completions;
}

export function getRedemptions() {
  return load().redemptions;
}
