"use client";

// Where the password-reset email lands: the recovery link signs the visitor
// in with a temporary session, and this page sets the new password against
// it. Same centered card as /login. Personal-auth write, so it stays on the
// browser client.

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Field from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import LoginShell from "../login/LoginShell";

type State = "checking" | "ready" | "invalid";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [state, setState] = useState<State>("checking");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  // The recovery link arrives with a code the browser client exchanges on
  // load (detectSessionInUrl). That exchange races this component's mount,
  // so listen for the session rather than checking once — and only give up
  // after a grace period, or a slow exchange would read as an expired link.
  useEffect(() => {
    const supabase = createClient();
    let settled = false;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session && !settled) {
        settled = true;
        setState("ready");
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session && !settled) {
        settled = true;
        setState("ready");
      }
    });
    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        setState("invalid");
      }
    }, 3000);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Those passwords don't match.");
      return;
    }
    setSaving(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) {
      setError(
        err.message.includes("different from the old")
          ? "New password must be different from the old one."
          : "Couldn't save the new password. The link may have expired — request a new one from the sign-in page.",
      );
      setSaving(false);
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <LoginShell>
      <div className="card">
        {state === "checking" && (
          <p style={{ color: "var(--muted)", margin: 0 }}>Checking your reset link…</p>
        )}

        {state === "invalid" && (
          <>
            <h2 style={{ marginBottom: "var(--s2)" }}>This link didn&apos;t work</h2>
            <p style={{ color: "var(--muted)", marginBottom: "var(--s4)" }}>
              It may have expired or already been used. Request a fresh one from the sign-in page —
              the links are single-use.
            </p>
            <Button variant="primary" onClick={() => router.push("/login")} style={{ width: "100%" }}>
              Back to sign in
            </Button>
          </>
        )}

        {state === "ready" && (
          <>
            <h2 style={{ marginBottom: "var(--s2)" }}>Set a new password</h2>
            <p style={{ color: "var(--muted)", marginBottom: "var(--s4)" }}>
              At least 8 characters. You&apos;ll be signed in on this device once it&apos;s saved.
            </p>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSave}>
              <Field label="New password" htmlFor="new-password">
                <input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </Field>
              <Field label="Confirm new password" htmlFor="confirm-password">
                <input
                  id="confirm-password"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </Field>
              <Button
                variant="primary"
                type="submit"
                busy={saving && "Saving…"}
                style={{ width: "100%", marginTop: "var(--s2)" }}
              >
                Save new password
              </Button>
            </form>
          </>
        )}
      </div>
    </LoginShell>
  );
}
