import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import SignOutButton from "@/components/SignOutButton";
import ThemeToggle from "@/components/ThemeToggle";

// Minimal starter page — replace with the project's real first screen.
// Everything here draws from the design tokens in globals.css: no
// hardcoded colors, sizes, or spacing anywhere in src/.
export default function Home() {
  return (
    <main className="page">
      <div style={{ display: "flex", alignItems: "baseline" }}>
        <h1>New Project</h1>
        <span className="spacer" />
        <SignOutButton />
      </div>
      <p className="page-subtitle">
        A blank starting point wired to the design system.
      </p>

      <div className="stack">
        <div className="card">
          <h2>Getting started</h2>
          <p style={{ marginBottom: "var(--s4)" }}>
            Edit <code>src/app/page.tsx</code> to build the first screen. The
            component kit lives in <code>src/components/ui</code>; the design
            tokens live at the top of <code>src/app/globals.css</code>.
          </p>
          <Button variant="primary">Get started</Button>
        </div>

        <EmptyState
          scope="page"
          message="Nothing has been built yet"
          hint="This empty state comes from the ui kit — replace this page when the first feature lands."
        />

        <ThemeToggle />
      </div>
    </main>
  );
}
