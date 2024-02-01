import React, { useState, useEffect, useRef } from "react"

const Logo: React.FC = () => {
  // React.FC<CardProps> </CardProps>
  return (
    <nav>
      <div className="flex items-center justify-between">
        <div>
          <a href="/">
            {/* <img src="../logo2.png" className="w-24" alt="Flowbite Logo" /> */}
            {/* <img src="../logo.png" className="h-20 w-14" alt="Flowbite Logo" /> */}
            <span className="self-center text-3xl whitespace-nowrap font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-500 to-indigo-500">
              FlagDAO ✨{" "}
            </span>
          </a>
        </div>
      </div>
    </nav>
  )
}

export default Logo