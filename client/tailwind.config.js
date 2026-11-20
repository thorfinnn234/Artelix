/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        gray: { 50: "#fafbf7", 100: "#eef2e8", 200: "#dfe5db", 300: "#c3cec0", 400: "#7c897d", 500: "#67746c", 600: "#506156", 700: "#3c5043", 800: "#293e31", 900: "#182c24" },
        green: {
          50:  "#eef2e8",
          100: "#c0dd97",
          200: "#97c459",
          400: "#4caf72",
          500: "#224f36",
          600: "#326947",
          700: "#0f4a28",
          800: "#085020",
          900: "#052e12",
        },
        dark: {
          bg:      "#101a14",
          surface: "#1a281f",
          card:    "#203126",
          border:  "#304034",
        }
      },
      fontFamily: {
        heading: ["Plus Jakarta Sans", "sans-serif"],
        body:    ["DM Sans", "sans-serif"],
      },
      borderRadius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "20px",
      },
      fontSize: {
        "2xs": "11px",
        xs:   "13px",
        sm:   "14px",
        base: "15px",
        lg:   "17px",
        xl:   "20px",
        "2xl":"24px",
        "3xl":"30px",
        "4xl":"36px",
      }
    },
  },
  plugins: [],
}