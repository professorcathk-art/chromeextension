import {
  emptyResume,
  type ResumeProfile,
  type SubscriptionStatus
} from "~/lib/types"

export type ApplyFlowState = {
  resume: ResumeProfile
  resumeText: string
  jobDescription: string
  usageCount: number
  subscriptionStatus: SubscriptionStatus
  email: string
}

const key = "applyflow-state"

export async function readState(): Promise<ApplyFlowState> {
  const stored = await chrome.storage.local.get(key)
  const value = stored[key]
  if (typeof value !== "object" || value === null) {
    return {
      resume: emptyResume(),
      resumeText: "",
      jobDescription: "",
      usageCount: 0,
      subscriptionStatus: "free",
      email: ""
    }
  }

  const record = value as Partial<ApplyFlowState>
  return {
    resume: record.resume ?? emptyResume(),
    resumeText: typeof record.resumeText === "string" ? record.resumeText : "",
    jobDescription: typeof record.jobDescription === "string" ? record.jobDescription : "",
    usageCount: typeof record.usageCount === "number" ? record.usageCount : 0,
    subscriptionStatus: record.subscriptionStatus ?? "free",
    email: record.email ?? ""
  }
}

export async function writeState(next: ApplyFlowState) {
  await chrome.storage.local.set({ [key]: next })
}
