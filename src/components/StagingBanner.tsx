// Default staging indicator — customize the message per project.
// Controlled by NEXT_PUBLIC_APP_ENV=staging (set in Vercel's Preview
// environment). Uses --staging-header-bg, an environment status color kept
// deliberately far from the brand ramp so staging is unmistakable.
export function StagingBanner() {
  if (process.env.NEXT_PUBLIC_APP_ENV !== "staging") return null;

  return (
    <div
      style={{
        width: "100%",
        background: "var(--staging-header-bg)",
        color: "var(--on-primary)",
        textAlign: "center",
        fontSize: "var(--fs-label)",
        fontWeight: 600,
        letterSpacing: "0.05em",
        padding: "var(--s1) 0",
      }}
    >
      STAGING ENVIRONMENT
    </div>
  );
}
