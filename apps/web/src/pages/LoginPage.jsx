import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "@/lib/firebase";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  onAuthStateChanged
} from "firebase/auth";

export default function LoginPage() {

  const navigate = useNavigate();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth,(user)=>{
      if(user){
        navigate("/dashboard",{replace:true});
      }
    });

    return ()=>unsub();
  },[]);

  const handleGoogleLogin = async () => {
    try{
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth,provider);
      navigate("/dashboard");
    }catch(err){
      console.log(err);
    }
  };

  const handleGithubLogin = async () => {
    try{
      const provider = new GithubAuthProvider();
      await signInWithPopup(auth,provider);
      navigate("/dashboard");
    }catch(err){
      console.log(err);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();

    try{
      await signInWithEmailAndPassword(auth,email,password);
      navigate("/dashboard");
    }catch(err){
      console.log(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">

      <div className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md">

        <h1 className="text-3xl font-bold text-center mb-2">
          Welcome back
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Sign in to continue your learning journey
        </p>

        <button
          onClick={handleGoogleLogin}
          className="w-full border rounded-lg py-3 mb-3 hover:bg-gray-50"
        >
          Login with Google
        </button>

        <button
          onClick={handleGithubLogin}
          className="w-full border rounded-lg py-3 mb-5 hover:bg-gray-50"
        >
          Login with GitHub
        </button>

        <div className="text-center text-gray-400 mb-4">
          OR CONTINUE WITH EMAIL
        </div>

        <form onSubmit={handleEmailLogin} className="space-y-4">

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="w-full border px-4 py-3 rounded-lg"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
            className="w-full border px-4 py-3 rounded-lg"
          />

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-3 rounded-lg"
          >
            Sign In
          </button>

        </form>

        <p className="text-center mt-4">
          Don't have an account?{" "}
          <Link to="/signup" className="text-indigo-600">
            Sign up
          </Link>
        </p>

      </div>

    </div>
  );
}