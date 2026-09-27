import type { SubscriptionStatus } from "~/lib/types"

export function Settings({
  email,
  status,
  openToRecruiters,
  onEmail,
  onRecruiters,
  onSignIn,
  signingIn,
  authMessage
}: {
  email: string
  status: SubscriptionStatus
  openToRecruiters: boolean
  onEmail: (email: string) => void
  onRecruiters: (value: boolean) => void
  onSignIn: () => void
  signingIn: boolean
  authMessage: string | null
}) {
  return (
    <section className="flex flex-col gap-3 border-t border-zinc-200 pt-4">
      <h2 className="text-sm font-medium">Account</h2>
      <p className="text-sm text-zinc-600">Plan: {status === "pro" ? "Pro" : "Free"}</p>
      <label className="flex flex-col gap-1 text-sm">
        Email
        <input
          className="min-h-11 rounded-lg border border-zinc-300 px-3"
          type="email"
          value={email}
          onChange={(event) => onEmail(event.target.value)}
        />
      </label>
      <label className="flex min-h-11 items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={openToRecruiters}
          onChange={(event) => onRecruiters(event.target.checked)}
        />
        Open to recruiters
      </label>
      {authMessage ? <p className="text-sm text-zinc-600">{authMessage}</p> : null}
      <button type="button" className="min-h-11 rounded-lg border border-zinc-300 px-3 text-sm" disabled={signingIn} onClick={onSignIn}>
        {signingIn ? "Signing in..." : "Sign in"}
      </button>
    </section>
  )
}
