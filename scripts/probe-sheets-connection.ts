// Probe script: verify Sheets API connection using service account credentials.
// Run with: npx tsx scripts/probe-sheets-connection.ts
// Requires: .env.local with GOOGLE_* vars set.

import * as dotenv from "dotenv"
import * as path from "path"

dotenv.config({ path: path.join(process.cwd(), ".env.local") })

async function main() {
  const { getSheetsClient } = await import("../src/lib/sheets/client")
  const spreadsheetId = process.env.SHEETS_CANDIDATES_SPREADSHEET_ID

  if (!spreadsheetId) {
    console.error("❌ SHEETS_CANDIDATES_SPREADSHEET_ID not set in .env.local")
    process.exit(1)
  }

  try {
    const sheets = getSheetsClient()
    const res = await sheets.spreadsheets.get({
      spreadsheetId,
      fields: "properties.title",
    })
    console.log("✅ Connected to sheet:", res.data.properties?.title)
  } catch (err) {
    console.error("❌ Connection failed:", err instanceof Error ? err.message : err)
    process.exit(1)
  }
}

void main()
