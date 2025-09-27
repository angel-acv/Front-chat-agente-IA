/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        neon: {
          pink: "#ff2bd6",
          blue: "#00e7ff",
          purple: "#7c3aed",
          lime: "#b4ff39"
        }
      },
      boxShadow: {
        neon: "0 0 10px rgba(124,58,237,.5), 0 0 30px rgba(0,231,255,.25)"
      },
      backgroundImage: {
        "mesh":
          "radial-gradient(1200px 600px at 10% 10%, rgba(124,58,237,.12), transparent 60%), radial-gradient(800px 400px at 90% 20%, rgba(0,231,255,.12), transparent 60%), radial-gradient(1000px 500px at 20% 90%, rgba(180,255,57,.10), transparent 60%), radial-gradient(600px 300px at 80% 80%, rgba(255,43,214,.10), transparent 60%)"
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "-700px 0" },
          "100%": { backgroundPosition: "700px 0" }
        },
        float: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" }
        },
        glow: {
          "0%,100%": { filter: "drop-shadow(0 0 6px rgba(124,58,237,.6))" },
          "50%": { filter: "drop-shadow(0 0 12px rgba(0,231,255,.9))" }
        },
        "gradient-x": {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" }
        },
        tilt: {
          "0%,100%": { transform: "rotate(-.6deg)" },
          "50%": { transform: "rotate(.6deg)" }
        },
        blob: {
          "0%": { transform: "translate(0px, 0px) scale(1)" },
          "33%": { transform: "translate(12px, -18px) scale(1.05)" },
          "66%": { transform: "translate(-16px, 10px) scale(0.98)" },
          "100%": { transform: "translate(0px, 0px) scale(1)" }
        }
      },
      animation: {
        shimmer: "shimmer 2s linear infinite",
        float: "float 6s ease-in-out infinite",
        glow: "glow 2.8s ease-in-out infinite",
        "gradient-x": "gradient-x 8s ease infinite",
        tilt: "tilt 10s ease-in-out infinite",
        blob: "blob 12s ease-in-out infinite"
      }
    }
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")]
}