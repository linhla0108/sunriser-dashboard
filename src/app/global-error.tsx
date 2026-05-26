"use client"

import { useEffect } from "react"
import { RefreshCw } from "lucide-react"

interface GlobalErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

/**
 * Root-level error boundary. Replaces the root layout when the root itself
 * crashes — must include <html> and <body> tags.
 */
export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error("[GlobalError]", error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#f9f9f9", fontFamily: "system-ui, sans-serif" }}>
        <main
          style={{
            display: "grid",
            placeItems: "center",
            minHeight: "100dvh",
            padding: "1rem",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "28rem",
              borderRadius: "1.5rem",
              border: "1px solid rgba(0,0,0,0.08)",
              background: "#fff",
              padding: "2rem",
              textAlign: "center",
              boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
            }}
          >
            <h1 style={{ fontSize: "1.25rem", fontWeight: 600, color: "#1b1b1b", margin: "0 0 0.75rem" }}>
              Something went wrong
            </h1>
            <p style={{ fontSize: "0.875rem", color: "#555", lineHeight: 1.6, margin: "0 0 1.5rem" }}>
              A critical error occurred. Please refresh the page.
            </p>
            {error.digest ? (
              <p style={{ fontSize: "0.75rem", color: "#888", fontFamily: "monospace", marginBottom: "1rem" }}>
                ref: {error.digest}
              </p>
            ) : null}
            <button
              onClick={reset}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                width: "100%",
                justifyContent: "center",
                padding: "0.625rem 1rem",
                borderRadius: "0.5rem",
                border: "none",
                background: "#FF5533",
                color: "#fff",
                fontSize: "0.875rem",
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              <RefreshCw size={16} />
              Refresh page
            </button>
          </div>
        </main>
      </body>
    </html>
  )
}
