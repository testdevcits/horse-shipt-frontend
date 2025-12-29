/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#1E40AF",
        secondary: "#F59E0B",
        accent: "#10B981",
        danger: "#EF4444",
        light: "#F3F4F6",
        dark: "#111827",
        system: {
          primary: "#BF9B53",
          background: "var(--System-Background, #FEFEFE)",
        },
        toast: {
          info: "#BF9B53",
          success: "#10B981",
          warning: "#F59E0B",
          error: "#EF4444",
        },
        header: "#F2EBDD",
        tabActive: "#997C42",
        scrollbarTrack: "#E5E7EB",
        scrollbarThumb: "#BF9B53",
        systemText: "#333333",
        success: {
          DEFAULT: "#10B981",
          50: "#E6F9F1",
          100: "#C2F0D9",
          200: "#99E7C0",
          300: "#70DDA6",
          400: "#4CD590",
          500: "#26CC77",
          600: "#10B981",
          700: "#0E9A66",
          800: "#0B7B53",
          900: "#075B3A",
        },
        yellow: {
          DEFAULT: "#F59E0B",
          50: "#FFF7E6",
          100: "#FFE9BF",
          200: "#FFD999",
          300: "#FFC966",
          400: "#FFB933",
          500: "#F59E0B",
          600: "#D48809",
          700: "#B27307",
          800: "#8F5C05",
          900: "#6B4603",
        },
      },
      fontFamily: {
        montserrat: ["Montserrat", "sans-serif"],
      },
      fontSize: {
        paragraph: ["18px", "28px"], // font-size: 18px, line-height: 28px
      },
      fontWeight: {
        medium: 500, // font-weight 500
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        custom: "12px",
        full: "9999px",
      },
      screens: {
        xs: "320px",
        sm: "480px",
        md: "768px",
        lg: "1024px",
        xl: "1280px",
        "2xl": "1536px",
      },
      spacing: {
        128: "32rem",
        144: "36rem",
        160: "40rem",
      },
      keyframes: {
        "slide-fade-in": {
          "0%": { transform: "translateY(-20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-fade-out": {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(-20px)", opacity: "0" },
        },
        "slide-down": {
          "0%": { transform: "translateY(-100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "slide-up": {
          "0%": { transform: "translateY(0)", opacity: "1" },
          "100%": { transform: "translateY(-100%)", opacity: "0" },
        },
      },
      animation: {
        "slide-fade-in": "slide-fade-in 0.3s ease-out forwards",
        "slide-fade-out": "slide-fade-out 0.3s ease-in forwards",
        "slide-down": "slide-down 0.3s ease-out forwards",
        "slide-up": "slide-up 0.3s ease-in forwards",
      },
    },
  },
  plugins: [
    function ({ addUtilities }) {
      addUtilities({
        ".hide-scrollbar": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
        },
        ".hide-scrollbar::-webkit-scrollbar": {
          display: "none",
        },
      });
    },
  ],
};
