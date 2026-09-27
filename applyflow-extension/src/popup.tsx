import "~/style.css"

export default function IndexPopup() {
  return (
    <main className="w-64 p-4">
      <h1 className="text-base font-semibold">ApplyFlow</h1>
      <p className="mt-2 text-sm text-zinc-600">Open the side panel to fill a Workday application.</p>
      <button
        type="button"
        className="mt-3 min-h-11 w-full rounded-lg bg-zinc-900 px-3 text-sm font-medium text-white"
        onClick={() => void chrome.sidePanel.open({ windowId: chrome.windows.WINDOW_ID_CURRENT })}
      >
        Open side panel
      </button>
    </main>
  )
}
