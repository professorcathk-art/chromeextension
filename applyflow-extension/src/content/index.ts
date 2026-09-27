import type { FillPageResult, ResumeProfile } from "~/lib/types"

import { WorkdayFiller } from "./workday-dom"
import { setReactInputValue } from "./utils"

type FillMessage = {
  type: "FILL_PAGE"
  resume: ResumeProfile
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

async function askForAnswer(prompt: string, resume: ResumeProfile) {
  const response = await chrome.runtime.sendMessage({
    type: "ANSWER_QUESTION",
    prompt,
    resume
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
        skipped: [...standard.skipped]
      }

      for (const question of questions) {
        const answer = await askForAnswer(question.prompt, message.resume)
        if (!answer) {
          result.skipped.push(question.prompt)
          continue
        }
        setReactInputValue(question.element, answer)
        result.filled.push({ label: question.prompt, filled: true })
      }

      sendResponse(result)
    })()

    return true
  })
}
