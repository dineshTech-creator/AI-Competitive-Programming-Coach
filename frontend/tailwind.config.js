/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0B1220",
        surface: "#111B2E",
        card: "#16213A",
        accent: "#5FB4A2",
        muted: "#A3B3C6",
      },
      boxShadow: {
        soft: "0 10px 30px rgba(0,0,0,0.4)",
      },
    },
  },
  plugins: [],
};
