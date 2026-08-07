"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Field from "@/components/ui/Field";
import Button from "@/components/ui/Button";
import LoginShell from "./LoginShell";

// A user should never read a raw provider string — every auth error maps to
// a plain sentence, keyed on the error code, not on matching message text.
// A banned login (what deactivating a user actually does) gets its own card
// below, not an error line.
function friendlyAuthError(err: { code?: string }): { banned: boolean; text: string } {
  switch (err.code) {
    case "user_banned":
      return { banned: true, text: "" };
    case "invalid_credentials":
      return { banned: false, text: "That email and password don't match. Check both and try again." };
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return { banned: false, text: "Too many attempts — wait a minute and try again." };
    case "validation_failed":
      return { banned: false, text: "Enter your email and password to sign in." };
    default:
      return { banned: false, text: "Couldn't sign you in. Check your connection and try again." };
  }
}

type Mode = "signin" | "forgot" | "sent";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [deactivated, setDeactivated] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setDeactivated(false);

    const supabase = createClient();
    const { error: err } = await supabase.auth.signInWithPassword({ email, password });

    if (err) {
      const friendly = friendlyAuthError(err);
      setDeactivated(friendly.banned);
      setError(friendly.text);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset`,
    });
    setLoading(false);
    if (err) {
      setError(friendlyAuthError(err).text || "Couldn't send the reset email. Try again in a minute.");
      return;
    }
    setMode("sent");
  }

  return (
    <LoginShell>
      <div className="card">
        {mode === "signin" && (
          <>
            <h2 style={{ marginBottom: "var(--s5)" }}>Sign in</h2>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleLogin}>
              <Field label="Email" htmlFor="email">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </Field>

              <Field
                htmlFor="password"
                label={
                  <span style={{ display: "flex", alignItems: "baseline" }}>
                    Password
                    <span className="spacer" />
                    <button
                      type="button"
                      className="btn-link"
                      style={{ fontWeight: 400 }}
                      onClick={() => {
                        setMode("forgot");
                        setError("");
                        setDeactivated(false);
                      }}
                    >
                      Forgot?
                    </button>
                  </span>
                }
              >
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </Field>

              <Button
                variant="primary"
                type="submit"
                busy={loading && "Signing in…"}
                style={{ width: "100%", marginTop: "var(--s2)" }}
              >
                Sign in
              </Button>
            </form>
          </>
        )}

        {mode === "forgot" && (
          <>
            <h2 style={{ marginBottom: "var(--s2)" }}>Reset your password</h2>
            <p style={{ color: "var(--muted)", marginBottom: "var(--s4)" }}>
              We&apos;ll email you a link that signs you in here to set a new one.
            </p>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleForgot}>
              <Field label="Email" htmlFor="reset-email">
                <input
                  id="reset-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </Field>
              <Button
                variant="primary"
                type="submit"
                busy={loading && "Sending…"}
                style={{ width: "100%", marginTop: "var(--s2)" }}
              >
                Email me a reset link
              </Button>
            </form>
            <button
              type="button"
              className="btn-link"
              style={{ marginTop: "var(--s4)" }}
              onClick={() => {
                setMode("signin");
                setError("");
              }}
            >
              ‹ Back to sign in
            </button>
          </>
        )}

        {mode === "sent" && (
          <>
            <h2 style={{ marginBottom: "var(--s2)" }}>Check your email</h2>
            <p style={{ color: "var(--muted)", marginBottom: "var(--s1)" }}>
              If <strong>{email}</strong> has an account, a reset link is on its way. The link signs
              you in here to set a new password.
            </p>
            <button
              type="button"
              className="btn-link"
              style={{ marginTop: "var(--s4)" }}
              onClick={() => {
                setMode("signin");
                setError("");
              }}
            >
              ‹ Back to sign in
            </button>
          </>
        )}
      </div>

      {deactivated && (
        <div
          className="card"
          style={{
            marginTop: "var(--s3)",
            background: "var(--danger-bg)",
            border: "1px solid var(--danger-border)",
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: "var(--s2)", color: "var(--danger-fg)" }}>
            This account is deactivated
          </h3>
          <p style={{ margin: 0, color: "var(--danger-fg)" }}>
            Your login was turned off by an admin. Ask them to reactivate it — your account history
            is intact.
          </p>
        </div>
      )}
    </LoginShell>
  );
}
