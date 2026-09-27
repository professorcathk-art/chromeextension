import { draftAnswer } from "~/lib/resume-format"
import type { FillPageResult, ResumeProfile } from "~/lib/types"

import { WorkdayFiller } from "./workday-dom"
import { setReactInputValue } from "./utils"

type FillMessage = {
  type: "FILL_PAGE"
  resume: ResumeProfile
  jobDescription?: string
  resumeText?: string
}

type AnswerMessage = {
  type: "QUESTION_ANSWER"
  answer: string | null
}

function isFillMessage(value: unknown): value is FillMessage {
  if (typeof value !== "object" || value === null) {
    return false
  }
  const message = value as { type?: unknown; resume?: unknown }
  return message.type === "FILL_PAGE" && typeof message.resume === "object"
}

function pageJobDescription() {
  const node = document.querySelector(
    '[data-automation-id="jobPostingDescription"], [data-automation-id="job-posting-description"]'
  )
  return (node?.textContent ?? "").replace(/\s+/g, " ").trim().slice(0, 8000)
}

async function askForAnswer(
  prompt: string,
  resume: ResumeProfile,
  jobDescription: string,
  resumeText: string
) {
  const response = await chrome.runtime.sendMessage({
    type: "ANSWER_QUESTION",
    prompt,
    resume,
    jobDescription,
    resumeText
  })
  if (typeof response !== "object" || response === null) {
    return null
  }
  const answer = (response as AnswerMessage).answer
  return typeof answer === "string" && answer.trim() ? answer : null
}

export function registerWorkdayContent() {
  chrome.runtime.onMessage.addListener((message: unknown, _sender, sendResponse) => {
    if (!isFillMessage(message)) {
      return
    }

    const filler = new WorkdayFiller()
    const standard = filler.fillStandardFields(message.resume)
    const questions = filler.customQuestions(standard.used)

    void (async () => {
      const result: FillPageResult = {
        filled: standard.filled.map((field) => ({ label: field.label, filled: true })),
        skipped: [...standard.skipped],
        answers: "none"
      }
      const jobDescription = message.jobDescription?.trim() || pageJobDescription()
      const resumeText = message.resumeText ?? ""
      let usedAi = false
      let usedDraft = false

      for (const question of questions) {
        const generated = await askForAnswer(question.prompt, message.resume, jobDescription, resumeText)
        const answer = generated ?? draftAnswer(question.prompt, message.resume, jobDescription)
        if (!answer) {
          result.skipped.push(question.prompt)
          continue
        }
        if (generated) {
          usedAi = true
        } else {
          usedDraft = true
        }
        setReactInputValue(question.element, answer)
        result.filled.push({ label: question.prompt, filled: true })
      }

      result.answers = usedAi ? "ai" : usedDraft ? "draft" : "none"

      sendResponse(result)
    })()

    return true
  })
}
