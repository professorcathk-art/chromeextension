"use client"

import { useActionState, useState } from "react"
import { saveProfile } from "@/lib/actions/profile"
import { SubmitButton } from "@/components/submit-button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { initialActionState } from "@/types"

export function ProfileForm({
  email,
  fullName,
  phone,
  location,
  headline,
}: {
  email: string
  fullName: string
  phone: string
  location: string
  headline: string
}) {
  const [state, formAction] = useActionState(saveProfile, initialActionState)
  const [name, setName] = useState(fullName)
  const [phoneNumber, setPhoneNumber] = useState(phone)
  const [place, setPlace] = useState(location)
  const [summary, setSummary] = useState(headline)

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {state.status === "error" ? (
        <Alert variant="destructive">
          <AlertTitle>Couldn&apos;t save your details</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
      {state.status === "success" ? (
        <Alert>
          <AlertTitle>Saved</AlertTitle>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
      <div className="flex flex-col gap-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={email || "Not signed in"} readOnly className="min-h-11" />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="fullName">Name</Label>
        <Input
          id="fullName"
          name="fullName"
          value={name}
          onChange={(event) => setName(event.target.value)}
          required
          autoComplete="name"
          className="min-h-11"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          name="phone"
          value={phoneNumber}
          onChange={(event) => setPhoneNumber(event.target.value)}
          autoComplete="tel"
          className="min-h-11"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          name="location"
          value={place}
          onChange={(event) => setPlace(event.target.value)}
          autoComplete="address-level2"
          className="min-h-11"
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="headline">Short summary</Label>
        <Input
          id="headline"
          name="headline"
          value={summary}
          onChange={(event) => setSummary(event.target.value)}
          className="min-h-11"
          placeholder="What you want employers to see first"
        />
      </div>
      <SubmitButton pendingLabel="Saving...">Save details</SubmitButton>
    </form>
  )
}
