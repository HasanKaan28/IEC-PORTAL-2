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
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // IEC brand palette: the navy of the club seal (brand-700 is the seal's own #154a7f), with
        // honey yellow (accent) and leaf green (emerald) as warm complements. brand-600 passes 7:1
        // on white, so it carries buttons, links and headings.
        brand: {
          50: "#f0f6fc",
          100: "#dde9f6",
          200: "#bcd3ec",
          300: "#8db3dc",
          400: "#5a8cc5",
          500: "#336daa",
          600: "#1f5a94",
          700: "#154a7f",
          800: "#143e69",
          900: "#133556",
          950: "#0b2038",
        },
        // Honey yellow plus the shadcn-style DEFAULT/foreground tokens driven by CSS variables.
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
          50: "#fefbed",
          100: "#fcf3cf",
          200: "#f9e7a0",
          300: "#f4d56b",
          400: "#ecc246",
          500: "#d9a92a",
          600: "#b5861d",
          700: "#8c651a",
          800: "#73521b",
          900: "#61451b",
          950: "#38260b",
        },
        // Leaf green replaces Tailwind's teal-leaning emerald so success states match the palette.
        emerald: {
          50: "#f2f8f4",
          100: "#e0f0e5",
          200: "#c2e1cc",
          300: "#96cba8",
          400: "#65ae7f",
          500: "#43925f",
          600: "#33774b",
          700: "#2b5f3e",
          800: "#264d34",
          900: "#21402c",
          950: "#0f2318",
        },
        // Page background: soft cool grey-blue rather than white; most pages also paint a colour flow.
        canvas: "#f2f5fa",
        // Near-black navy, kept only for the optional projector mode of the live attendance screen.
        ink: {
          800: "#14223a",
          900: "#0d182b",
          950: "#08101f",
          990: "#050b16",
        },
        // Neutrals: Tailwind's cool blue-grey slate, which sits naturally next to the seal navy.
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
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
        // Shadows are tinted with the brand hue instead of black, so they read soft on the light theme.
        glow: "0 8px 24px -8px rgba(31, 90, 148, 0.45)",
        "glow-cyan": "0 8px 24px -10px rgba(217, 169, 42, 0.45)",
        "glow-subtle": "0 1px 2px rgba(15, 30, 55, 0.04), 0 8px 24px -12px rgba(15, 30, 55, 0.12)",
        soft: "0 1px 2px rgba(15, 30, 55, 0.05), 0 12px 32px -16px rgba(15, 30, 55, 0.18)",
        portal: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        "portal-card": "0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
