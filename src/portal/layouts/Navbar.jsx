import React, { useEffect, useRef, useState } from "react";
import {
  Search,
  User,
  Settings,
  CreditCard,
  LogOut,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "../../shared/utils/toast";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Load user from sessionStorage (NOT localStorage)
  useEffect(() => {
    const userData = sessionStorage.getItem("user");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    // Destroy session
    sessionStorage.clear();

    toast.info("Logged out successfully!", {
      position: "top-right",
      autoClose: 2000,
    });

    setOpen(false);
    setTimeout(() => navigate("/Login", { replace: true }), 300);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="w-full bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* LEFT: Brand */}
        <div className="flex items-center gap-3">
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100">
            <svg
              className="w-6 h-6 text-gray-700"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          <h1 className="text-xl font-extrabold tracking-wide">
            {/* <span className="text-orange-500">VIZO</span>
            <span className="text-gray-900">RA</span> */}
              <img
            // src={VimanoTechLogo}
            src="/vizora-logo.svg"
            alt="VimanoTech Logo"
            className="h-8 object-contain"
          />
          </h1>
        </div>

        {/* RIGHT: Avatar + Name */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-3 rounded-xl px-2 py-1 hover:bg-gray-50 transition focus:outline-none"
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-semibold">
              {user?.user_name ? user.user_name.charAt(0).toUpperCase() : "U"}
            </div>

            {/* Name + Email */}
            <div className="hidden sm:flex flex-col items-start leading-tight">
              <p className="text-sm font-semibold text-gray-800">
                {user?.user_name || "User"}
              </p>
              <p className="text-xs text-gray-500">
                {user?.email || "email@example.com"}
              </p>
            </div>

            <ChevronDown size={18} className="text-gray-500" />
          </button>

          {/* Dropdown */}
          {open && (
            <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-200 rounded-2xl shadow-lg overflow-hidden z-50">
              {/* Top User Info */}
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-semibold">
                  {user?.user_name
                    ? user.user_name.charAt(0).toUpperCase()
                    : "U"}
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {user?.user_name || "User"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.email || "email@example.com"}
                  </p>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <button
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => {
                    toast.info("My Profile clicked!");
                    setOpen(false);
                  }}
                >
                  <User size={18} className="text-gray-500" />
                  My Profile
                </button>
{/* 
                <button
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  onClick={() => {
                    toast.info("Settings clicked!");
                    setOpen(false);
                  }}
                >
                  <Settings size={18} className="text-gray-500" />
                  Settings
                </button>

                <button
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center justify-between"
                  onClick={() => {
                    toast.info("Billing clicked!");
                    setOpen(false);
                  }}
                >
                  <span className="flex items-center gap-2">
                    <CreditCard size={18} className="text-gray-500" />
                    Billing
                  </span>

                  <span className="min-w-[22px] h-[22px] rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    4
                  </span>
                </button> */}

                <div className="my-2 border-t border-gray-100"></div>

                <button
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  onClick={handleLogout}
                >
                  <LogOut size={18} />
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden px-4 pb-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center text-gray-400">
            <Search size={18} />
          </span>
          <input
            type="text"
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-300"
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
