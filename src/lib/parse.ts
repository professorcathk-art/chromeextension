import type { Application, ApplicationStatus, Profile } from "@/types"

const statuses: readonly ApplicationStatus[] = [
  "draft",
  "ready",
  "filled",
  "submitted",
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function readString(value: unknown): string | null {
  return typeof value === "string" ? value : null
}

export function isApplicationStatus(value: string): value is ApplicationStatus {
  return statuses.some((status) => status === value)
}

export function parseProfile(value: unknown): Profile | null {
  if (!isRecord(value)) {
    return null
  }

  const id = readString(value.id)
  const email = readString(value.email)
  const fullName = readString(value.full_name)
  const createdAt = readString(value.created_at)

  if (!id || email === null || fullName === null || !createdAt) {
    return null
  }

  return {
    id,
    email,
    fullName,
    phone: readString(value.phone),
    location: readString(value.location),
    headline: readString(value.headline),
    createdAt,
  }
}

export function parseApplications(value: unknown): Application[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value.flatMap((item) => {
    if (!isRecord(item)) {
      return []
    }

    const id = readString(item.id)
    const userId = readString(item.user_id)
    const title = readString(item.title)
    const status = readString(item.status)
    const createdAt = readString(item.created_at)

    if (!id || !userId || !title || !status || !isApplicationStatus(status) || !createdAt) {
      return []
    }

    return [
      {
        id,
        userId,
        title,
        company: readString(item.company),
        jobUrl: readString(item.job_url),
        status,
        createdAt,
      },
    ]
  })
}

export function readField(formData: FormData, key: string): string {
  const value = formData.get(key)
  return typeof value === "string" ? value.trim() : ""
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === "https:" || url.protocol === "http:"
  } catch {
    return false
  }
}
