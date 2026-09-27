export function AutoFillButton({
  busy,
  onClick
}: {
  busy: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className="min-h-11 w-full rounded-lg bg-zinc-900 px-3 text-sm font-medium text-white disabled:opacity-60"
      disabled={busy}
      onClick={onClick}
    >
      {busy ? "Filling the Workday form..." : "Fill this Workday application"}
    </button>
  )
}
