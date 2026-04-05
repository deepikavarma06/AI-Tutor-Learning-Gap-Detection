import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext.jsx";

const SignupPage = () => {

  const { signup } = useAuth();
  const navigate = useNavigate();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      await signup(email,password);
      navigate("/dashboard");
    } catch (error) {
      console.error("Signup error:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">

      <form
        onSubmit={handleSignup}
        className="p-8 border rounded-xl w-[350px] space-y-4"
      >

        <h1 className="text-2xl font-bold text-center">Signup</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-black text-white p-2 rounded"
        >
          Signup
        </button>

        <p className="text-center text-sm">
          Already have account?
          <Link to="/login" className="text-blue-600 ml-1">
            Login
          </Link>
        </p>

      </form>
    </div>
  );
};

export default SignupPage;