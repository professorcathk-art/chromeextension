export type ApplicationStatus = "draft" | "ready" | "filled" | "submitted"

export type Profile = {
  id: string
  email: string
  fullName: string
  phone: string | null
  location: string | null
  headline: string | null
  createdAt: string
}

export type Application = {
  id: string
  userId: string
  title: string
  company: string | null
  jobUrl: string | null
  status: ApplicationStatus
  createdAt: string
}

export type CurrentUser = {
  id: string
  email: string
}

export type SessionState =
  | { status: "unconfigured" }
  | { status: "signed_out" }
  | { status: "signed_in"; user: CurrentUser }

export type ActionState = {
  status: "idle" | "error" | "success"
  message: string
}

export const initialActionState: ActionState = {
  status: "idle",
  message: "",
}

export const applicationStatusLabel: Record<ApplicationStatus, string> = {
  draft: "Draft",
  ready: "Ready to fill",
  filled: "Filled",
  submitted: "Submitted",
}
