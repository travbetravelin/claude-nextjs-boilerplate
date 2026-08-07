// The pre-auth page frame, shared by /login and /reset: standard .page
// shell (no nav — there's no session to hang one on), app name centered,
// STAGE badge when this deployment is the staging environment (a logged-out
// visitor has no header to read the environment from, so the login screen
// has to say it itself).

export default function LoginShell({ children }: { children: React.ReactNode }) {
  const isStaging = process.env.NEXT_PUBLIC_APP_ENV === "staging";
  return (
    <main className="page" data-density="field">
      {/* .page provides 40px/24px vertical padding, hence the offset in
          the min-height. */}
      <div
        style={{
          minHeight: "calc(100vh - 80px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div style={{ textAlign: "center", marginBottom: "var(--s6)" }}>
            {/* Replace with the client's logo on rebrand — keep the STAGE
                badge either way. */}
            <h1 style={{ marginBottom: 0 }}>New Project</h1>
            {isStaging && (
              <div style={{ marginTop: "var(--s2)" }}>
                <span
                  className="badge"
                  style={{
                    background: "var(--staging-header-bg)",
                    color: "var(--on-primary)",
                  }}
                >
                  STAGE
                </span>
              </div>
            )}
          </div>
          {children}
        </div>
      </div>
    </main>
  );
}
