'use client'

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { motion } from "framer-motion";

const Page = () => {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  async function createUser(e: any) {
    e.preventDefault();

    const response = await signIn("credentials", {
      redirect: false,
      username: userId,
      password,
    });

    if (response?.ok) {
      router.push("/markets");
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="w-screen h-screen flex items-center justify-center bg-gray-100 text-black"
    >
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        className="w-full max-w-md p-8 bg-white rounded-xl shadow-xl border border-gray-200"
      >
        <h2 className="text-3xl font-bold text-center text-black mb-8">
          Create Account
        </h2>

        <form className="space-y-6" onSubmit={createUser}>
          {/* User ID */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              User ID
            </label>
            <input
              type="text"
              id="name"
              value={userId}
              placeholder="Your name"
              className="w-full px-4 py-2 rounded-md bg-gray-50 text-black placeholder-gray-400 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <input
              type="password"
              value={password}
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 rounded-md bg-gray-50 text-black placeholder-gray-400 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black"
            />
          </div>

          {/* Submit Button with Framer Motion hover effect */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="w-full py-3 bg-black hover:bg-gray-900 text-white font-semibold rounded-lg transition duration-300"
          >
            Submit
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default Page;
