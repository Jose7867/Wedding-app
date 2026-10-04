/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ivory: "#FAF6EF",
        wine: {
          DEFAULT: "#6B2737",
          light: "#8A3B4D",
          dark: "#4A1B27",
        },
        gold: {
          DEFAULT: "#B8935F",
          light: "#D4B896",
        },
        sage: "#8A9A80",
        charcoal: "#2E2A26",
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "serif"],
        body: ["Karla", "sans-serif"],
        script: ["'Petit Formal Script'", "cursive"],
      },
      backgroundImage: {
        "grain": "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        fadeInUp: "fadeInUp 0.8s ease-out forwards",
      },
    },
  },
  plugins: [],
};
