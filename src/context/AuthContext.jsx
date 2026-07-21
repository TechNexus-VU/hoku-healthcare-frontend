import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

import { toast } from "react-toastify";

import api from "@/services/api";

export const AuthContext = createContext(null);

const USER_STORAGE_KEY = "doctor-user";
const TOKEN_STORAGE_KEY = "doctor-token";

const getStoredUser = () => {
  try {
    const storedUser = localStorage.getItem(
      USER_STORAGE_KEY
    );

    return storedUser
      ? JSON.parse(storedUser)
      : null;
  } catch {
    localStorage.removeItem(USER_STORAGE_KEY);
    return null;
  }
};

const getStoredToken = () =>
  localStorage.getItem(TOKEN_STORAGE_KEY);

const getErrorMessage = (
  error,
  fallback = "Unable to sign in."
) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    getStoredUser
  );

  const [token, setToken] = useState(
    getStoredToken
  );

  const [loading, setLoading] =
    useState(false);

  const login = useCallback(
    async (credentials) => {
      setLoading(true);

      try {
        const email = String(
          credentials?.email || ""
        ).trim();

        const password =
          credentials?.password || "";

        if (!email || !password) {
          throw new Error(
            "Email and password are required."
          );
        }

        const response = await api.post(
          "/auth/login",
          {
            email,
            password,
          }
        );

        const payload =
          response?.data?.data ||
          response?.data ||
          {};

        const accessToken =
          payload.access_token ||
          payload.accessToken ||
          payload.token ||
          null;

        const authenticatedUser =
          payload.user || null;

        if (
          !accessToken ||
          !authenticatedUser
        ) {
          throw new Error(
            "The server returned an invalid login response."
          );
        }

        const role = String(
          authenticatedUser.role || ""
        )
          .trim()
          .toLowerCase();

        if (role !== "doctor") {
          throw new Error(
            "This account does not have Doctor access."
          );
        }

        const normalizedUser = {
          ...authenticatedUser,
          role,
        };

        localStorage.setItem(
          TOKEN_STORAGE_KEY,
          accessToken
        );

        localStorage.setItem(
          USER_STORAGE_KEY,
          JSON.stringify(normalizedUser)
        );

        setToken(accessToken);
        setUser(normalizedUser);

        toast.success(
          "Signed in successfully"
        );

        return {
          user: normalizedUser,
          token: accessToken,
        };
      } catch (error) {
        localStorage.removeItem(
          TOKEN_STORAGE_KEY
        );

        localStorage.removeItem(
          USER_STORAGE_KEY
        );

        setToken(null);
        setUser(null);

        const message = getErrorMessage(
          error,
          "Invalid Doctor email or password."
        );

        toast.error(message);

        throw error;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);

    localStorage.removeItem(
      USER_STORAGE_KEY
    );

    localStorage.removeItem(
      TOKEN_STORAGE_KEY
    );

    toast.success(
      "You have been logged out"
    );
  }, []);

  const updateUser = useCallback(
    (updatedData) => {
      setUser((currentUser) => {
        if (!currentUser) {
          return null;
        }

        const updatedUser = {
          ...currentUser,
          ...updatedData,
        };

        localStorage.setItem(
          USER_STORAGE_KEY,
          JSON.stringify(updatedUser)
        );

        return updatedUser;
      });
    },
    []
  );

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      login,
      logout,
      updateUser,
      isAuthenticated: Boolean(
        user && token
      ),
    }),
    [
      user,
      token,
      loading,
      login,
      logout,
      updateUser,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};