/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        green: {
          50:  "#eaf3de",
          100: "#c0dd97",
          200: "#97c459",
          400: "#4caf72",
          500: "#1e7a40",
          600: "#166232",
          700: "#0f4a28",
          800: "#085020",
          900: "#052e12",
        },
        dark: {
          bg:      "#0f1410",
          surface: "#161d17",
          card:    "#1e2820",
          border:  "#243027",
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