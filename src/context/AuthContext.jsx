import {
  createContext,
  useContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { createToken, verifyToken } from "../utils/jwt";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const TOKEN_KEY = "authToken";
const REMEMBER_KEY = "rememberedUsername";

const SESSION_SECONDS = 60 * 60; // 1 hour (normal login)
const REMEMBER_SECONDS = 60 * 60 * 24 * 7; // 7 days (remember me)

// Demo "database" - replace with a real API later
const DEMO_USER = { username: "admin", password: "1234" };

const clearStoredToken = () => {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
};

const loadStoredToken = () => {
  const token =
    localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);

  if (token && verifyToken(token)) return token;

  clearStoredToken();
  return null;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(loadStoredToken);

  // Decoded payload (null when logged out or token invalid)
  const user = useMemo(() => (token ? verifyToken(token) : null), [token]);

  const logout = useCallback(() => {
    clearStoredToken();
    localStorage.removeItem("isLoggedIn"); // old Assignment 6 key
    setToken(null);
  }, []);

  // Auto-logout when the token expires
  useEffect(() => {
    if (!user) return;

    const msLeft = user.exp * 1000 - Date.now();
    const timer = setTimeout(logout, msLeft);
    return () => clearTimeout(timer);
  }, [user, logout]);

  // Simulates a server call: checks credentials and issues a JWT
  const login = async (username, password, remember = false) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (username !== DEMO_USER.username || password !== DEMO_USER.password) {
      return { success: false, error: "Invalid username or password" };
    }

    const newToken = createToken(
      { sub: username, username },
      remember ? REMEMBER_SECONDS : SESSION_SECONDS
    );

    clearStoredToken();

    if (remember) {
      // Remember User: token survives closing the browser
      localStorage.setItem(TOKEN_KEY, newToken);
      localStorage.setItem(REMEMBER_KEY, username);
    } else {
      // Otherwise the session ends when the tab is closed
      sessionStorage.setItem(TOKEN_KEY, newToken);
      localStorage.removeItem(REMEMBER_KEY);
    }

    setToken(newToken);
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn: !!user, user, token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
