// TODO: Requires `npm install googleapis` before this module is usable at runtime.
// Run: npm install googleapis
// After install, replace this stub with the real implementation below.
//
// Real implementation (uncomment after install):
// ─────────────────────────────────────────────────────────────────────────────
// import { google } from 'googleapis'
// import type { SheetsClient } from './types'
//
// let _client: SheetsClient | null = null
//
// export function getSheetsClient(): SheetsClient {
//   if (typeof window !== 'undefined') {
//     throw new Error('getSheetsClient must only be called from server-side code.')
//   }
//   if (_client) return _client
//
//   const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
//   const keyRaw = process.env.GOOGLE_PRIVATE_KEY
//   if (!email || !keyRaw) {
//     throw new Error('Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY env vars.')
//   }
//
//   const key = keyRaw.replace(/\\n/g, '\n')
//   const auth = new google.auth.JWT({
//     email,
//     key,
//     scopes: ['https://www.googleapis.com/auth/spreadsheets'],
//   })
//
//   _client = google.sheets({ version: 'v4', auth })
//   return _client
// }
// ─────────────────────────────────────────────────────────────────────────────

import type { SheetsClient } from "./types"

let _client: SheetsClient | null = null

export function getSheetsClient(): SheetsClient {
  if (typeof window !== "undefined") {
    throw new Error("getSheetsClient must only be called from server-side code.")
  }
  if (_client) return _client

  // Attempt to load googleapis at runtime — fails gracefully with a clear message.
  let googleModule: { google?: { auth: { JWT: unknown }; sheets: (o: unknown) => SheetsClient } }
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    googleModule = require("googleapis")
  } catch {
    throw new Error("googleapis package is not installed. Run: npm install googleapis")
  }

  const google = googleModule.google
  if (!google) throw new Error("googleapis module did not export `google`.")

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const keyRaw = process.env.GOOGLE_PRIVATE_KEY
  if (!email || !keyRaw) {
    throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_EMAIL or GOOGLE_PRIVATE_KEY env vars.")
  }

  const key = keyRaw.replace(/\\n/g, "\n")
  const auth = new (google.auth.JWT as new (opts: object) => unknown)({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  })

  _client = google.sheets({ version: "v4", auth }) as SheetsClient
  return _client
}

// Reset the memoized client — useful in tests to re-initialize with different env.
export function resetSheetsClient(): void {
  _client = null
}
