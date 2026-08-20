import type { Config } from "tailwindcss";

const config: Config = {
     // Fix: Removed the brackets. Use a simple string.
     darkMode: "class",
     content: [
          "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
          "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
          "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
     ],
     theme: {
          extend: {
               // Your existing extensions...
          },
     },
     plugins: [],
};

export default config;