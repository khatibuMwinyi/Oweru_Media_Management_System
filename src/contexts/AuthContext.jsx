import { createContext, useContext, useState, useEffect } from "react";
import { authService } from "../services/api";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("user");

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
      // Verify token is still valid
      authService
        .getUser()
        .then((response) => {
          setUser(response.data);
          localStorage.setItem("user", JSON.stringify(response.data));
        })
        .catch(() => {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authService.login({ email, password });
      const { user, token } = response.data;
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      return { success: true };
    } catch (error) {
      // Handle Laravel validation errors
      let errorMessage = "Login failed. Please check your credentials.";
      
      if (error.response?.data) {
        // Laravel ValidationException format: { errors: { email: ["message"] } }
        if (error.response.data.errors) {
          const errors = error.response.data.errors;
          // Get first error message from any field
          const firstError = Object.values(errors).flat()[0];
          errorMessage = firstError || errorMessage;
        } 
        // Laravel general error format: { message: "error message" }
        else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  const register = async (name, email, password, password_confirmation) => {
    try {
      const response = await authService.register({
        name,
        email,
        password,
        password_confirmation,
      });
      const { user, token } = response.data;
      localStorage.setItem("auth_token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70">
        <div
          style={{
            width: 56,
            height: 56,
            borderTop: "4px solid #C89128",
            borderRight: "4px solid transparent",
            borderRadius: "50%",
          }}
          className="animate-spin"
        />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
