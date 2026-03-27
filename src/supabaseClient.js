import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

let supabase = null

if (supabaseUrl && supabaseAnonKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseAnonKey)
  } catch (err) {
    console.warn('Supabase connection failed:', err)
  }
}

if (!supabase) {
  const dummy = () => ({ select: () => Promise.resolve({ data: null }), insert: () => ({ select: () => Promise.resolve({ data: null }) }), update: () => ({ eq: () => Promise.resolve({ data: null }) }), delete: () => ({ eq: () => Promise.resolve({ data: null }) }) })
  supabase = { from: () => dummy() }
}

export { supabase }
