/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        accent:"var(--accent-color)",
      },
      backgroundImage: {
        "gradient-radial":
          "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        text: "text 5s ease infinite",
      },
      keyframes: {
        text: {
          "0%, 100%": {
            "background-size": "200% 200%",
            "background-position": "left center",
          },
          "50%": {
            "background-size": "200% 200%",
            "background-position": "right center",
          },
        },
      },
    },
  },
  plugins: [require("daisyui"), require("tailwindcss-animate"), require("daisify-shadcn")],
  daisyui: {
    //  3 themes
    themes: [
      {
        light: {
          ...require("daisyui/src/theming/themes")["wireframe"],
          "color-scheme": "light",
          fontFamily: "",
          primary: "#433922",
          secondary: "#34d399",
          accent: "#343232",
          neutral: "#ffe4e6",
          info: "#62c2d5",
          accent: "#966919",
          success: "#25bbac",
          warning: "#c88314",
          error: "#e77982",
          "--rounded-btn": "0.5rem",
          "--tab-border": "2px",
          "--tab-radius": ".5rem",
        },
        dark: {
          ...require("daisyui/src/theming/themes")["wireframe"],
          accent: "#343232",
          fontFamily: "",
          "base-100": "#000000",
          "base-200": "#0D0D0D",
          "base-300": "#1A1919",
          neutral: "#272626",
          "color-scheme": "dark",
          primary: "#433922",
          secondary: "#34d399",
          accent: "#966919",
          info: "#62c2d5",
          success: "#25bbac",
          warning: "#c88314",
          error: "#e77982",
          "--rounded-btn": "0.5rem",
          "--tab-border": "2px",
          "--tab-radius": ".5rem",
        },
      },
    ],
  },
};
