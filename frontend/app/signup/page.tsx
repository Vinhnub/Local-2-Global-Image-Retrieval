"use client";

import api from "@/lib/axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

export default function SignupPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    try {
      if (!username || !password) {
        alert("Please enter username and password.");
        return;
      }

      setLoading(true);

      const res = await api.post( "/api/v1/auth/register", {username, password});
      
      console.log("res", res)

      router.push("/login");
      
      toast.success("Sign up successfully")


    } catch (err: any) {
        console.error(err);

        console.log(err.response);
        console.log(err.response.data);  
        console.log(err.response.data.detail); 

        toast.error(err.response?.data?.detail || "Error when call sign up");

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">

      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-[480px] h-auto text-black relative z-10">
        <Link
            href="/home"
            className="ml-1.5 font-medium opacity-35 hover:opacity-80 hover:underline absolute top-2 right-2 text-black"
          >
          Back to home
        </Link>
        <h1 className="text-3xl font-bold text-center mb-6">
          Sign Up
        </h1>

        <input
          type="text"
          placeholder="Username"
          className="w-full p-3 rounded-lg mb-4"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 rounded-lg mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
        >
          {loading ? "Creating..." : "Create Account"}
        </button>

        <p className="text-center mt-5">
          Already have an account?
          <Link href="/login" className="text-blue-600 ml-2">
            Login
          </Link>
        </p>

      </div>

    </div>
  );
}