import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, setAuthToken } from "../api";
import type { AuthResponse, User } from "../types";

const TOKEN_KEY = "cc.authToken";

type AuthContextValue = {
  user: User | null;
  /** True while a saved session is being checked on page load. */
  restoring: boolean;
  signIn: (session: AuthResponse) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function writeToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // Storage blocked (private mode); the session lasts until reload.
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [restoring, setRestoring] = useState(() => readToken() !== null);

  // Restore a saved session by asking the API who the token belongs to.
  useEffect(() => {
    const token = readToken();
    if (!token) return;
    setAuthToken(token);
    let active = true;
    api
      .me()
      .then(
        ({ user }) => active && setUser(user),
        () => {
          if (!active) return;
          setAuthToken(null);
          writeToken(null);
        },
      )
      .finally(() => active && setRestoring(false));
    return () => {
      active = false;
    };
  }, []);

  const signIn = useCallback(({ token, user }: AuthResponse) => {
    setAuthToken(token);
    writeToken(token);
    setUser(user);
  }, []);

  const signOut = useCallback(() => {
    setAuthToken(null);
    writeToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, restoring, signIn, signOut }),
    [user, restoring, signIn, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
