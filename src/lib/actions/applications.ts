"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/supabase/session"
import { isHttpUrl, readField } from "@/lib/parse"
import type { ActionState } from "@/types"

export async function createApplication(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession()

  if (session.status === "unconfigured") {
    return {
      status: "error",
      message: "Saving isn't connected yet, so this application can't be stored.",
    }
  }

  if (session.status === "signed_out") {
    redirect("/login")
  }

  const title = readField(formData, "title")
  const company = readField(formData, "company")
  const jobUrl = readField(formData, "jobUrl")

  if (title.length < 2) {
    return { status: "error", message: "Enter the job title." }
  }

  if (title.length > 120) {
    return { status: "error", message: "Keep the job title under 120 characters." }
  }

  if (company.length > 120) {
    return { status: "error", message: "Keep the company name under 120 characters." }
  }

  if (jobUrl && !isHttpUrl(jobUrl)) {
    return { status: "error", message: "Enter a full link, starting with https://." }
  }

  const supabase = await createClient()
  if (!supabase) {
    return {
      status: "error",
      message: "Saving isn't connected yet, so this application can't be stored.",
    }
  }

  const { data, error } = await supabase
    .from("applications")
    .insert({
      user_id: session.user.id,
      title,
      company: company || null,
      job_url: jobUrl || null,
      status: "draft",
    })
    .select("id")
    .single()

  if (error || !data || typeof data.id !== "string") {
    return {
      status: "error",
      message: "We couldn't save that application. Try again.",
    }
  }

  await supabase.from("activity_logs").insert({
    user_id: session.user.id,
    entity_id: data.id,
    event_type: "application.created",
    message: company
      ? `Started an application for ${title} at ${company}.`
      : `Started an application for ${title}.`,
  })

  redirect("/dashboard?created=1")
}
