export type SavedDetails = {
  fullName: string
  email: string
  phone: string
  location: string
  headline: string
}

export type FilledApplication = SavedDetails & {
  title: string
  company: string
  jobUrl: string
}

export type UserApiResponse =
  | { status: "ok"; profile: SavedDetails; hasSavedDetails: boolean }
  | { status: "signed_out"; message: string }
  | { status: "unconfigured"; message: string }
  | { status: "error"; message: string }

export type FillApiResponse =
  | { status: "ok"; filled: FilledApplication }
  | { status: "signed_out"; message: string }
  | { status: "unconfigured"; message: string }
  | { status: "error"; message: string }
