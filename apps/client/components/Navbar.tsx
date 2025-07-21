import React from 'react'

const Navbar = () => {
  return (
    <nav className="relative top-0 h-16 w-full bg-zinc-900 text-white flex items-center justify-between px-6 border-b border-zinc-800 shadow-sm">
      
      {/* Left: Logo or Title */}
      <div className="text-xl font-semibold text-blue-500">
        Lose<span className="text-white">Money</span>
      </div>

      {/* Right: Links or Buttons */}
      <div className="flex space-x-6 text-sm font-medium">
        <a href="/" className="hover:text-blue-500 transition duration-200">
          Home
        </a>
        <a href="/markets" className="hover:text-blue-500 transition duration-200">
          Markets
        </a>
        <a href="/profile" className="hover:text-blue-500 transition duration-200">
          Profile
        </a>
      </div>
    </nav>
  )
}

export default Navbar
