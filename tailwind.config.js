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
        'gradient-aesthetic': 'linear-gradient(135deg, #f0fbff 0%, #f8fafc 100%)',
      },
      colors: {
        // Paleta simplificada solo con #0891b2
        aesthetic: {
          // Azul primario y sus variaciones
          'cyan': '#0891b2',
          'cyan-hover': '#0e7490',
          'cyan-light': '#06b6d4',
          'cyan-lighter': '#67e8f9',
          'cyan-lightest': '#e0f7fa',
          'cyan-dark': '#164e63',
          'cyan-darker': '#0c4a6e',
          
          // Grises y neutros
          'blanco': '#ffffff',
          'gris-claro': '#f8fafc',
          'gris-medio': '#64748b',
          'gris-profundo': '#334155',
          'gris-oscuro': '#1e293b',
        },
        
        // Estados y alertas con la nueva paleta
        success: {
          DEFAULT: '#dcfdf4',
          foreground: '#047857',
        },
        warning: {
          DEFAULT: '#fef3c7',
          foreground: '#d97706',
        },
        error: {
          DEFAULT: '#fef2f2',
          foreground: '#dc2626',
        },
        
        // Colores existentes actualizados
        home: {
          50: "rgba(240, 251, 255, 1)",
          75: "rgba(103, 232, 249, 1)",
          100: "#0891b2" // Cambiado al azul primario
        },
        "light-blue": "#0891b2",
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