import React, { useContext, useState } from "react";

const Login = () => {
  const [role, setRole] = useState("Admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const onSubmitHandler = async (e) => {
    e.preventDefault();
  };
  return (
    <form
      onSubmit={onSubmitHandler}
      className="flex items-center justify-center w-screen h-screen "
    >
      <div className="flex flex-col gap-3 items-start p-8 min-w-[340px] sm:min-w-[384px] border  border-white rounded-xl text-zinc-600 text-sm shadow-lg bg-linear-to-r from-[#F6C049] to-[#C89128]">
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
            className="border border-zinc-300 rounded w-full p-2 mt-1 focus:outline-none"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="w-full">
          <p className="text-white text-lg">Password</p>
          <input
            className="border border-zinc-300 rounded w-full p-2 mt-1 focus:outline-none"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="text-white w-full py-2 rounded-md text-base bg-[#C89128] hover:bg-[#b37820]"
        >
          Login
        </button>

        {role === "Admin" ? (
          <p >
            Login as Moderator?
            <span
              onClick={(e) => setRole("Moderator")}
              className="text-primary underline cursor-pointer"
            >
              {" "}
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
