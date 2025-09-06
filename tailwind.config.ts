// tailwind.config.ts
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
        sans: ['Inter', 'sans-serif'],
      },
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
        'sky-blue': '#4c98f0',
        'bloom-pink': '#ff6b81',
        'pinkish-blue': '#8a9cff',
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
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
      animation: {
        'glow-blur': 'glow-enter-blur 1s ease 0.5s forwards',
        'glow-stroke': 'glow-enter-stroke 1.5s ease-in-out 0.5s forwards',
        'fade-in-up-1': 'fade-in-up 0.5s ease-out 0.2s forwards',
        'fade-in-up-2': 'fade-in-up 0.5s ease-out 0.4s forwards',
        'fade-in-up-3': 'fade-in-up 0.5s ease-out 0.6s forwards',
        'fade-in-up-4': 'fade-in-up 0.5s ease-out 0.8s forwards',
      },
    },
  },
  plugins: [],
};
export default config;