import Link from "next/link";
import SignOutButton from "@/components/SignOutButton";
import ThemeToggle from "@/components/ThemeToggle";
import { createClient } from "@/lib/supabase/server";
import GuidesTabs from "@/components/guides/GuidesTabs";
import DesignSystemGuide from "@/components/guides/DesignSystemGuide";
import ArchitectureGuide from "@/components/guides/ArchitectureGuide";
import ClaudeWorkflowGuide from "@/components/guides/ClaudeWorkflowGuide";

// Public landing page: the three in-app guides, readable without signing
// in (middleware already treats "/" as public). The header swaps between
// "Sign in" and SignOutButton based on the server-side session, which is
// why this page is a server component and renders dynamically.
export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="page-wide">
      <div style={{ display: "flex", alignItems: "baseline" }}>
        <h1>New Project</h1>
        <span className="spacer" />
        {user ? (
          <SignOutButton />
        ) : (
          <Link href="/login" className="btn btn-primary">
            Sign in
          </Link>
        )}
      </div>
      <p className="page-subtitle">
        Reference for anyone requesting or making a change to this app — what
        already exists, how the pieces fit together, and how to work with
        Claude on it.
      </p>

      <GuidesTabs
        designSystemTab={<DesignSystemGuide />}
        architectureTab={<ArchitectureGuide />}
        claudeWorkflowTab={<ClaudeWorkflowGuide />}
      />

      <div style={{ marginTop: "var(--s5)" }}>
        <ThemeToggle />
      </div>
    </main>
  );
}
