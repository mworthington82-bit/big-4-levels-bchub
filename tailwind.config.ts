import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        // ThreadWorks house faces; Calibri/Carlito stay as fallbacks. The accessibility
        // panel's Arial / OpenDyslexic / Calibri choices override these (index.css).
        display: ['"Space Grotesk"', 'Calibri', 'Carlito', 'system-ui', 'sans-serif'],
        sans: ['"Space Grotesk"', 'Calibri', 'Carlito', 'system-ui', 'sans-serif'],
        serif: ['Fraunces', 'Georgia', 'serif'],
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
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        b4: {
          strong: "hsl(var(--b4-strong) / <alpha-value>)",
          ink: "hsl(var(--b4-ink) / <alpha-value>)",
          deep: "hsl(var(--b4-deep) / <alpha-value>)",
          "deep-hover": "hsl(var(--b4-deep-hover) / <alpha-value>)",
          flame: "hsl(var(--b4-flame) / <alpha-value>)",
          "on-flame": "hsl(var(--b4-on-flame) / <alpha-value>)",
          "flame-text": "hsl(var(--b4-flame-text) / <alpha-value>)",
          "flame-ink": "hsl(var(--b4-flame-ink) / <alpha-value>)",
          "flame-soft": "hsl(var(--b4-flame-soft) / <alpha-value>)",
          line: "hsl(var(--b4-line) / <alpha-value>)",
          muted: "hsl(var(--b4-muted) / <alpha-value>)",
          wash: "hsl(var(--b4-wash) / <alpha-value>)",
          "wash-2": "hsl(var(--b4-wash-2) / <alpha-value>)",
          "wash-3": "hsl(var(--b4-wash-3) / <alpha-value>)",
          navy: "hsl(var(--b4-navy) / <alpha-value>)",
        },
        tool: {
          teams: "hsl(var(--tool-teams))",
          "teams-bg": "hsl(var(--tool-teams-bg))",
          canva: "hsl(var(--tool-canva))",
          "canva-bg": "hsl(var(--tool-canva-bg))",
          edpuzzle: "hsl(var(--tool-edpuzzle))",
          "edpuzzle-bg": "hsl(var(--tool-edpuzzle-bg))",
          copilot: "hsl(var(--tool-copilot))",
          "copilot-bg": "hsl(var(--tool-copilot-bg))",
        },
        gold: {
          DEFAULT: "hsl(var(--gold))",
          dark: "hsl(var(--gold-dark))",
          light: "hsl(var(--gold-light))",
        },
        ink: {
          DEFAULT: "hsl(var(--ink))",
          mid: "hsl(var(--ink-mid))",
          soft: "hsl(var(--ink-soft))",
        },
        explorer: {
          DEFAULT: "hsl(var(--explorer))",
          bg: "hsl(var(--explorer-bg))",
        },
        practitioner: {
          DEFAULT: "hsl(var(--practitioner))",
          bg: "hsl(var(--practitioner-bg))",
        },
        leader: {
          DEFAULT: "hsl(var(--leader))",
          bg: "hsl(var(--leader-bg))",
        },
        inclusion: {
          DEFAULT: "hsl(var(--inclusion))",
          dark: "hsl(var(--inclusion-dark))",
          light: "hsl(var(--inclusion-light))",
          bg: "hsl(var(--inclusion-bg))",
        },
      },
      // ThreadWorks felt squares: every soft corner is a 4px square (full stays round
      // for circles, dots and progress bars).
      borderRadius: {
        sm: "2px",
        DEFAULT: "var(--radius)",
        md: "var(--radius)",
        lg: "var(--radius)",
        xl: "var(--radius)",
        "2xl": "var(--radius)",
        "3xl": "var(--radius)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "lift": {
          "0%": { transform: "translateY(0px)" },
          "100%": { transform: "translateY(-4px)" },
        },
        // ThreadWorks "Rise": the one entrance (kit v4). Also backs the long-used
        // but previously undefined `animate-fade-in`.
        "tw-rise": {
          from: { opacity: "0", transform: "translateY(6px) scale(0.98)" },
          to: { opacity: "1", transform: "none" },
        },
      },
      // Hard offset shadows, no blur: small ones in the line colour for cards,
      // big ones in ink for windows (dialogs, popovers, menus).
      boxShadow: {
        card: "var(--shadow-card)",
        hover: "var(--shadow-hover)",
        lift: "var(--shadow-lift)",
        sm: "var(--shadow-card)",
        DEFAULT: "var(--shadow-card)",
        md: "var(--shadow-card)",
        lg: "var(--shadow-lift)",
        xl: "var(--shadow-lift)",
        "2xl": "var(--shadow-lift)",
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "lift": "lift 0.2s ease-out forwards",
        "tw-rise": "tw-rise 350ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "tw-rise 350ms cubic-bezier(0.22, 1, 0.36, 1) both",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
