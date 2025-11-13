import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   experimental: {
    cssChunking: 'loose', 
  }
};

export default nextConfig;
