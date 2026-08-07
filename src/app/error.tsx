"use client";

// Route-level error boundary: any render/data error below the root layout
// lands here instead of a blank screen or a raw stack trace.

import Button from "@/components/ui/Button";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="page">
      <div className="card" style={{ maxWidth: 480, margin: "var(--s7) auto" }}>
        <h2 style={{ marginBottom: "var(--s2)" }}>Something went wrong</h2>
        <p style={{ color: "var(--muted)", marginBottom: "var(--s4)" }}>
          The page hit an error it couldn&apos;t recover from. Try again — if it keeps happening,
          note what you were doing and report it.
        </p>
        <div style={{ display: "flex", gap: "var(--s2)" }}>
          <Button variant="primary" onClick={reset}>
            Try again
          </Button>
          <Button variant="secondary" onClick={() => (window.location.href = "/")}>
            Back to home
          </Button>
        </div>
      </div>
    </main>
  );
}
