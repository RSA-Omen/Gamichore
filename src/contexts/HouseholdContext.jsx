import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

function guardSupabase() {
  if (!supabase) throw new Error('Supabase not configured')
}
import { toCamel } from '../lib/dbTransform'
import {
  todayKey,
  weekKey,
  monthKey,
  getStarBalance as utilGetStarBalance,
  getChoresForKidToday as utilGetChoresForKidToday,
  getChoresForKidOnDate as utilGetChoresForKidOnDate,
  getHabitStats as utilGetHabitStats,
  getKidsForChore as utilGetKidsForChore,
  getPendingCompletions as utilGetPendingCompletions,
  getApprovedCompletions as utilGetApprovedCompletions,
  getCompletionForPeriod as utilGetCompletionForPeriod,
  normalizedName,
} from '../lib/storeUtils'
import { AGE_CHORE_PRESETS } from '../agePresets'

const HouseholdContext = createContext(null)

function collectData(kids, chores, choreSets, completions, shopItems, redemptions) {
  const kidsNorm = (kids || []).map((k) => ({
    ...k,
    age: k.age ?? '',
    starBalanceOverride: k.star_balance_override,
    choreSetIds: Array.isArray(k.chore_set_ids) ? k.chore_set_ids : k.chore_set_ids ? [k.chore_set_ids] : [],
  }))
  const choreSetsNorm = (choreSets || []).map((s) => ({
    id: s.id,
    name: s.name,
    choreIds: s.chore_ids || [],
    frequency: s.frequency || 'daily',
  }))
  const completionsNorm = (completions || []).map((c) => ({
    id: c.id,
    choreId: c.chore_id,
    kidId: c.kid_id,
    stars: c.stars,
    date: c.date,
    periodKey: c.period_key,
    status: c.status,
    submittedAt: c.submitted_at,
    approvedAt: c.approved_at,
  }))
  const shopItemsNorm = (shopItems || []).map((s) => ({
    id: s.id,
    name: s.name,
    priceStars: s.price_stars,
    priceRands: s.price_rands,
    image: s.image || '',
  }))
  const redemptionsNorm = (redemptions || []).map((r) => ({
    id: r.id,
    kidId: r.kid_id,
    shopItemId: r.shop_item_id,
    stars: r.stars,
    at: r.at,
  }))
  return {
    kids: kidsNorm,
    chores: chores || [],
    choreSets: choreSetsNorm,
    completions: completionsNorm,
    shopItems: shopItemsNorm,
    redemptions: redemptionsNorm,
  }
}

export function HouseholdProvider({ children, householdId }) {
  const [data, setData] = useState({
    kids: [],
    chores: [],
    choreSets: [],
    completions: [],
    shopItems: [],
    redemptions: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAll = useCallback(async () => {
    if (!householdId) {
      setData({ kids: [], chores: [], choreSets: [], completions: [], shopItems: [], redemptions: [] })
      setLoading(false)
      return
    }
    guardSupabase()
    setLoading(true)
    setError(null)
    try {
      const [kidsRes, choresRes, setsRes, compRes, shopRes, redRes] = await Promise.all([
        supabase.from('kids').select('*').eq('household_id', householdId),
        supabase.from('chores').select('*').eq('household_id', householdId),
        supabase.from('chore_sets').select('*').eq('household_id', householdId),
        supabase.from('completions').select('*').eq('household_id', householdId),
        supabase.from('shop_items').select('*').eq('household_id', householdId),
        supabase.from('redemptions').select('*').eq('household_id', householdId),
      ])
      const err = kidsRes.error || choresRes.error || setsRes.error || compRes.error || shopRes.error || redRes.error
      if (err) throw err
      const d = collectData(
        kidsRes.data,
        choresRes.data,
        setsRes.data,
        compRes.data,
        shopRes.data,
        redRes.data
      )
      setData(d)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [householdId])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // Derived getters
  const getStarBalance = useCallback((kidId) => utilGetStarBalance(data, kidId), [data])
  const getChoresForKidToday = useCallback((kidId) => utilGetChoresForKidToday(data, kidId), [data])
  const getChoresForKidOnDate = useCallback((kidId, dateStr) => utilGetChoresForKidOnDate(data, kidId, dateStr), [data])
  const getHabitStats = useCallback((kidId, days = 28) => utilGetHabitStats(data, kidId, days), [data])
  const getKidsForChore = useCallback((chore) => utilGetKidsForChore(data, chore), [data])
  const getPendingCompletions = useCallback(() => utilGetPendingCompletions(data), [data])
  const getApprovedCompletions = useCallback(() => utilGetApprovedCompletions(data), [data])
  const getCompletionForPeriod = useCallback(
    (kidId, choreId, periodKey) => utilGetCompletionForPeriod(data, kidId, choreId, periodKey),
    [data]
  )

  // Mutations
  const addKid = useCallback(async (name, avatar = '', age = '') => {
    const { data, error } = await supabase
      .from('kids')
      .insert({
        household_id: householdId,
        name: name.trim(),
        avatar: avatar.trim(),
        age: String(age).trim(),
        star_balance_override: null,
        chore_set_ids: [],
      })
      .select()
      .single()
    if (error) throw error
    await fetchAll()
    return { id: data.id }
  }, [householdId, fetchAll])

  const updateKid = useCallback(async (id, updates) => {
    const row = {}
    if (updates.name != null) row.name = updates.name
    if (updates.avatar != null) row.avatar = updates.avatar
    if (updates.age != null) row.age = String(updates.age)
    if (updates.starBalanceOverride != null) row.star_balance_override = updates.starBalanceOverride
    if (updates.choreSetIds != null) row.chore_set_ids = updates.choreSetIds
    const { error } = await supabase.from('kids').update(row).eq('id', id)
    if (error) throw error
    await fetchAll()
  }, [fetchAll])

  const deleteKid = useCallback(async (id) => {
    const { error } = await supabase.from('kids').delete().eq('id', id)
    if (error) throw error
    await fetchAll()
  }, [fetchAll])

  const addChore = useCallback(async (name, starValue) => {
    const { error } = await supabase.from('chores').insert({
      household_id: householdId,
      name: name.trim(),
      star_value: Number(starValue) || 0,
    })
    if (error) throw error
    await fetchAll()
  }, [householdId, fetchAll])

  const updateChore = useCallback(async (id, updates) => {
    const row = {}
    if (updates.name != null) row.name = updates.name
    if (updates.starValue != null) row.star_value = updates.starValue
    const { error } = await supabase.from('chores').update(row).eq('id', id)
    if (error) throw error
    await fetchAll()
  }, [fetchAll])

  const deleteChore = useCallback(async (id) => {
    const { error } = await supabase.from('chores').delete().eq('id', id)
    if (error) throw error
    await fetchAll()
  }, [fetchAll])

  const addChoreSet = useCallback(async (name, choreIds = [], frequency = 'daily') => {
    const { data, error } = await supabase
      .from('chore_sets')
      .insert({
        household_id: householdId,
        name: (name || '').trim(),
        chore_ids: choreIds || [],
        frequency: frequency || 'daily',
      })
      .select()
      .single()
    if (error) throw error
    await fetchAll()
    return { id: data.id }
  }, [householdId, fetchAll])

  const updateChoreSet = useCallback(async (setId, updates) => {
    const row = {}
    if (updates.name != null) row.name = updates.name
    if (updates.choreIds != null) row.chore_ids = updates.choreIds
    if (updates.frequency != null) row.frequency = updates.frequency
    const { error } = await supabase.from('chore_sets').update(row).eq('id', setId)
    if (error) throw error
    await fetchAll()
  }, [fetchAll])

  const deleteChoreSet = useCallback(async (setId) => {
    const kidsWithSet = data.kids.filter((k) => (k.choreSetIds || []).includes(setId))
    for (const k of kidsWithSet) {
      const next = (k.choreSetIds || []).filter((id) => id !== setId)
      await supabase.from('kids').update({ chore_set_ids: next }).eq('id', k.id)
    }
    const { error } = await supabase.from('chore_sets').delete().eq('id', setId)
    if (error) throw error
    await fetchAll()
  }, [data.kids, fetchAll])

  const approveCompletion = useCallback(async (completionId) => {
    const c = data.completions.find((x) => x.id === completionId)
    if (!c) return
    const existing = data.completions.find(
      (x) =>
        x.id !== c.id &&
        x.kidId === c.kidId &&
        x.choreId === c.choreId &&
        x.periodKey === c.periodKey &&
        x.status === 'approved'
    )
    if (existing) {
      await supabase.from('completions').delete().eq('id', completionId)
    } else {
      await supabase
        .from('completions')
        .update({ status: 'approved', approved_at: new Date().toISOString() })
        .eq('id', completionId)
    }
    await supabase
      .from('completions')
      .delete()
      .eq('kid_id', c.kidId)
      .eq('chore_id', c.choreId)
      .eq('period_key', c.periodKey)
      .eq('status', 'pending')
      .neq('id', completionId)
    await fetchAll()
  }, [data.completions, fetchAll])

  const rejectCompletion = useCallback(async (completionId) => {
    const { error } = await supabase.from('completions').delete().eq('id', completionId)
    if (error) throw error
    await fetchAll()
  }, [fetchAll])

  const recordCompletion = useCallback(async (kidId, choreId, periodKey, dateStr = null) => {
    const chore = data.chores.find((c) => c.id === choreId)
    if (!chore) return null
    const date = dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr) ? dateStr : todayKey()
    const existing = data.completions.find(
      (c) =>
        c.kidId === kidId &&
        c.choreId === choreId &&
        c.periodKey === periodKey &&
        (c.status === 'approved' || c.status === 'pending')
    )
    if (existing) {
      if (existing.status === 'pending') {
        await supabase
          .from('completions')
          .update({ status: 'approved', approved_at: new Date().toISOString() })
          .eq('id', existing.id)
      }
      await fetchAll()
      return { stars: existing.stars ?? chore.starValue }
    }
    await supabase.from('completions').insert({
      household_id: householdId,
      chore_id: choreId,
      kid_id: kidId,
      stars: chore.starValue,
      date: date,
      period_key: periodKey,
      status: 'approved',
      submitted_at: new Date().toISOString(),
      approved_at: new Date().toISOString(),
    })
    await fetchAll()
    return { stars: chore.starValue }
  }, [householdId, data.chores, data.completions, fetchAll])

  const addShopItem = useCallback(async ({ name, priceStars, priceRands, image }) => {
    const { error } = await supabase.from('shop_items').insert({
      household_id: householdId,
      name: (name || '').trim(),
      price_stars: Number(priceStars) || 0,
      price_rands: Number(priceRands) || 0,
      image: image || '',
    })
    if (error) throw error
    await fetchAll()
  }, [householdId, fetchAll])

  const updateShopItem = useCallback(async (id, updates) => {
    const row = {}
    if (updates.name != null) row.name = updates.name
    if (updates.priceStars != null) row.price_stars = updates.priceStars
    if (updates.priceRands != null) row.price_rands = updates.priceRands
    if (updates.image != null) row.image = updates.image
    const { error } = await supabase.from('shop_items').update(row).eq('id', id)
    if (error) throw error
    await fetchAll()
  }, [fetchAll])

  const deleteShopItem = useCallback(async (id) => {
    const { error } = await supabase.from('shop_items').delete().eq('id', id)
    if (error) throw error
    await fetchAll()
  }, [fetchAll])

  const redeemItem = useCallback(async (kidId, shopItemId) => {
    const item = data.shopItems.find((s) => s.id === shopItemId)
    if (!item) return { error: 'Item not found' }
    const balance = utilGetStarBalance(data, kidId)
    if (balance < item.priceStars) return { error: 'Not enough stars' }
    const { error } = await supabase.from('redemptions').insert({
      household_id: householdId,
      kid_id: kidId,
      shop_item_id: shopItemId,
      stars: item.priceStars,
      at: new Date().toISOString(),
    })
    if (error) throw error
    await fetchAll()
    return { success: true }
  }, [householdId, data.shopItems, data, fetchAll])

  const submitCompletions = useCallback(async (kidId, items) => {
    let created = 0
    for (const { choreId, periodKey } of items) {
      const exists = data.completions.some(
        (c) =>
          c.kidId === kidId &&
          c.choreId === choreId &&
          c.periodKey === periodKey &&
          (c.status === 'approved' || c.status === 'pending')
      )
      if (exists) continue
      const chore = data.chores.find((c) => c.id === choreId)
      if (!chore) continue
      const { error } = await supabase.from('completions').insert({
        household_id: householdId,
        chore_id: choreId,
        kid_id: kidId,
        stars: chore.starValue,
        date: periodKey.slice(0, 10),
        period_key: periodKey,
        status: 'pending',
        submitted_at: new Date().toISOString(),
      })
      if (!error) created += 1
    }
    await fetchAll()
    return { created, skipped: items.length - created }
  }, [householdId, data.chores, data.completions, fetchAll])

  const importAgePresetData = useCallback(async (age = null, options = {}) => {
    const assignToMatchingKids = options.assignToMatchingKids !== false
    const sourcePresets =
      age == null ? AGE_CHORE_PRESETS : AGE_CHORE_PRESETS.filter((p) => p.age === Number(age))
    let choresCreated = 0
    let setsCreated = 0
    let setsUpdated = 0
    let kidsAssigned = 0

    for (const preset of sourcePresets) {
      for (const setPreset of preset.sets) {
        const choreIds = []
        for (const chorePreset of setPreset.chores) {
          const existing = data.chores.find(
            (c) => normalizedName(c.name) === normalizedName(chorePreset.name)
          )
          if (existing) {
            choreIds.push(existing.id)
          } else {
            const { data: inserted } = await supabase
              .from('chores')
              .insert({
                household_id: householdId,
                name: chorePreset.name.trim(),
                star_value: Number(chorePreset.starValue) || 0,
              })
              .select('id')
              .single()
            if (inserted) {
              choreIds.push(inserted.id)
              choresCreated += 1
            }
          }
        }
        const setName = `Age ${preset.age} - ${setPreset.name}`
        const existingSet = data.choreSets.find(
          (s) => normalizedName(s.name) === normalizedName(setName)
        )
        if (existingSet) {
          await updateChoreSet(existingSet.id, {
            choreIds: [...new Set(choreIds)],
            frequency: setPreset.frequency || 'daily',
          })
          setsUpdated += 1
        } else {
          await addChoreSet(setName, choreIds, setPreset.frequency || 'daily')
          setsCreated += 1
        }
      }
    }

    if (assignToMatchingKids) {
      await fetchAll()
      const freshData = { ...data }
      for (const preset of sourcePresets) {
        const setIdsForAge = (data.choreSets || [])
          .filter((s) => normalizedName(s.name).startsWith(normalizedName(`Age ${preset.age} - `)))
          .map((s) => s.id)
        for (const kid of data.kids) {
          const kidAge = parseInt(String(kid.age || '').trim(), 10)
          if (kidAge !== preset.age) continue
          const current = new Set(kid.choreSetIds || [])
          const before = current.size
          setIdsForAge.forEach((id) => current.add(id))
          if (current.size > before) {
            await updateKid(kid.id, { choreSetIds: Array.from(current) })
            kidsAssigned += 1
          }
        }
      }
    }

    return {
      agesLoaded: sourcePresets.map((p) => p.age),
      choresCreated,
      setsCreated,
      setsUpdated,
      kidsAssigned,
    }
  }, [
    householdId,
    data,
    addChoreSet,
    updateChoreSet,
    updateKid,
    fetchAll,
  ])

  const value = {
    ...data,
    loading,
    error,
    refresh: fetchAll,
    getStarBalance,
    getChoresForKidToday,
    getChoresForKidOnDate,
    getHabitStats,
    getKidsForChore,
    getPendingCompletions,
    getApprovedCompletions,
    getCompletionForPeriod,
    addKid,
    updateKid,
    deleteKid,
    addChore,
    updateChore,
    deleteChore,
    addChoreSet,
    updateChoreSet,
    deleteChoreSet,
    approveCompletion,
    rejectCompletion,
    recordCompletion,
    removeCompletion: rejectCompletion,
    addShopItem,
    updateShopItem,
    deleteShopItem,
    redeemItem,
    submitCompletions,
    importAgePresetData,
  }

  return (
    <HouseholdContext.Provider value={value}>
      {children}
    </HouseholdContext.Provider>
  )
}

export function useHousehold() {
  const ctx = useContext(HouseholdContext)
  if (!ctx) throw new Error('useHousehold must be used within HouseholdProvider')
  return ctx
}
