/ @type {import('tailwindcss').Config} */

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
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
        // Paleta principal unificada con azul cyan
        aesthetic: {
          // Azul primario y sus variaciones
          'cyan': '#0891b2',
          'cyan-hover': '#0e7490',
          'cyan-light': '#06b6d4',
          'cyan-lighter': '#67e8f9',
          'cyan-lightest': '#e0f7fa',
          'cyan-dark': '#164e63',
          'cyan-darker': '#0c4a6e',
          
          // Grises y neutros minimalistas
          'blanco': '#ffffff',
          'gris-claro': '#f8fafc',
          'gris-medio': '#64748b',
          'gris-profundo': '#334155',
          'gris-oscuro': '#1e293b',
        },
        
        // Paleta clinic del archivo 2 (más completa)
        clinic: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#21d4fd',
          500: '#17c1e8',
          600: '#08a1c4',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        
        // Estados y alertas con diseño limpio
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
        
        // Colores home actualizados
        home: {
          50: "rgba(240, 251, 255, 1)",
          75: "rgba(103, 232, 249, 1)",
          100: "#0891b2"
        },
        
        "light-blue": "#0891b2",
        
        // Colores base de shadcn/ui
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
        
        // Sidebar del archivo 2
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          'primary-foreground': "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          'accent-foreground': "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      
      keyframes: {
        // Animaciones básicas
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        
        // Animaciones adicionales del archivo 2
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' }
        }
      },
      
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        'fade-in': 'fade-in 0.5s ease-out',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite'
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} 