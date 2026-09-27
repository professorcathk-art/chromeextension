"use client"

import { useEffect, useState, type FormEvent } from "react"
import Link from "next/link"
import { parseFillApiResponse, parseUserApiResponse } from "@/lib/fill"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import type { FilledApplication, SavedDetails } from "@/types/api"

const emptyDetails: SavedDetails = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  headline: "",
}

const resultRows: { key: keyof FilledApplication; label: string }[] = [
  { key: "fullName", label: "Name" },
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "location", label: "Location" },
  { key: "headline", label: "Short summary" },
  { key: "title", label: "Job title" },
  { key: "company", label: "Company" },
  { key: "jobUrl", label: "Job link" },
]

export function ApplicationForm() {
  const [loading, setLoading] = useState(true)
  const [loadMessage, setLoadMessage] = useState<string | null>(null)
  const [needsSignIn, setNeedsSignIn] = useState(false)
  const [hasSavedDetails, setHasSavedDetails] = useState(false)
  const [details, setDetails] = useState<SavedDetails>(emptyDetails)
  const [title, setTitle] = useState("")
  const [company, setCompany] = useState("")
  const [jobUrl, setJobUrl] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [filled, setFilled] = useState<FilledApplication | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadDetails() {
      try {
        const response = await fetch("/api/user")
        const body: unknown = await response.json()
        const parsed = parseUserApiResponse(body)
        if (cancelled) {
          return
        }
        if (!parsed) {
          setLoadMessage("We couldn't load your details.")
          return
        }
        if (parsed.status === "ok") {
          setDetails(parsed.profile)
          setHasSavedDetails(parsed.hasSavedDetails)
          return
        }
        setNeedsSignIn(parsed.status === "signed_out")
        setLoadMessage(parsed.message)
      } catch {
        if (!cancelled) {
          setLoadMessage("We couldn't load your details.")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadDetails()
    return () => {
      cancelled = true
    }
  }, [])

  function updateDetail(key: keyof SavedDetails, value: string) {
    setDetails((current) => ({ ...current, [key]: value }))
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setFilled(null)

    try {
      const response = await fetch("/api/application", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...details, title, company, jobUrl }),
      })
      const body: unknown = await response.json()
      const parsed = parseFillApiResponse(body)
      if (!parsed) {
        setError("We couldn't save that application. Try again.")
        return
      }
      if (parsed.status === "ok") {
        setFilled(parsed.filled)
        return
      }
      setError(parsed.message)
    } catch {
      setError("We couldn't save that application. Try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3" aria-busy="true">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-2/3" />
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      {loadMessage ? (
        <Alert>
          <AlertTitle>Saved details aren't available</AlertTitle>
          <AlertDescription>
            {loadMessage}{" "}
            {needsSignIn ? (
              <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
                Sign in
              </Link>
            ) : null}
          </AlertDescription>
        </Alert>
      ) : null}
      {!loadMessage && !hasSavedDetails ? (
        <Alert>
          <AlertTitle>No saved details yet</AlertTitle>
          <AlertDescription>
            Type them here, or add them in Settings. Next time they can fill this form for you.
          </AlertDescription>
        </Alert>
      ) : null}
      {error ? (
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t save this application</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
      {filled ? (
        <div data-result className="rounded-lg border bg-muted/40 p-4">
          <h2 className="text-base font-medium">Application filled</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            These are the answers saved for this job.
          </p>
          <dl className="mt-3 grid gap-2 text-sm">
            {resultRows.map((row) =>
              filled[row.key] ? (
                <div key={row.key} className="grid grid-cols-1 gap-0.5 sm:grid-cols-[8rem_1fr]">
                  <dt className="text-muted-foreground">{row.label}</dt>
                  <dd>{filled[row.key]}</dd>
                </div>
              ) : null,
            )}
          </dl>
        </div>
      ) : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Name" id="fullName" value={details.fullName} onChange={(value) => updateDetail("fullName", value)} autoComplete="name" />
        <Field label="Email" id="email" type="email" value={details.email} onChange={(value) => updateDetail("email", value)} autoComplete="email" />
        <Field label="Phone" id="phone" value={details.phone} onChange={(value) => updateDetail("phone", value)} autoComplete="tel" />
        <Field label="Location" id="location" value={details.location} onChange={(value) => updateDetail("location", value)} autoComplete="address-level2" />
      </div>
      <Field label="Short summary" id="headline" value={details.headline} onChange={(value) => updateDetail("headline", value)} />
      <Field label="Job title" id="title" value={title} onChange={setTitle} required placeholder="Product designer" />
      <Field label="Company" id="company" value={company} onChange={setCompany} placeholder="Optional" />
      <Field label="Link to the job" id="jobUrl" type="url" value={jobUrl} onChange={setJobUrl} placeholder="https://" />
      <Button type="submit" className="min-h-11" disabled={saving} aria-busy={saving}>
        {saving ? "Filling application..." : "Fill application"}
      </Button>
    </form>
  )
}

function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
  autoComplete,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: string
  required?: boolean
  placeholder?: string
  autoComplete?: string
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="min-h-11"
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
