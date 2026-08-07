import { createClient } from "@supabase/supabase-js";

// Service-role client — SERVER ONLY. This key bypasses Row Level Security.
// Import it only from server actions and route handlers, never from a
// component file. The window check makes an accidental client-side import
// fail loudly at first call instead of silently shipping the key.
export function createAdminClient() {
  if (typeof window !== "undefined") {
    throw new Error(
      "createAdminClient() was called in the browser. The service-role key is server-only.",
    );
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY — check .env.local (see .env.example).",
    );
  }
  // No session persistence: this client authenticates as the service role
  // itself, and must never write auth cookies for a user.
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
