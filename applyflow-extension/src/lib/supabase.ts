import { createClient, type SupabaseClient } from "@supabase/supabase-js"

let client: SupabaseClient | null | undefined

export function getSupabase() {
  if (client !== undefined) {
    return client
  }

  const url = process.env.PLASMO_PUBLIC_SUPABASE_URL
  const key = process.env.PLASMO_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    client = null
    return client
  }

  client = createClient(url, key)
  return client
}

export function isSupabaseConfigured() {
  return getSupabase() !== null
}
