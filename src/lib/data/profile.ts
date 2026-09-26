import { createClient } from "@/lib/supabase/server"
import { parseProfile } from "@/lib/parse"
import type { Profile } from "@/types"

export type ProfileResult =
  | { status: "ok"; profile: Profile | null }
  | { status: "error"; message: string }

export async function getProfile(userId: string): Promise<ProfileResult> {
  const supabase = await createClient()
  if (!supabase) {
    return { status: "error", message: "Saving isn't connected yet." }
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, full_name, phone, location, headline, created_at")
    .eq("id", userId)
    .maybeSingle()

  if (error) {
    return { status: "error", message: "We couldn't load your details." }
  }

  return { status: "ok", profile: data ? parseProfile(data) : null }
}
