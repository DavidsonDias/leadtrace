import { AuthContext } from "./auth-context";
import { useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { authConfigured, getSupabase } from "./client";
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ user: User | null; loading: boolean; error: boolean }>({
    user: null,
    loading: true,
    error: false,
  });
  useEffect(() => {
    if (!authConfigured) {
      setState({ user: null, loading: false, error: false });
      return;
    }
    let alive = true;
    const client = getSupabase();
    // getUser verifies the token with Auth; getSession alone is not an authorization decision.
    const verify = () =>
      client.auth
        .getUser()
        .then(({ data, error }) => {
          if (alive)
            setState({
              user: data.user,
              loading: false,
              error: Boolean(error && error.name !== "AuthSessionMissingError"),
            });
        })
        .catch(() => {
          if (alive) setState({ user: null, loading: false, error: true });
        });
    void verify();
    const { data } = client.auth.onAuthStateChange(() => {
      window.setTimeout(() => {
        if (alive) void verify();
      }, 0);
    });
    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, []);
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
