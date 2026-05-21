import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import Toast from "../components/ui/Toast";

interface UserInfo {
  id: string;
  email: string;
  role: "ADMIN" | "TALENT" | "EMPLOYER";
  fullName?: string;
  avatarUrl?: string;
}

interface ToastState {
  message: string;
  type: "success" | "error" | "warning" | "info";
}

interface AuthContextType {
  user: UserInfo | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => void;
  showToast: (message: string, type: ToastState["type"]) => void;
  updateUser: (updatedFields: Partial<UserInfo>) => void;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api/v1";

let refreshPromise: Promise<string | null> | null = null;

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("access_token");
    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("user");
      }
    }
    setLoading(false);
  }, []);

  const showToast = (message: string, type: ToastState["type"]) => {
    setToast({ message, type });
  };

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, role: "ADMIN" }),
      });

      const data = await response.json();

      if (!response.ok) {
        showToast(data.message || "Failed to sign in. Please try again.", "error");
        return false;
      }

      const payload = data.data || data;
      const { accessToken, refreshToken, user: authUser } = payload;
      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
      localStorage.setItem("user", JSON.stringify(authUser));
      localStorage.setItem("user_role", authUser.role);

      setUser(authUser);
      showToast("Signed in successfully!", "success");
      return true;
    } catch (error) {
      showToast("Unable to connect to the server. Please check if backend is running.", "error");
      return false;
    }
  };

  const signOut = async () => {
    const token = localStorage.getItem("access_token");
    if (token) {
      try {
        await fetch(`${API_URL}/auth/signout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (e) {
        console.error("Signout API call failed:", e);
      }
    }
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("user_role");
    setUser(null);
    showToast("Signed out successfully", "info");
  };

  const updateUser = (updatedFields: Partial<UserInfo>) => {
    setUser((prevUser) => {
      if (!prevUser) return null;
      const updated = { ...prevUser, ...updatedFields };
      localStorage.setItem("user", JSON.stringify(updated));
      return updated;
    });
  };

  const refreshTokens = async (): Promise<string | null> => {
    if (refreshPromise) {
      return refreshPromise;
    }

    refreshPromise = (async () => {
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        if (!refreshToken) return null;

        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ refreshToken }),
        });

        if (!res.ok) {
          return null;
        }

        const data = await res.json();
        const payload = data.data || data;
        const { accessToken: newAccessToken, refreshToken: newRefreshToken, user: authUser } = payload;

        localStorage.setItem("access_token", newAccessToken);
        localStorage.setItem("refresh_token", newRefreshToken);
        if (authUser) {
          localStorage.setItem("user", JSON.stringify(authUser));
          setUser(authUser);
        }
        return newAccessToken;
      } catch (error) {
        console.error("Token refresh error:", error);
        return null;
      } finally {
        refreshPromise = null;
      }
    })();

    return refreshPromise;
  };

  const authFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const token = localStorage.getItem("access_token");
    const headers = {
      ...options.headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    } as HeadersInit;

    try {
      let response = await fetch(url, { ...options, headers });
      if (response.status === 401) {
        const newToken = await refreshTokens();
        if (newToken) {
          const retryHeaders = {
            ...options.headers,
            Authorization: `Bearer ${newToken}`,
          } as HeadersInit;
          response = await fetch(url, { ...options, headers: retryHeaders });
          if (response.status === 401) {
            signOut();
          }
        } else {
          signOut();
        }
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut, showToast, updateUser, authFetch }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
