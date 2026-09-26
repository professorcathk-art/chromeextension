"use client"

import { useActionState, useState } from "react"
import { createApplication } from "@/lib/actions/applications"
import { SubmitButton } from "@/components/submit-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { initialActionState } from "@/types"

export function NewApplicationForm() {
  const [state, formAction] = useActionState(createApplication, initialActionState)
  const [title, setTitle] = useState("")
  const [company, setCompany] = useState("")
  const [jobUrl, setJobUrl] = useState("")

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.status === "error" ? (
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t save this application</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
      <div className="flex flex-col gap-2">
        <Label htmlFor="title">Job title</Label>
        <Input
          id="title"
          name="title"
          required
          className="min-h-11"
          placeholder="Product designer"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="company">Company</Label>
        <Input
          id="company"
          name="company"
          className="min-h-11"
          placeholder="Optional"
          value={company}
          onChange={(event) => setCompany(event.target.value)}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="jobUrl">Link to the job</Label>
        <Input
          id="jobUrl"
          name="jobUrl"
          type="url"
          inputMode="url"
          className="min-h-11"
          placeholder="https://"
          value={jobUrl}
          onChange={(event) => setJobUrl(event.target.value)}
        />
      </div>
      <SubmitButton pendingLabel="Saving...">Save application</SubmitButton>
    </form>
  )
}
