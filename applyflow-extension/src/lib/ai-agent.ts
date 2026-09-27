import type { ResumeProfile } from "~/lib/types"

import { getSupabase } from "./supabase"

export async function answerWorkdayQuestion(
  question: string,
  resume: ResumeProfile
): Promise<string | null> {
  const supabase = getSupabase()
  if (!supabase) {
    return null
  }

  const { data, error } = await supabase.functions.invoke("answer-question", {
    body: { question, resume }
  })

  if (error || typeof data !== "object" || data === null) {
    return null
  }

  const answer = (data as { answer?: unknown }).answer
  return typeof answer === "string" ? answer.trim() : null
}

export async function parseResumeText(text: string): Promise<ResumeProfile | null> {
  const supabase = getSupabase()
  if (!supabase) {
    return null
  }

  const { data, error } = await supabase.functions.invoke("parse-resume", {
    body: { text }
  })

  if (error || typeof data !== "object" || data === null) {
    return null
  }

  const resume = (data as { resume?: unknown }).resume
  if (typeof resume !== "object" || resume === null) {
    return null
  }

  return resume as ResumeProfile
}
