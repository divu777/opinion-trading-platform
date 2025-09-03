'use client'
import { Activity } from 'lucide-react'
import React from 'react'
import { useSession } from "next-auth/react"
import { useState,useEffect } from "react";


const Navbar = () => {
  const [authorized,setAuthorized] = useState(false)
  const { data: session, status } = useSession()
  console.log("========="+status)
  useEffect(()=>{
    if(status==='authenticated'){
      setAuthorized(true)
    }
  },[session])
  return (
    <nav className="relative top-0 h-16 w-full bg-white text-zinc-900 flex items-center justify-between px-6 border-b border-zinc-300 shadow-sm">
      
      {/* Left: Logo or Title */}
       <div className="flex items-center space-x-1 sm:space-x-2">
                <Activity className="w-6 h-6 text-black" />
                <h1 className="text-lg sm:text-xl font-bold text-black">
                  Opinion Markets
                </h1>
              </div>

      {/* Right: Links or Buttons */}
      <div className="flex space-x-6 text-sm font-medium">
        <a href="/" className="hover:text-black transition-colors duration-150">
          Home
        </a>
        <a href="/markets" className="hover:text-black transition-colors duration-150">
          Markets
        </a>
      { authorized && <a href="/profile" className="hover:text-black transition-colors duration-150">
          Profile
        </a>}
      </div>
    </nav>
  )
}

export default Navbar
