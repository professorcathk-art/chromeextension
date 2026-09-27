import { answerWorkdayQuestion } from "~/lib/ai-agent"
import { readState, writeState } from "~/lib/storage"
import { FREE_FILL_LIMIT, type FillPageResult, type ResumeProfile } from "~/lib/types"

type StartFillMessage = { type: "START_FILL" }
type AnswerMessage = { type: "ANSWER_QUESTION"; prompt: string; resume: ResumeProfile }

export type StartFillResponse =
  | { ok: true; result: FillPageResult; usageCount: number }
  | { ok: false; reason: "paywall" | "no-resume" | "not-workday" | "no-tab"; message: string; usageCount: number }

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function isWorkdayUrl(url: string | undefined) {
  if (!url) {
    return false
  }
  try {
    const host = new URL(url).hostname
    return host.endsWith("myworkday.com") || host.endsWith("myworkdayjobs.com") || host.endsWith("workday.com")
  } catch {
    return false
  }
}

async function startFill(): Promise<StartFillResponse> {
  const state = await readState()
  const info = state.resume.personal_info
  if (!info.first_name.trim() || !info.email.trim()) {
    return {
      ok: false,
      reason: "no-resume",
      message: "Add your name and email first.",
      usageCount: state.usageCount
    }
  }

  if (state.subscriptionStatus !== "pro" && state.usageCount >= FREE_FILL_LIMIT) {
    return {
      ok: false,
      reason: "paywall",
      message: "Free tier reached. Upgrade to Pro for unlimited applications.",
      usageCount: state.usageCount
    }
  }

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.id) {
    return {
      ok: false,
      reason: "no-tab",
      message: "Open a Workday application first.",
      usageCount: state.usageCount
    }
  }

  if (!isWorkdayUrl(tab.url)) {
    return {
      ok: false,
      reason: "not-workday",
      message: "Open the Workday application page, then try again.",
      usageCount: state.usageCount
    }
  }

  let result: unknown
  try {
    result = await chrome.tabs.sendMessage(tab.id, {
      type: "FILL_PAGE",
      resume: state.resume,
      jobDescription: state.jobDescription,
      resumeText: state.resumeText
    })
  } catch {
    return {
      ok: false,
      reason: "not-workday",
      message: "Reload the Workday page so ApplyFlow can see the form, then try again.",
      usageCount: state.usageCount
    }
  }

  const filled = isRecord(result) && Array.isArray(result.filled) ? result.filled.length : 0
  if (filled > 0 && state.subscriptionStatus !== "pro") {
    state.usageCount += 1
    await writeState(state)
  }

  return {
    ok: true,
    result: {
      filled: isRecord(result) && Array.isArray(result.filled) ? result.filled : [],
      skipped: isRecord(result) && Array.isArray(result.skipped) ? result.skipped : [],
      answers:
        isRecord(result) && (result.answers === "ai" || result.answers === "draft" || result.answers === "none")
          ? result.answers
          : "none"
    },
    usageCount: state.usageCount
  }
}

export function registerBackground() {
  void chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })

  chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
    if (!isRecord(message) || typeof message.type !== "string") {
      return
    }

    if (message.type === "START_FILL") {
      void startFill().then(sendResponse)
      return true
    }

    if (message.type === "ANSWER_QUESTION") {
      const prompt = typeof message.prompt === "string" ? message.prompt : ""
      const resume = message.resume
      if (!prompt || !isRecord(resume)) {
        sendResponse({ answer: null })
        return true
      }
      void answerWorkdayQuestion(prompt, resume as ResumeProfile, {
        jobDescription: typeof message.jobDescription === "string" ? message.jobDescription : "",
        resumeText: typeof message.resumeText === "string" ? message.resumeText : ""
      }).then((answer) => {
        sendResponse({ answer })
      })
      return true
    }

    return
  })
}

export type { AnswerMessage, StartFillMessage }
