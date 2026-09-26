"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getSupabasePublicEnv } from "@/lib/supabase/env"
import { isEmail, readField } from "@/lib/parse"
import type { ActionState } from "@/types"

function authErrorMessage(message: string): string {
  const normalized = message.toLowerCase()

  if (normalized.includes("invalid login")) {
    return "That email and password don't match."
  }

  if (normalized.includes("already registered") || normalized.includes("already been registered")) {
    return "An account with that email already exists. Sign in instead."
  }

  if (normalized.includes("password")) {
    return "Use a password with at least 8 characters."
  }

  return "We couldn't finish that. Check your details and try again."
}

export async function signIn(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!getSupabasePublicEnv()) {
    return {
      status: "error",
      message: "Saving isn't connected yet, so sign-in can't run.",
    }
  }

  const email = readField(formData, "email")
  const password = readField(formData, "password")

  if (!isEmail(email)) {
    return { status: "error", message: "Enter a valid email address." }
  }

  if (password.length < 8) {
    return { status: "error", message: "Use a password with at least 8 characters." }
  }

  const supabase = await createClient()
  if (!supabase) {
    return {
      status: "error",
      message: "Saving isn't connected yet, so sign-in can't run.",
    }
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return { status: "error", message: authErrorMessage(error.message) }
  }

  redirect("/dashboard")
}

export async function signUp(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  if (!getSupabasePublicEnv()) {
    return {
      status: "error",
      message: "Saving isn't connected yet, so accounts can't be created.",
    }
  }

  const fullName = readField(formData, "fullName")
  const email = readField(formData, "email")
  const password = readField(formData, "password")

  if (fullName.length < 2) {
    return { status: "error", message: "Enter your name." }
  }

  if (!isEmail(email)) {
    return { status: "error", message: "Enter a valid email address." }
  }

  if (password.length < 8) {
    return { status: "error", message: "Use a password with at least 8 characters." }
  }

  const supabase = await createClient()
  if (!supabase) {
    return {
      status: "error",
      message: "Saving isn't connected yet, so accounts can't be created.",
    }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  })

  if (error) {
    return { status: "error", message: authErrorMessage(error.message) }
  }

  if (!data.session) {
    return {
      status: "success",
      message: "Check your email to finish creating your account, then sign in.",
    }
  }

  redirect("/dashboard")
}

export async function signOut(): Promise<void> {
  const supabase = await createClient()
  if (supabase) {
    await supabase.auth.signOut()
  }

  redirect("/")
}
