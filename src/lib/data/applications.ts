import { createClient } from "@/lib/supabase/server"
import { parseApplications } from "@/lib/parse"
import type { Application } from "@/types"

export type ApplicationsResult =
  | { status: "ok"; applications: Application[] }
  | { status: "error"; message: string }

export async function listApplications(userId: string): Promise<ApplicationsResult> {
  const supabase = await createClient()
  if (!supabase) {
    return {
      status: "error",
      message: "Saving isn't connected yet.",
    }
  }

  const { data, error } = await supabase
    .from("applications")
    .select("id, user_id, title, company, job_url, status, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })

  if (error) {
    return {
      status: "error",
      message: "We couldn't load your applications.",
    }
  }

  return { status: "ok", applications: parseApplications(data) }
}
