"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/supabase/session"
import { readField } from "@/lib/parse"
import type { ActionState } from "@/types"

export async function saveProfile(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await getSession()

  if (session.status === "unconfigured") {
    return {
      status: "error",
      message: "Saving isn't connected yet, so your details can't be stored.",
    }
  }

  if (session.status === "signed_out") {
    redirect("/login")
  }

  const fullName = readField(formData, "fullName")
  const phone = readField(formData, "phone")
  const location = readField(formData, "location")
  const headline = readField(formData, "headline")

  if (fullName.length < 2) {
    return { status: "error", message: "Enter your name." }
  }

  if (fullName.length > 80) {
    return { status: "error", message: "Keep your name under 80 characters." }
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
      status: "error",
      message: "Saving isn't connected yet, so your details can't be stored.",
    }
  }

  const { error } = await supabase.from("profiles").upsert({
    id: session.user.id,
    email: session.user.email,
    full_name: fullName,
    phone: phone || null,
    location: location || null,
    headline: headline || null,
  })

  if (error) {
    return { status: "error", message: "We couldn't save your details. Try again." }
  }

  await supabase.from("activity_logs").insert({
    user_id: session.user.id,
    entity_id: session.user.id,
    event_type: "profile.updated",
    message: "Updated the details used to fill applications.",
  })

  return { status: "success", message: "Your details are saved." }
}
