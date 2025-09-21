/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        dark: {
          DEFAULT: "#0c0f2c",  
          card: "#12163d",      
        },
        accent: {
          blue: "#3b82f6",      
          purple: "#8b5cf6",
        },
      },
      boxShadow: {
        card: "0 8px 20px rgba(0,0,0,0.3)",
        glow: "0 0 20px rgba(59,130,246,0.5)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),  
  ],
}
