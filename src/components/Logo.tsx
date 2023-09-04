import React, { useState, useEffect, useRef } from "react";

const Logo: React.FC = () => { // React.FC<CardProps> </CardProps>
  return (
  <nav className="border-gray-200 dark:bg-gray-900 dark:border-gray-700">
    <div className="flex  items-center justify-between">
      <div>
      <a href="/" className="">
          <img src="../logo2.png"  className="h-32 w-24" alt="Flowbite Logo" />
          {/* <img src="../logo.png"  className="h-20 w-14" alt="Flowbite Logo" /> */}
          {/* <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">FlagDAO </span> */}
      </a>
      </div>
    </div>
  </nav>
  )
}


export default Logo;