import { emptyResume, type Education, type ResumeProfile, type WorkExperience } from "./types"

const sensitiveQuestion =
  /\b(authorized to work|work authorization|visa|sponsor|sponsorship|disability|veteran|gender|race|ethnicity|criminal|felony|pronouns|sexual orientation|religion|salary|compensation)\b/i

export function cleanResumeText(raw: string) {
  let text = raw.replace(/\u0000/g, "")
  text = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
  text = text.replace(/[\u00a0\u2000-\u200b\ufeff]/g, " ")
  text = text.replace(/([A-Za-z])-\n([A-Za-z])/g, "$1$2")
  text = text
    .split("\n")
    .reduce<string[]>((lines, line) => {
      const previous = lines[lines.length - 1]
      const next = line.trim()
      const canJoin =
        previous &&
        !/[.!?:]$/.test(previous.trim()) &&
        /^[a-z]/.test(next) &&
        !/@|https?:|linkedin/i.test(`${previous}\n${next}`)
      if (canJoin) {
        lines[lines.length - 1] = `${previous.trimEnd()} ${next}`
      } else {
        lines.push(line)
      }
      return lines
    }, [])
    .join("\n")
  text = text.replace(/[ \t]{2,}/g, " ")
  text = text.replace(/[ \t]+\n/g, "\n")
  text = text.replace(/\n{3,}/g, "\n\n")
  return text.trim()
}

function sectionBody(text: string, start: RegExp) {
  const stops =
    /^(experience|work experience|professional experience|employment|education|skills|projects|summary|certifications|awards)$/i
  const lines = text.split("\n")
  const index = lines.findIndex((line) => start.test(line.trim()))
  if (index < 0) {
    return ""
  }

  const body: string[] = []
  for (const line of lines.slice(index + 1)) {
    if (stops.test(line.trim()) && body.length > 0) {
      break
    }
    body.push(line)
  }
  return body.join("\n").trim()
}

function firstRole(text: string): WorkExperience | null {
  const body = sectionBody(
    text,
    /^(experience|work experience|professional experience|employment)$/i
  )
  const lines = body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
  const header = lines.find((line) => !/^(?:\d{4}|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\b/i.test(line))
  if (!header) {
    return null
  }

  const atMatch = header.match(/^(.+?)\s+(?:at|@)\s+(.+)$/i)
  const parts = header.split(/\s+[|•–—-]\s+/)
  const title = (atMatch?.[1] ?? parts[0] ?? "").trim()
  const company = (atMatch?.[2] ?? parts[1] ?? "")
    .replace(/\b(19|20)\d{2}.*$/, "")
    .replace(/[\s|•–—-]+$/, "")
    .trim()
  if (!title && !company) {
    return null
  }

  return {
    company,
    title,
    start_date: "",
    end_date: "",
    description: lines.slice(1, 4).join(" ")
  }
}

function firstSchool(text: string): Education | null {
  const body = sectionBody(text, /^education$/i)
  const lines = body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
  const school =
    lines.find((line) => /university|college|institute|school/i.test(line)) ?? ""
  const degree =
    lines.find((line) => /bachelor|master|ph\.?d|b\.s|m\.s|associate|diploma/i.test(line)) ?? ""
  if (!school && !degree) {
    return null
  }
  return { school, degree, field_of_study: "", gpa: "" }
}

function skillList(text: string) {
  const lines = text.split("\n")
  const index = lines.findIndex((line) => /^(technical\s+)?skills\b/i.test(line.trim()))
  if (index < 0) {
    return []
  }
  const inline = lines[index]?.split(":").slice(1).join(":") ?? ""
  const body = [inline, ...lines.slice(index + 1)]
    .join("\n")
    .split(/\n(?=experience|education|projects|summary|certifications|awards\b)/i)[0]
  return body
    .split(/[,•;\n]/)
    .map((skill) => skill.replace(/^skills\b:?/i, "").trim())
    .filter((skill) => skill.length > 1 && skill.length < 40)
    .slice(0, 12)
}

export function resumeFromText(text: string): ResumeProfile {
  const cleaned = cleanResumeText(text)
  const resume = emptyResume()
  const email = cleaned.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
  const phone = cleaned.match(/(?:\+?\d[\d().\-\s]{7,}\d)/)
  const linkedin = cleaned.match(/https?:\/\/(?:www\.)?linkedin\.com\/[^\s)]+/i)
  const lines = cleaned
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
  const head: string[] = []
  for (const line of lines) {
    if (/^(experience|education|skills|projects|summary)\b/i.test(line)) {
      break
    }
    head.push(line)
  }
  const name = head.find((line) => /^[A-Za-z][A-Za-z.'-]+(?:\s+[A-Za-z][A-Za-z.'-]+){1,2}$/.test(line))

  if (name) {
    const [first, ...rest] = name.split(/\s+/)
    resume.personal_info.first_name = first ?? ""
    resume.personal_info.last_name = rest.join(" ")
  }
  resume.personal_info.email = email?.[0] ?? ""
  resume.personal_info.phone = phone?.[0]?.replace(/\s+/g, " ").trim() ?? ""
  resume.personal_info.linkedin = linkedin?.[0] ?? ""
  const role = firstRole(cleaned)
  if (role) {
    resume.work_experience = [role]
  }
  const school = firstSchool(cleaned)
  if (school) {
    resume.education = [school]
  }
  resume.skills = skillList(cleaned)
  return resume
}

function textValue(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback
}

export function normalizeResume(value: unknown, fallback: ResumeProfile): ResumeProfile {
  if (typeof value !== "object" || value === null) {
    return fallback
  }

  const record = value as Record<string, unknown>
  const info =
    typeof record.personal_info === "object" && record.personal_info !== null
      ? (record.personal_info as Record<string, unknown>)
      : {}
  const resume = emptyResume()
  resume.personal_info = {
    first_name: textValue(info.first_name, fallback.personal_info.first_name),
    last_name: textValue(info.last_name, fallback.personal_info.last_name),
    email: textValue(info.email, fallback.personal_info.email),
    phone: textValue(info.phone, fallback.personal_info.phone),
    linkedin: textValue(info.linkedin, fallback.personal_info.linkedin),
    location: textValue(info.location, fallback.personal_info.location)
  }

  const work = Array.isArray(record.work_experience) ? record.work_experience : []
  const roles = work
    .map((item) => {
      if (typeof item !== "object" || item === null) {
        return null
      }
      const role = item as Record<string, unknown>
      const next: WorkExperience = {
        company: textValue(role.company, ""),
        title: textValue(role.title, ""),
        start_date: textValue(role.start_date, ""),
        end_date: textValue(role.end_date, ""),
        description: textValue(role.description, "")
      }
      return next.company || next.title ? next : null
    })
    .filter((item): item is WorkExperience => item !== null)
  resume.work_experience = roles.length > 0 ? roles : fallback.work_experience

  const schools = Array.isArray(record.education) ? record.education : []
  const education = schools
    .map((item) => {
      if (typeof item !== "object" || item === null) {
        return null
      }
      const school = item as Record<string, unknown>
      const next: Education = {
        school: textValue(school.school, ""),
        degree: textValue(school.degree, ""),
        field_of_study: textValue(school.field_of_study, ""),
        gpa: textValue(school.gpa, "")
      }
      return next.school || next.degree ? next : null
    })
    .filter((item): item is Education => item !== null)
  resume.education = education.length > 0 ? education : fallback.education

  const skills = Array.isArray(record.skills)
    ? record.skills.filter((skill): skill is string => typeof skill === "string" && skill.trim().length > 0)
    : []
  resume.skills = skills.length > 0 ? skills.slice(0, 20).map((skill) => skill.trim()) : fallback.skills
  resume.preferences = fallback.preferences
  return resume
}

export function isSensitiveQuestion(question: string) {
  return sensitiveQuestion.test(question)
}

function mentionedSkills(skills: string[], jobDescription: string) {
  const haystack = jobDescription.toLowerCase()
  return skills.filter((skill) => haystack.includes(skill.toLowerCase())).slice(0, 4)
}

export function draftAnswer(question: string, resume: ResumeProfile, jobDescription: string) {
  if (isSensitiveQuestion(question)) {
    return null
  }

  const job = resume.work_experience[0]
  const school = resume.education[0]
  const matched = mentionedSkills(resume.skills, jobDescription)
  const sentences: string[] = []

  if (job?.title && job.company) {
    sentences.push(`I have worked as ${job.title} at ${job.company}.`)
  } else if (job?.title || job?.company) {
    sentences.push(`My recent experience is ${job.title || job.company}.`)
  }

  if (matched.length > 0) {
    sentences.push(`That background lines up with ${matched.join(", ")} in this role.`)
  } else if (resume.skills.length > 0) {
    sentences.push(`My background includes ${resume.skills.slice(0, 5).join(", ")}.`)
  }

  if (school?.school) {
    sentences.push(`I studied at ${school.school}${school.degree ? ` (${school.degree})` : ""}.`)
  }

  if (sentences.length === 0) {
    return null
  }

  return sentences.join(" ")
}
