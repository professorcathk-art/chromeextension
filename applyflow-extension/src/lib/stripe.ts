import { getSupabase } from "./supabase"

export async function openProCheckout() {
  const supabase = getSupabase()
  if (!supabase) {
    return "Connect the database before upgrading."
  }

  const { data, error } = await supabase.functions.invoke("create-checkout", {
    body: {}
  })

  if (error || typeof data !== "object" || data === null) {
    return "The upgrade page could not be opened."
  }

  const url = (data as { url?: unknown }).url
  if (typeof url !== "string" || !url.startsWith("https://")) {
    return "The upgrade page could not be opened."
  }

  await chrome.tabs.create({ url })
  return null
}
