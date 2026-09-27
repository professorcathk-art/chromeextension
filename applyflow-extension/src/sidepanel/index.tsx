import { useEffect, useState } from "react"

import type { StartFillResponse } from "~/background"
import { openProCheckout } from "~/lib/stripe"
import { readState, writeState } from "~/lib/storage"
import { getSupabase } from "~/lib/supabase"
import { FREE_FILL_LIMIT, emptyResume, type ResumeProfile } from "~/lib/types"

import { AutoFillButton } from "./components/AutoFillButton"
import { PaywallModal } from "./components/PaywallModal"
import { ResumeUploader } from "./components/ResumeUploader"
import { Settings } from "./components/Settings"

export function SidePanel() {
  const [resume, setResume] = useState<ResumeProfile>(emptyResume())
  const [usageCount, setUsageCount] = useState(0)
  const [status, setStatus] = useState<"free" | "pro" | "cancelled">("free")
  const [email, setEmail] = useState("")
  const [ready, setReady] = useState(false)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [paywall, setPaywall] = useState(false)
  const [upgradeError, setUpgradeError] = useState<string | null>(null)
  const [upgrading, setUpgrading] = useState(false)
  const [signingIn, setSigningIn] = useState(false)
  const [authMessage, setAuthMessage] = useState<string | null>(null)

  useEffect(() => {
    void readState().then((state) => {
      setResume(state.resume)
      setUsageCount(state.usageCount)
      setStatus(state.subscriptionStatus)
      setEmail(state.email || state.resume.personal_info.email)
      setReady(true)
    })
  }, [])

  useEffect(() => {
    if (!ready) {
      return
    }
    void writeState({
      resume: {
        ...resume,
        preferences: { ...resume.preferences, open_to_recruiters: resume.preferences.open_to_recruiters }
      },
      usageCount,
      subscriptionStatus: status,
      email
    })
  }, [ready, resume, usageCount, status, email])

  async function fill() {
    setBusy(true)
    setMessage(null)
    const response = (await chrome.runtime.sendMessage({ type: "START_FILL" })) as StartFillResponse
    setBusy(false)
    if (!response?.ok) {
      if (response?.reason === "paywall") {
        setPaywall(true)
      }
      setMessage(response?.message ?? "The form could not be filled.")
      return
    }
    setUsageCount(response.usageCount)
    const count = response.result.filled.length
    setMessage(count > 0 ? `Filled ${count} fields. Review the page, then submit it yourself.` : "No matching Workday fields were found on this page.")
  }

  async function upgrade() {
    setUpgrading(true)
    setUpgradeError(null)
    const error = await openProCheckout()
    setUpgrading(false)
    if (error) {
      setUpgradeError(error)
    }
  }

  async function signIn() {
    const supabase = getSupabase()
    if (!supabase) {
      setAuthMessage("Add the database keys to connect your account.")
      return
    }
    const password = window.prompt("Password for this email")
    if (!password) {
      return
    }
    setSigningIn(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setSigningIn(false)
    setAuthMessage(error ? "That email and password did not match." : "Signed in.")
  }

  const remaining = Math.max(FREE_FILL_LIMIT - usageCount, 0)

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-4 p-4">
      <header>
        <h1 className="text-lg font-semibold">ApplyFlow</h1>
        <p className="text-sm text-zinc-600">
          {status === "pro" ? "Pro plan" : `${remaining} free fills left`}
        </p>
      </header>
      {!ready ? <p className="text-sm text-zinc-600">Loading your details...</p> : null}
      <ResumeUploader resume={resume} onChange={setResume} />
      <AutoFillButton busy={busy} onClick={() => void fill()} />
      {message ? <p className="text-sm text-zinc-700">{message}</p> : null}
      <Settings
        email={email}
        status={status}
        openToRecruiters={resume.preferences.open_to_recruiters}
        onEmail={setEmail}
        onRecruiters={(openToRecruiters) =>
          setResume({ ...resume, preferences: { ...resume.preferences, open_to_recruiters: openToRecruiters } })
        }
        onSignIn={() => void signIn()}
        signingIn={signingIn}
        authMessage={authMessage}
      />
      {paywall ? (
        <PaywallModal
          usageCount={usageCount}
          busy={upgrading}
          error={upgradeError}
          onClose={() => setPaywall(false)}
          onUpgrade={() => void upgrade()}
        />
      ) : null}
    </main>
  )
}
