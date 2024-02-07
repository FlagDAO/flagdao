import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"

const Logo: React.FC = () => {
  // React.FC<CardProps> </CardProps>
  return (
    <nav>
      <div className="flex items-center justify-between">
        <div>
          <Link href="/">
            {/* <img src="../logo2.png" className="w-24" alt="Flowbite Logo" /> */}
            {/* <img src="../logo.png" className="h-20 w-14" alt="Flowbite Logo" /> */}
            <span className="self-center text-3xl italic whitespace-nowrap font-semibold text-slate-600  text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-blue-500 to-indigo-500">
              FlagSpace ✨{" "}
            </span>
            {/* <span className="bg-gradient-to-r from-blue-600 via-green-500 to-indigo-400 inline-block text-transparent bg-clip-text">FlagSpace ✨{" "}</span> */}
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Logo