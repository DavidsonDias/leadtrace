import { createContext, useContext } from "react";
import type { User } from "@supabase/supabase-js";
export const AuthContext = createContext<{ user: User | null; loading: boolean; error: boolean }>({
  user: null,
  loading: true,
  error: false,
});

export const useAuth = () => useContext(AuthContext);
