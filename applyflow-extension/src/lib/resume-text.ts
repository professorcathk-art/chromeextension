import { emptyResume, type ResumeProfile } from "~/lib/types"

export function resumeFromText(text: string): ResumeProfile {
  const resume = emptyResume()
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
  const phone = text.match(/(?:\+?\d[\d().\-\s]{7,}\d)/)
  const linkedin = text.match(/https?:\/\/(?:www\.)?linkedin\.com\/[^\s)]+/i)
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
  const name = lines.find((line) => /^[A-Za-z][A-Za-z.'-]+(?:\s+[A-Za-z][A-Za-z.'-]+){1,2}$/.test(line))

  if (name) {
    const [first, ...rest] = name.split(/\s+/)
    resume.personal_info.first_name = first ?? ""
    resume.personal_info.last_name = rest.join(" ")
  }
  resume.personal_info.email = email?.[0] ?? ""
  resume.personal_info.phone = phone?.[0]?.trim() ?? ""
  resume.personal_info.linkedin = linkedin?.[0] ?? ""
  return resume
}

export async function readResumeFile(file: File): Promise<string> {
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    throw new Error("Save the resume as a text file, or connect AI to read PDFs.")
  }
  return file.text()
}
