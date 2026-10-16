import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // IEC brand palette: split-complementary scheme on red-violet (brand),
        // with yellow (accent) and green (Tailwind emerald) as the two complements.
        brand: {
          50: "#fef1f9",
          100: "#fde4f4",
          200: "#fac9ea",
          300: "#f5a3d8",
          400: "#ec6cc0",
          500: "#d1349c",
          600: "#b8237f",
          700: "#961b68",
          800: "#7a1955",
          900: "#651a48",
          950: "#3f0729",
        },
        accent: {
          50: "#fefce8",
          100: "#fef9c3",
          200: "#fef08a",
          300: "#fde047",
          400: "#facc15",
          500: "#eab308",
          600: "#a16207",
          700: "#854d0e",
          800: "#713f12",
          900: "#5c330e",
          950: "#422006",
        },
        // Violet-tinted near-black surfaces for the dark public site.
        ink: {
          800: "#1c1424",
          900: "#130d18",
          950: "#0c0810",
          990: "#08050b",
        },
        // Neutrals re-tinted toward violet so greys sit with the brand colour everywhere.
        slate: {
          50: "#faf8fb",
          100: "#f4f1f6",
          200: "#e7e2eb",
          300: "#d3cbd9",
          400: "#a99fb4",
          500: "#776c82",
          600: "#5d5368",
          700: "#453c4f",
          800: "#2c2534",
          900: "#1c1623",
          950: "#110c16",
        },
        portal: {
          bg: "var(--portal-bg)",
          surface: "var(--portal-surface)",
          sidebar: "var(--portal-sidebar)",
          border: "var(--portal-border)",
          text: "var(--portal-text)",
          muted: "var(--portal-muted)",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ["var(--font-display)", "Space Grotesk", "sans-serif"],
        mono: ["var(--font-mono)", "JetBrains Mono", "monospace"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "pulse-subtle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-subtle": "pulse-subtle 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        float: "float 6s ease-in-out infinite",
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(209, 52, 156, 0.4)",
        "glow-cyan": "0 0 25px -5px rgba(250, 204, 21, 0.3)",
        "glow-subtle": "0 0 15px -3px rgba(255, 255, 255, 0.08)",
        portal: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        "portal-card": "0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
