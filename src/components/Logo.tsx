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
            <span className="self-center text-2xl font-bold whitespace-nowrap text-indigo-500">
              FlagDAO ✨{" "}
            </span>
          </a>
        </div>
      </div>
    </nav>
  )
}

export default Logo
