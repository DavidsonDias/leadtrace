import { AuthContext } from "./auth-context";
import { useEffect, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { authConfigured, getSupabase } from "./client";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const router = useRouter();
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
    const { data } = client.auth.onAuthStateChange((event) => {
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED" && event !== "PASSWORD_RECOVERY") return;
      window.setTimeout(() => {
        if (!alive) return;
        if (event === "SIGNED_OUT") {
          setState({ user: null, loading: false, error: false });
          queryClient.clear();
        } else {
          void verify();
          void queryClient.invalidateQueries();
        }
        void router.invalidate();
      }, 0);
    });
    void verify();
    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, [queryClient, router]);
  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}
