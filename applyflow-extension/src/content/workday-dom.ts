import type { ResumeProfile } from "~/lib/types"

import { fieldLabel, setReactInputValue } from "./utils"

type FieldTarget = {
  label: string
  automationIds: string[]
  hints: string[]
  value: (resume: ResumeProfile) => string
}

const targets: FieldTarget[] = [
  {
    label: "First name",
    automationIds: ["legalNameSection_firstName", "firstName"],
    hints: ["first name", "given name"],
    value: (resume) => resume.personal_info.first_name
  },
  {
    label: "Last name",
    automationIds: ["legalNameSection_lastName", "lastName"],
    hints: ["last name", "family name", "surname"],
    value: (resume) => resume.personal_info.last_name
  },
  {
    label: "Email",
    automationIds: ["email", "emailAddress"],
    hints: ["email"],
    value: (resume) => resume.personal_info.email
  },
  {
    label: "Phone",
    automationIds: ["phone", "phoneNumber", "phone-number"],
    hints: ["phone", "mobile"],
    value: (resume) => resume.personal_info.phone
  },
  {
    label: "City",
    automationIds: ["addressSection_city", "city"],
    hints: ["city"],
    value: (resume) => resume.personal_info.location
  },
  {
    label: "LinkedIn",
    automationIds: ["linkedIn", "linkedin"],
    hints: ["linkedin"],
    value: (resume) => resume.personal_info.linkedin
  },
  {
    label: "Company",
    automationIds: ["company", "companyName"],
    hints: ["company"],
    value: (resume) => resume.work_experience[0]?.company ?? ""
  },
  {
    label: "Job title",
    automationIds: ["jobTitle", "title"],
    hints: ["job title", "position"],
    value: (resume) => resume.work_experience[0]?.title ?? ""
  },
  {
    label: "School",
    automationIds: ["school", "schoolName"],
    hints: ["school", "university", "college"],
    value: (resume) => resume.education[0]?.school ?? ""
  },
  {
    label: "Degree",
    automationIds: ["degree"],
    hints: ["degree"],
    value: (resume) => resume.education[0]?.degree ?? ""
  }
]

function isFillable(
  element: Element
): element is HTMLInputElement | HTMLTextAreaElement {
  if (element instanceof HTMLTextAreaElement) {
    return !element.disabled && !element.readOnly
  }
  if (!(element instanceof HTMLInputElement)) {
    return false
  }
  const blocked = ["hidden", "password", "file", "checkbox", "radio", "submit"]
  return !element.disabled && !element.readOnly && !blocked.includes(element.type)
}

function findByAutomationId(id: string) {
  const nodes = document.querySelectorAll(`[data-automation-id="${CSS.escape(id)}"]`)
  for (const node of nodes) {
    if (isFillable(node)) {
      return node
    }
    const nested = node.querySelector("input, textarea")
    if (nested && isFillable(nested)) {
      return nested
    }
  }
  return null
}

function findByHint(hints: string[]) {
  const fields = document.querySelectorAll("input, textarea")
  for (const field of fields) {
    if (!isFillable(field)) {
      continue
    }
    const label = fieldLabel(field)
    if (hints.some((hint) => label.includes(hint))) {
      return field
    }
  }
  return null
}

export class WorkdayFiller {
  fillStandardFields(resume: ResumeProfile) {
    const filled: { label: string }[] = []
    const skipped: string[] = []
    const used = new Set<HTMLElement>()

    for (const target of targets) {
      const value = target.value(resume).trim()
      if (!value) {
        skipped.push(target.label)
        continue
      }

      const element =
        target.automationIds
          .map((id) => findByAutomationId(id))
          .find((match) => match !== null) ?? findByHint(target.hints)

      if (!element || used.has(element)) {
        skipped.push(target.label)
        continue
      }

      setReactInputValue(element, value)
      used.add(element)
      filled.push({ label: target.label })
    }

    return { filled, skipped, used }
  }

  customQuestions(used: Set<HTMLElement>) {
    const questions: { element: HTMLTextAreaElement; prompt: string }[] = []
    const areas = document.querySelectorAll("textarea")

    for (const area of areas) {
      if (!isFillable(area) || used.has(area) || questions.length >= 3) {
        continue
      }
      const prompt = fieldLabel(area)
      if (prompt.length < 12) {
        continue
      }
      questions.push({ element: area, prompt })
    }

    return questions
  }
}
