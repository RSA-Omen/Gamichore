import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [householdId, setHouseholdId] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchHouseholdId(session.user.id).then(setHouseholdId)
      } else {
        setHouseholdId(null)
      }
      setLoading(false)
    })

    if (!supabase) return
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchHouseholdId(session.user.id).then(setHouseholdId)
      } else {
        setHouseholdId(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  async function fetchHouseholdId(userId, retries = 1) {
    if (!supabase) return null
    for (let i = 0; i <= retries; i++) {
      const { data } = await supabase
        .from('profiles')
        .select('household_id')
        .eq('id', userId)
        .maybeSingle()
      if (data?.household_id) return data.household_id
      if (i < retries) await new Promise((r) => setTimeout(r, 400))
    }
    return null
  }

  async function signUp(email, password) {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    if (data.user) {
      // Trigger creates household + profile automatically; retry in case of timing
      const hid = await fetchHouseholdId(data.user.id, 3)
      if (hid) setHouseholdId(hid)
      else if (data.session) throw new Error('Profile not ready. Run migration 20250225000002_backfill_profiles.sql in Supabase SQL Editor, then try again.')
    }
    return data
  }

  async function signIn(email, password) {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    if (data.user) {
      const hid = await fetchHouseholdId(data.user.id, 3)
      setHouseholdId(hid)
      if (!hid && data.session) throw new Error('Profile missing. Run migration 20250225000002_backfill_profiles.sql in Supabase SQL Editor, then try again.')
    }
    return data
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut()
    setHouseholdId(null)
  }

  const value = {
    user,
    householdId,
    loading,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!user && !!householdId,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
