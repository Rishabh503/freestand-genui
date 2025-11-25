"use client";

import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center px-4">

      <div className="flex flex-col items-center text-center mt-12">
        {/* Main Title */}
        <h1 className="text-6xl md:text-7xl font-extrabold bg-gradient-to-b from-gray-300 to-gray-600 bg-clip-text text-transparent">
          Lesson Start
        </h1>

        {/* Tagline */}
        <p className="text-gray-400 tracking-widest mt-4">
          create interactive lesson to start a topic with
        </p>
        

        {/* CTA Button */}
        <Link
          href="/generator"
          className="mt-8 bg-white text-black px-8 py-3 rounded-full font-semibold tracking-wide"
        >
          Lets Start 
        </Link>
      </div>
    </div>
  );
}
