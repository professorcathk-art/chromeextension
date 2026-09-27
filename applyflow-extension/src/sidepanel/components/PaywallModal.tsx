export function PaywallModal({
  usageCount,
  busy,
  error,
  onClose,
  onUpgrade
}: {
  usageCount: number
  busy: boolean
  error: string | null
  onClose: () => void
  onUpgrade: () => void
}) {
  return (
    <div className="fixed inset-0 z-10 flex items-end bg-black/40 p-3">
      <div className="w-full rounded-xl bg-white p-4 shadow-lg" role="dialog" aria-labelledby="paywall-title">
        <h2 id="paywall-title" className="text-base font-semibold">
          Free tier reached
        </h2>
        <p className="mt-2 text-sm text-zinc-600">
          You have used {usageCount} free applications. Upgrade to Pro for unlimited applications at $14.99 a month.
        </p>
        {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}
        <div className="mt-4 flex flex-col gap-2">
          <button type="button" className="min-h-11 rounded-lg bg-zinc-900 px-3 text-sm font-medium text-white disabled:opacity-60" disabled={busy} onClick={onUpgrade}>
            {busy ? "Opening checkout..." : "Upgrade"}
          </button>
          <button type="button" className="min-h-11 rounded-lg border border-zinc-300 px-3 text-sm" onClick={onClose}>
            Not now
          </button>
        </div>
      </div>
    </div>
  )
}
