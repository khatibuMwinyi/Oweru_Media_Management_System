import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Login = () => {
  const [role, setRole] = useState("Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth();

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      const result = await login(email, password);
      if (result.success) {
        navigate("/admin/dashboard", { replace: true });
      } else {
        setError(result.error || "Login failed. Please check your credentials.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex items-center justify-center w-screen h-screen"
    >
      <div
        className="flex flex-col gap-3 items-start p-8 min-w-[340px] sm:min-w-[384px] border border-white rounded-xl text-zinc-600 text-sm shadow-lg"
        style={{ background: "linear-gradient(90deg,#F6C049,#C89128)" }}
      >
        <h1 className="text-2xl font-semibold w-full text-center">
          {role === "Admin" ? "Admin Login" : "Moderator Login"}
        </h1>
        <p className="text-white text-lg">
          Welcome back {role === "Admin" ? "Admin" : "Moderator"}, enter your
          credentials to login
        </p>

        <div className="w-full">
          <p className="text-white text-lg">Email</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            autoComplete="email"
          />
        </div>
        <div className="w-full">
          <p className="text-white text-lg">Password</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            autoComplete="current-password"
          />
        </div>

        {error && (
          <div className="w-full p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="text-white w-full py-2 rounded-md text-base bg-[#C89128] hover:bg-[#b37820] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Signing in..." : "Login"}
        </button>

        {role === "Admin" ? (
          <p>
            Login as Moderator?
            <span
              onClick={(e) => setRole("Moderator")}
              className="text-primary underline cursor-pointer"
            >
              Click here
            </span>
          </p>
        ) : (
          <p>
            Login as Admin?
            <span
              onClick={(e) => setRole("Admin")}
              className="text-primary underline cursor-pointer"
            >
              Click here
            </span>
          </p>
        )}
      </div>
    </form>
  );
};

export default Login;
