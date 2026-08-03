"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabaseBrowser } from "@/lib/supabase/browser";
import { PUBLIC } from "@/lib/env";

interface AuthUser {
  id: string;
  email: string | null;
}
interface AuthValue {
  user: AuthUser | null;
  loading: boolean;
  configured: boolean;
  signIn: (email: string) => Promise<{ ok: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const client = supabaseBrowser();
  const configured = client != null;
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(configured);

  useEffect(() => {
    if (!client) return;
    let active = true;
    void client.auth.getSession().then(({ data }) => {
      if (!active) return;
      setUser(data.session?.user ? { id: data.session.user.id, email: data.session.user.email ?? null } : null);
      setLoading(false);
    });
    const { data: sub } = client.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ? { id: session.user.id, email: session.user.email ?? null } : null);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, [client]);

  const value = useMemo<AuthValue>(
    () => ({
      user,
      loading,
      configured,
      signIn: async (email: string) => {
        if (!client) return { ok: false, error: "NOT_CONFIGURED" };
        const { error } = await client.auth.signInWithOtp({
          email,
          options: { emailRedirectTo: `${PUBLIC.siteUrl}/konto`, shouldCreateUser: true },
        });
        return error ? { ok: false, error: error.message } : { ok: true };
      },
      signOut: async () => {
        await client?.auth.signOut();
      },
    }),
    [user, loading, configured, client]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth poza AuthProvider");
  return v;
}
