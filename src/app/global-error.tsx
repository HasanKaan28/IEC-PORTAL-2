"use client";

import React from "react";

/** Replaces the root layout, so there is no locale provider here: both languages are shown. */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="tr">
      <body style={{ margin: 0, minHeight: "100vh", background: "#0c0810", color: "#fff", fontFamily: "system-ui, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <main style={{ maxWidth: 420, textAlign: "center" }}>
          <h1 style={{ fontSize: 24, margin: "0 0 8px" }}>Bir şeyler ters gitti</h1>
          <p lang="en" style={{ fontSize: 16, margin: "0 0 16px", color: "#a99fb4" }}>Something went wrong</p>
          <p style={{ fontSize: 14, color: "#a99fb4", lineHeight: 1.6 }}>
            Sayfayı yenilemeyi dene. / Please try reloading the page.
          </p>
          <button
            type="button"
            onClick={() => reset()}
            style={{ marginTop: 16, padding: "10px 20px", borderRadius: 12, border: 0, background: "#b8237f", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
          >
            Tekrar dene / Try again
          </button>
        </main>
      </body>
    </html>
  );
}
