import React, { useState, useEffect, useRef } from "react"

interface ChildComponentProps {
  onValueChange: (value: string) => void
}

const Dropdown: React.FC<ChildComponentProps> = ({
  onValueChange,
}: ChildComponentProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [cur, setCur] = useState()

  const ref = useRef<HTMLLIElement | null>(null)
  const toggleDropdown = () => setIsOpen(!isOpen)

  // this function will be executed when clicked outside of the dropdown container
  const handleClickOutside = (event: any) => {
    if (ref.current && !ref.current.contains(event.target)) {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    // adding the click event listener when the component is mounted
    document.addEventListener("mousedown", handleClickOutside)
    // cleaning up the listener when the component is unmounted
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleClick = (value: any) => {
    setCur(value)
    onValueChange(value)
    setIsOpen(!isOpen)
  }

  return (
    <div className=" md:block md:w-auto" id="navbar-dropdown">
      {/* <ul className="flex flex-col font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 md:mt-0 md:border-0 md:bg-white"> */}
      <ul className="flex flex-col font-medium p-4  border-gray-100 rounded-lg  space-x-8 border-0 ">
      <li className="relative" ref={ref}>
          <button
            id="dropdownNavbarLink"
            onClick={toggleDropdown}
            data-dropdown-toggle="dropdownNavbar"
            // className="flex items-center justify-between w-full py-2 pl-3 pr-4 text-gray-900 rounded hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 md:p-0 md:w-auto"
            className="flex items-center justify-between px-4 py-1.5 mr-4 rounded-xl shadow-lg font-semibold  text-lg text-blue-950"
            style={{
              fontFamily:
                'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
            }}
          >
            Items
            <svg
              className="w-auto h-3 ml-1"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>

          {isOpen && (
            <div
              id="dropdownNavbar"
              className="z-10 font-normal bg-white divide-y divide-gray-100 rounded-lg shadow w-44 absolute"
              style={{ top: "115%" }}
            >
              <ul
                className="py-2 text-sm text-gray-700"
                aria-labelledby="dropdownLargeButton"
              >
                <li>
                  <a
                    onClick={() => handleClick("Rust")}
                    href="#"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Rust
                  </a>
                </li>
                <li>
                  <a
                    onClick={() => handleClick("ZKP")}
                    href="#"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    ZKP
                  </a>
                </li>
                <li>
                  <a
                    onClick={() => handleClick("Co-lean")}
                    href="#"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Co-lean (CreatorsDAO)
                  </a>
                </li>
                <li>
                  <a
                    onClick={() => handleClick("others")}
                    href="#"
                    className="block px-4 py-2 hover:bg-gray-100"
                  >
                    Other flags
                  </a>
                </li>
              </ul>
              <div className="py-1">
                <a
                  onClick={() => handleClick("all")}
                  href="#"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  All flags
                </a>
              </div>
            </div>
          )}
        </li>
      </ul>
    </div>
  )
}

export default Dropdown