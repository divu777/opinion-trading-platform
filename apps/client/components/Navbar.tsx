import React from 'react'

const Navbar = () => {
  return (
    <nav className="relative top-0 h-16 w-full bg-white text-zinc-900 flex items-center justify-between px-6 border-b border-zinc-300 shadow-sm">
      
      {/* Left: Logo or Title */}
      <div className="text-xl font-semibold tracking-tight">
        Lose<span className="text-zinc-500">Money</span>
      </div>

      {/* Right: Links or Buttons */}
      <div className="flex space-x-6 text-sm font-medium">
        <a href="/" className="hover:text-black transition-colors duration-150">
          Home
        </a>
        <a href="/markets" className="hover:text-black transition-colors duration-150">
          Markets
        </a>
        <a href="/profile" className="hover:text-black transition-colors duration-150">
          Profile
        </a>
      </div>
    </nav>
  )
}

export default Navbar
