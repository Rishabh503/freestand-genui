/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ".app/lessons/**/*.{js,ts,jsx,tsx,mdx}",
 
    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    // 1. Common Code Block Utilities
    'bg-gray-800', 
    'p-4', 
    'rounded',
    'rounded-lg',
    
    // 2. Syntax Highlighting Text Colors (Use a broad range of colors/shades)
    {
      // Preserves classes like text-red-500, text-blue-400, etc., for multiple colors and shades.
      pattern: /text-(red|green|blue|yellow|indigo|purple|pink|cyan|gray|slate)-(100|200|300|400|500|600|700|800|900)/,
    },
    
    // 3. Any other specific utilities used in the generated HTML
    'font-bold',
    'italic',
    'underline',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}