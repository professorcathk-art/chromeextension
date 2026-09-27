import type { FillApiResponse, SavedDetails, UserApiResponse } from "@/types/api"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function readString(value: unknown): string {
  return typeof value === "string" ? value : ""
}

export function parseSavedDetails(value: unknown): SavedDetails | null {
  if (!isRecord(value)) {
    return null
  }

  return {
    fullName: readString(value.fullName),
    email: readString(value.email),
    phone: readString(value.phone),
    location: readString(value.location),
    headline: readString(value.headline),
  }
}

export function parseUserApiResponse(value: unknown): UserApiResponse | null {
  if (!isRecord(value) || typeof value.status !== "string") {
    return null
  }

  if (value.status === "ok") {
    const profile = parseSavedDetails(value.profile)
    if (!profile) {
      return null
    }
    return {
      status: "ok",
      profile,
      hasSavedDetails: value.hasSavedDetails === true,
    }
  }

  if (
    value.status === "signed_out" ||
    value.status === "unconfigured" ||
    value.status === "error"
  ) {
    return { status: value.status, message: readString(value.message) }
  }

  return null
}

export function parseFillApiResponse(value: unknown): FillApiResponse | null {
  if (!isRecord(value) || typeof value.status !== "string") {
    return null
  }

  if (value.status === "ok") {
    const details = parseSavedDetails(value.filled)
    if (!isRecord(value.filled) || !details) {
      return null
    }
    return {
      status: "ok",
      filled: {
        ...details,
        title: readString(value.filled.title),
        company: readString(value.filled.company),
        jobUrl: readString(value.filled.jobUrl),
      },
    }
  }

  if (
    value.status === "signed_out" ||
    value.status === "unconfigured" ||
    value.status === "error"
  ) {
    return { status: value.status, message: readString(value.message) }
  }

  return null
}
