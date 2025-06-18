/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
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
      aspectRatio: {
        '7/12': '7 / 12',
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(to right, #e6d7ed, #f2e7f5, #e8f4f0)',
        'gradient-secondary': 'linear-gradient(to bottom, #e6d7ed, #f2e7f5)',
        'gradient-aesthetic': 'linear-gradient(135deg, #faf9fb 0%, #f5f3f7 100%)',
      },
      colors: {
        // Paleta estética principal
        aesthetic: {
          'lavanda': '#e6d7ed',
          'lavanda-hover': '#d6c9e3',
          'rosa': '#f2e7f5',
          'rosa-hover': '#e9d8ee',
          'menta': '#e8f4f0',
          'menta-hover': '#d9ede5',
          'blanco': '#fafafa',
          'gris-claro': '#f5f5f7',
          'gris-medio': '#8b75a6',
          'gris-profundo': '#6b5b73',
        },
        
        // Estados y alertas con la paleta
        success: {
          DEFAULT: '#d4f5e8',
          foreground: '#047857',
        },
        warning: {
          DEFAULT: '#fff2e6',
          foreground: '#ea580c',
        },
        error: {
          DEFAULT: '#ffe6e6',
          foreground: '#dc2626',
        },
        
        // Colores existentes actualizados
        home: {
          50: "rgba(255, 245, 233, 1)",
          75: "rgba(255, 204, 141, 1)",
          100: "#e6d7ed" // Cambiado a lavanda suave
        },
        "light-blue": "var(--light-blue)",
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
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
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
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}