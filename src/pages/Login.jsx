import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
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
        setError(
          result.error || "Login failed. Please check your credentials."
        );
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gray-100">
      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col gap-4 w-full max-w-md p-8 border border-white rounded-xl shadow-lg bg-white bg-opacity-50 backdrop-blur-md"
      >
        <h1 className="text-2xl font-semibold text-center">
          {role === "Admin" ? "Admin Login" : "Moderator Login"}
        </h1>
        <p className="text-center text-sm text-[#141C36]">
          Welcome back {role === "Admin" ? "Admin" : "Moderator"}, enter your
          credentials to login
        </p>

        <div className="flex flex-col w-full">
          <label className="text-sm text-[#141C36] mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
            autoComplete="email"
            className="w-full p-2 border border-zinc-300 text-[#1e2745] text-sm rounded focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <div className="flex flex-col w-full">
          <label className="text-sm text-[#141C36] mb-1">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            autoComplete="current-password"
            className="w-full p-2 border border-zinc-300 text-[#1e2745] text-sm rounded focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        {error && (
          <div className="w-full p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm text-center">
            {error}
          </div>
        )}

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-1/2 py-2 rounded-md font-semibold bg-[#f0a71e] text-[#141C36] hover:bg-[#b37820] disabled:opacity-60 disabled:cursor-not-allowed transition-colors text-center"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </div>

        <div className="flex justify-between text-sm mt-2 w-full">
          <span className="text-[#141C36]">
            {role === "Admin" ? "Login as Moderator? " : "Login as Admin? "}
            <span
              onClick={() => setRole(role === "Admin" ? "Moderator" : "Admin")}
              className="text-primary underline cursor-pointer"
            >
              Click here
            </span>
          </span>

          <span>
            <Link to="/" className="text-primary underline cursor-pointer">
              Back
            </Link>
          </span>
        </div>
      </form>
    </div>
  );
};

export default Login;
