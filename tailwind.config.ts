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
        // IEC brand palette from the club's colour triangle: violet (brand), honey yellow (accent)
        // and leaf green (emerald). The violet leans blue rather than pink on purpose; brand-600
        // passes 7:1 on white, so it carries buttons, links and headings.
        brand: {
          50: "#f6f3fa",
          100: "#ece5f5",
          200: "#d9cbea",
          300: "#bea5d9",
          400: "#9d78c2",
          500: "#8156aa",
          600: "#6c4294",
          700: "#5a367b",
          800: "#4b2f65",
          900: "#3f2954",
          950: "#261634",
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
        // Page background: soft lavender grey rather than white; most pages also paint a colour flow.
        canvas: "#f4f1f7",
        // Near-black violet, kept only for the optional projector mode of the live attendance screen.
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
        // Shadows are tinted with the brand hue instead of black, so they read soft on the light theme.
        glow: "0 8px 24px -8px rgba(108, 66, 148, 0.45)",
        "glow-cyan": "0 8px 24px -10px rgba(217, 169, 42, 0.45)",
        "glow-subtle": "0 1px 2px rgba(38, 22, 52, 0.04), 0 8px 24px -12px rgba(38, 22, 52, 0.12)",
        soft: "0 1px 2px rgba(38, 22, 52, 0.05), 0 12px 32px -16px rgba(38, 22, 52, 0.18)",
        portal: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.03)",
        "portal-card": "0 4px 6px -1px rgba(0, 0, 0, 0.04), 0 2px 4px -1px rgba(0, 0, 0, 0.02)",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
