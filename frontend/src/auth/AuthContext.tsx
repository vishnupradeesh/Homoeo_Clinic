import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import {
  clearToken,
  getMe,
  getToken,
  login as apiLogin,
  loginWithGoogle as apiGoogleLogin,
  setToken,
  type AuthUser,
  type Role,
} from "../services/api";


export type NavKey =
  | "home"
  | "appointments"
  | "patients"
  | "prescriptions"
  | "tasks"
  | "settings";

// Which roles may access each area. ADMIN is granted everything implicitly.
const ACCESS: Record<NavKey, Role[]> = {
  home: ["ADMIN", "DOCTOR", "PATIENT"],
  appointments: ["ADMIN", "DOCTOR", "PATIENT"],
  patients: ["ADMIN", "DOCTOR"],
  prescriptions: ["ADMIN", "DOCTOR"],
  tasks: ["ADMIN", "DOCTOR"],
  settings: ["ADMIN"],
};

export function canAccess(role: Role, key: NavKey): boolean {
  return role === "ADMIN" || ACCESS[key].includes(role);
}


interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {

  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function restore() {
      if (!getToken()) {
        setLoading(false);
        return;
      }

      try {
        setUser(await getMe());
      } catch {
        clearToken();
      } finally {
        setLoading(false);
      }
    }

    restore();
  }, []);

  async function login(username: string, password: string) {
    const result = await apiLogin(username, password);
    setToken(result.access_token);
    setUser(await getMe());
  }

  async function loginWithGoogle(credential: string) {
    const result = await apiGoogleLogin(credential);
    setToken(result.access_token);
    setUser(await getMe());
  }

  function logout() {
    clearToken();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}


export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
