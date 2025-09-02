// /tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // This tells Tailwind that 'font-sans' should mean the 'Inter' font.
        sans: ['Inter', 'sans-serif'],
      },
      // The rest of your theme config remains the same
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        'glow-enter-blur': {
          '0%': { opacity: '0', filter: 'blur(1px)' },
          '25%': { opacity: '0.7', filter: 'blur(30px)' },
          '100%': { opacity: '0.5', filter: 'blur(60px)' },
        },
        'glow-enter-stroke': {
          '0%': { 'background-position': '0% 0%' },
          '100%': { 'background-position': '100% 100%' },
        },
      },
      animation: {
        'glow-blur': 'glow-enter-blur 1s ease 0.5s forwards',
        'glow-stroke': 'glow-enter-stroke 0.5s ease 0.5s forwards',
      },
    },
  },
  plugins: [],
};
export default config;