import { createClient } from "@/lib/supabase/server"
import { getSupabasePublicEnv } from "@/lib/supabase/env"
import type { CurrentUser, SessionState } from "@/types"

export async function getSession(): Promise<SessionState> {
  if (!getSupabasePublicEnv()) {
    return { status: "unconfigured" }
  }

  const supabase = await createClient()
  if (!supabase) {
    return { status: "unconfigured" }
  }

  const { data, error } = await supabase.auth.getClaims()
  if (error || !data?.claims.sub) {
    return { status: "signed_out" }
  }

  return {
    status: "signed_in",
    user: {
      id: data.claims.sub,
      email: data.claims.email ?? "",
    },
  }
}

export function requireSignedInUser(session: SessionState): CurrentUser | null {
  if (session.status === "signed_in") {
    return session.user
  }

  return null
}
