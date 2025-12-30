import type { Config } from "tailwindcss";

import tailwindcssAnimate from "tailwindcss-animate";

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
        "primary-green": "#0f7412ff", // Darker green for sidebar
        "secondary-green": "#E8F5E9", // Lighter green for background
        "card-background": "var(--card-background)",
        // New color palette for Service Provider Dashboard
        "sp-primary-light": "#8b5cf6", // Indigo 400
        "sp-primary-DEFAULT": "#6d28d9", // Indigo 700
        "sp-primary-dark": "#4c1d95", // Indigo 900
        "sp-accent-light": "#34d399", // Emerald 400
        "sp-accent-DEFAULT": "#059669", // Emerald 600
        "sp-accent-dark": "#065f46", // Emerald 900
        "sp-warning-light": "#fca5a5", // Red 300
        "sp-warning-DEFAULT": "#ef4444", // Red 500
        "sp-warning-dark": "#b91c1c", // Red 800
        "sp-neutral-light": "#d1d5db", // Gray 300
        "sp-neutral-DEFAULT": "#6b7280", // Gray 500
        "sp-neutral-dark": "#374151", // Gray 700
        "sp-off-white": "#f9fafb" // Gray 50
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
        "fade-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(10px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
        "slide-in": {
          "0%": {
            transform: "translateX(-10px)",
            opacity: "0"
          },
          "100%": {
            transform: "translateX(0)",
            opacity: "1"
          }
        },
        "fade-in-down": {
          "0%": {
            opacity: "0",
            transform: "translateY(-10px)"
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)"
          }
        },
        "bounce-in": {
          "0%": {
            transform: "scale(0.8)",
            opacity: "0"
          },
          "70%": {
            transform: "scale(1.05)",
            opacity: "1"
          },
          "100%": {
            transform: "scale(1)",
          }
        },
        "pulse-light": {
          "0%, 100%": {
            opacity: "1"
          },
          "50%": {
            opacity: "0.8"
          }
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out",
        "slide-in": "slide-in 0.5s ease-out",
        "fade-in-down": "fade-in-down 0.7s ease-out",
        "bounce-in": "bounce-in 0.5s ease-out",
        "pulse-light": "pulse-light 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      backgroundImage: {
        'gradient-hero': 'var(--gradient-hero)',
        'gradient-accent': 'var(--gradient-accent)',
      },
      boxShadow: {
        'soft': 'var(--shadow-soft)',
        'hover': 'var(--shadow-hover)',
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config;
