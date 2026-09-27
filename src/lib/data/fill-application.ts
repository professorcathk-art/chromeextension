import { createClient } from "@/lib/supabase/server"
import { getProfile } from "@/lib/data/profile"
import { getSession } from "@/lib/supabase/session"
import { isEmail, isHttpUrl } from "@/lib/parse"
import type { FillApiResponse, SavedDetails, UserApiResponse } from "@/types/api"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

export async function loadUserDetails(): Promise<UserApiResponse> {
  const session = await getSession()

  if (session.status === "unconfigured") {
    return { status: "unconfigured", message: "Saving isn't connected yet." }
  }

  if (session.status === "signed_out") {
    return { status: "signed_out", message: "Sign in to use your saved details." }
  }

  const result = await getProfile(session.user.id)
  if (result.status === "error") {
    return { status: "error", message: result.message }
  }

  const profile = result.profile
  const saved: SavedDetails = {
    fullName: profile?.fullName ?? "",
    email: profile?.email || session.user.email,
    phone: profile?.phone ?? "",
    location: profile?.location ?? "",
    headline: profile?.headline ?? "",
  }

  return {
    status: "ok",
    profile: saved,
    hasSavedDetails: Boolean(profile?.fullName),
  }
}

export async function fillApplication(body: unknown): Promise<FillApiResponse> {
  const session = await getSession()

  if (session.status === "unconfigured") {
    return {
      status: "unconfigured",
      message: "Saving isn't connected yet, so this application can't be stored.",
    }
  }

  if (session.status === "signed_out") {
    return {
      status: "signed_out",
      message: "Sign in first, then save this application.",
    }
  }

  if (!isRecord(body)) {
    return { status: "error", message: "Enter the job title and try again." }
  }

  const record = body
  const title = text(record.title)
  const company = text(record.company)
  const jobUrl = text(record.jobUrl)
  const fullName = text(record.fullName)
  const email = text(record.email) || session.user.email
  const phone = text(record.phone)
  const location = text(record.location)
  const headline = text(record.headline)

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
  if (fullName.length < 2) {
    return { status: "error", message: "Enter your name." }
  }
  if (!isEmail(email)) {
    return { status: "error", message: "Enter a valid email address." }
  }
  if (phone.length > 40) {
    return { status: "error", message: "That phone number looks too long." }
  }
  if (location.length > 80) {
    return { status: "error", message: "Keep your location under 80 characters." }
  }
  if (headline.length > 120) {
    return { status: "error", message: "Keep the short summary under 120 characters." }
  }

  const supabase = await createClient()
  if (!supabase) {
    return {
      status: "unconfigured",
      message: "Saving isn't connected yet, so this application can't be stored.",
    }
  }

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: session.user.id,
    email,
    full_name: fullName,
    phone: phone || null,
    location: location || null,
    headline: headline || null,
  })

  if (profileError) {
    return { status: "error", message: "We couldn't save your details. Try again." }
  }

  const { data, error } = await supabase
    .from("applications")
    .insert({
      user_id: session.user.id,
      title,
      company: company || null,
      job_url: jobUrl || null,
      status: "ready",
    })
    .select("id")
    .single()

  if (error || !data || typeof data.id !== "string") {
    return { status: "error", message: "We couldn't save that application. Try again." }
  }

  const summary = company
    ? `Filled an application for ${title} at ${company}.`
    : `Filled an application for ${title}.`

  await supabase.from("activity_logs").insert({
    user_id: session.user.id,
    entity_id: data.id,
    event_type: "application.filled",
    message: summary,
  })

  return {
    status: "ok",
    filled: {
      fullName,
      email,
      phone,
      location,
      headline,
      title,
      company,
      jobUrl,
    },
  }
}
