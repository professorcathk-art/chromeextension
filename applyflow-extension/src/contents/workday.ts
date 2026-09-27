import type { PlasmoCSConfig } from "plasmo"

import { registerWorkdayContent } from "../content"

export const config: PlasmoCSConfig = {
  matches: [
    "https://*.myworkday.com/*",
    "https://*.myworkdayjobs.com/*",
    "https://*.workday.com/*"
  ],
  run_at: "document_idle"
}

registerWorkdayContent()
