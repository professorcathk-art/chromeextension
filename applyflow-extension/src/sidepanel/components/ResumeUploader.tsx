import { useState } from "react"

import { parseResumeText } from "~/lib/ai-agent"
import { normalizeResume } from "~/lib/resume-format"
import { resumeFromText, readResumeFile } from "~/lib/resume-text"
import type { ResumeProfile } from "~/lib/types"

export function ResumeUploader({
  resume,
  onChange,
  onText
}: {
  resume: ResumeProfile
  onChange: (resume: ResumeProfile) => void
  onText: (text: string) => void
}) {
  const [error, setError] = useState<string | null>(null)
  const [note, setNote] = useState<string | null>(null)
  const info = resume.personal_info

  function update(field: keyof ResumeProfile["personal_info"], value: string) {
    onChange({
      ...resume,
      personal_info: { ...info, [field]: value }
    })
  }

  async function onFile(file: File | undefined) {
    if (!file) {
      return
    }
    setError(null)
    setNote(null)
    try {
      const text = await readResumeFile(file)
      const local = resumeFromText(text)
      local.preferences.open_to_recruiters = resume.preferences.open_to_recruiters
      const polished = await parseResumeText(text)
      const next = normalizeResume(polished, local)
      next.preferences.open_to_recruiters = resume.preferences.open_to_recruiters
      onText(text.slice(0, 20000))
      onChange(next)
      setNote(
        polished
          ? "Resume read and cleaned. Check the details below. They stay saved on this computer."
          : "Resume read on this computer and saved. Check the details below."
      )
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "That file could not be read.")
    }
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-sm font-medium">Your details</h2>
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      {note ? <p className="text-sm text-zinc-600">{note}</p> : null}
      <label className="flex min-h-11 cursor-pointer items-center justify-center rounded-lg border border-dashed border-zinc-300 bg-white px-3 text-sm">
        Upload a PDF, Word, or text resume
        <input
          className="sr-only"
          type="file"
          accept=".pdf,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain"
          onChange={(event) => void onFile(event.target.files?.[0])}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        First name
        <input className="min-h-11 rounded-lg border border-zinc-300 px-3" value={info.first_name} onChange={(event) => update("first_name", event.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Last name
        <input className="min-h-11 rounded-lg border border-zinc-300 px-3" value={info.last_name} onChange={(event) => update("last_name", event.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Email
        <input className="min-h-11 rounded-lg border border-zinc-300 px-3" type="email" value={info.email} onChange={(event) => update("email", event.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Phone
        <input className="min-h-11 rounded-lg border border-zinc-300 px-3" value={info.phone} onChange={(event) => update("phone", event.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        City
        <input className="min-h-11 rounded-lg border border-zinc-300 px-3" value={info.location} onChange={(event) => update("location", event.target.value)} />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        LinkedIn
        <input className="min-h-11 rounded-lg border border-zinc-300 px-3" value={info.linkedin} onChange={(event) => update("linkedin", event.target.value)} />
      </label>
    </section>
  )
}
