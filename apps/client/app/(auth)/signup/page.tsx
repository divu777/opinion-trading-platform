'use client'
import axios from "axios";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const Page = () => {
    const [userId,setUserId] = useState("");
    const router = useRouter()
    async function createUser(e:any){
        e.preventDefault()
            const response = await axios.post("/api/auth/signin",{
                data:{
                    userId
                }
            });
            console.log(response.data.success+"----->");
            if(response.data.success){
                router.push("/dashboard")
            }
        }
  return (
    <div className="w-screen h-screen flex items-center justify-center bg-black text-white transition-colors duration-300">
      <div className="w-full max-w-md p-8 bg-zinc-900 rounded-xl shadow-2xl border border-zinc-800">
        <h2 className="text-3xl font-bold text-center text-white mb-8">
          Create Account
        </h2>
        <form className="space-y-6" onSubmit={createUser}>
          {/* userId = to check workings */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-zinc-300 mb-1"
              
            >
              userId
            </label>
            <input
              type="text"
              id="name"
              value={userId}
              placeholder="Your name"
              className="w-full px-4 py-2 rounded-md bg-zinc-800 text-white placeholder-zinc-500 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
              onChange={(e)=>setUserId(e.target.value) }
            />
          </div>

          {/* Email */}
          {/* <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-zinc-300 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              placeholder="you@example.com"
              className="w-full px-4 py-2 rounded-md bg-zinc-800 text-white placeholder-zinc-500 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div> */}

          {/* Password */}
          {/* <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-zinc-300 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 rounded-md bg-zinc-800 text-white placeholder-zinc-500 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div> */}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition duration-300
            "
          >
            Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default Page;
