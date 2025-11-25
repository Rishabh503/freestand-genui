"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import { Menu, X } from "lucide-react";

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { isSignedIn } = useUser();

  return (
    <nav className="w-full fixed top-0 left-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex justify-between items-center">

      {/* Brand */}
      <Link
        href="/"
        className="text-2xl font-bold bg-gradient-to-b from-gray-300 to-gray-500 bg-clip-text text-transparent"
      >
        Lesson Start
      </Link>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-6">
        <Link href="/dashboard" className="text-gray-300 tracking-wide">
          Dashboard
        </Link>
        <Link href="/generator" className="text-gray-300 tracking-wide">
          Generator
        </Link>

        {!isSignedIn ? (
          <SignInButton>
            <button className="bg-white text-black px-4 py-2 rounded-full font-semibold tracking-wide">
              Sign In
            </button>
          </SignInButton>
        ) : (
          <UserButton afterSignOutUrl="/" />
        )}
      </div>

      {/* Mobile Menu Button */}
      <button className="md:hidden text-gray-300" onClick={() => setOpen(!open)}>
        {open ? <X size={28} /> : <Menu size={28} />}
      </button>

      {/* Mobile Dropdown */}
      {open && (
        <div className="absolute top-16 left-0 w-full bg-black/95 backdrop-blur-md border-t border-white/10 px-6 py-4 flex flex-col gap-4 md:hidden">

          <Link href="/dashboard" className="text-gray-300 tracking-wide">
            Dashboard
          </Link>
          <Link href="/generator" className="text-gray-300 tracking-wide">
            Generator
          </Link>

          {!isSignedIn ? (
            <SignInButton>
              <button className="bg-white text-black px-4 py-2 rounded-full font-semibold tracking-wide">
                Sign In
              </button>
            </SignInButton>
          ) : (
            <UserButton afterSignOutUrl="/" />
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
