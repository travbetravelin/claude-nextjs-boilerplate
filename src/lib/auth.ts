import { cache } from "react";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export interface Identity {
  supabase: SupabaseClient;
  userId: string | null;
  fullName: string | null;
  role: string | null;
}

// One identity lookup per request: a layout and the page it renders both
// call this, and React cache() dedupes them into a single fetch for the
// render pass.
export const getIdentity = cache(async (): Promise<Identity> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, userId: null, fullName: null, role: null };
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, role, active")
    .eq("id", user.id)
    .single();
  if (!profile || !profile.active) {
    return { supabase, userId: user.id, fullName: null, role: null };
  }
  return {
    supabase,
    userId: user.id,
    fullName: profile.full_name,
    role: profile.role,
  };
});

export interface Session {
  supabase: SupabaseClient;
  userId: string;
  fullName: string;
  role: string;
}

// The per-page gate: call at the top of any server page that requires a
// signed-in user. Replaces the auth + profile preamble that would otherwise
// open every protected page. Redirects, so the page after this line can
// assume a full session.
export async function requireUser(): Promise<Session> {
  const id = await getIdentity();
  if (!id.userId || !id.fullName || !id.role) redirect("/login");
  return {
    supabase: id.supabase,
    userId: id.userId,
    fullName: id.fullName,
    role: id.role,
  };
}

// Page gate for a specific role (e.g. "admin"). A signed-in user without
// the role lands back on the home page rather than an error screen.
export async function requireRole(role: string): Promise<Session> {
  const session = await requireUser();
  if (session.role !== role) redirect("/");
  return session;
}

// Same gate for server actions: throws instead of redirecting — an
// action's caller needs an error to surface, not a navigation.
export async function requireRoleAction(role: string): Promise<Session> {
  const id = await getIdentity();
  if (!id.userId || !id.fullName || !id.role) throw new Error("Not signed in");
  if (id.role !== role) throw new Error("Not permitted");
  return {
    supabase: id.supabase,
    userId: id.userId,
    fullName: id.fullName,
    role: id.role,
  };
}
