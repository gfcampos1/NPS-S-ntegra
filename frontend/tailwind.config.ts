/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
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
        // Paleta Síntegra - Baseada na identidade visual
        primary: {
          50: '#e8f7fd',   // Azul muito claro
          100: '#c9edfb',  // Azul claro suave
          200: '#9de2f9',  // Azul claro
          300: '#6dd5f6',  // Azul claro vibrante
          400: '#4dc9f3',  // Azul céu
          500: '#4DB5E8',  // Azul Síntegra principal (do logo)
          600: '#1E9FD8',  // Azul médio
          700: '#1789be',  // Azul médio escuro
          800: '#2B5C9E',  // Azul corporativo (do logo)
          900: '#1e4177',  // Azul escuro
        },
        secondary: {
          50: '#f5f5f5',   // Cinza muito claro
          100: '#e5e5e5',  // Cinza claro
          200: '#d4d4d4',  // Cinza médio claro
          300: '#a3a3a3',  // Cinza médio
          400: '#A8A8A8',  // Cinza Síntegra (do logo)
          500: '#737373',  // Cinza
          600: '#525252',  // Cinza escuro
          700: '#3D3D3D',  // Cinza Síntegra escuro (do logo)
          800: '#262626',  // Cinza muito escuro
          900: '#171717',  // Quase preto
        },
        // Cores de status preservadas
        status: {
          green: '#52c41a',
          yellow: '#faad14',
          red: '#ff4d4f',
        },
        // Cores NPS
        nps: {
          promotor: '#10B981',
          neutro: '#F59E0B',
          detrator: '#EF4444',
        },
        // Cores de Rating (1-5)
        rating: {
          1: '#EF4444',
          2: '#F97316',
          3: '#F59E0B',
          4: '#84CC16',
          5: '#10B981',
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
        "fade-in": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        "slide-up": {
          from: { 
            opacity: 0,
            transform: "translateY(20px)",
          },
          to: { 
            opacity: 1,
            transform: "translateY(0)",
          },
        },
        "pulse": {
          "0%, 100%": { opacity: 1 },
          "50%": { opacity: 0.5 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "pulse": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      boxShadow: {
        'brand': '0 10px 20px rgba(65, 105, 177, 0.15)',
        'brand-lg': '0 20px 40px rgba(65, 105, 177, 0.2)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'sans-serif'],
        mono: ['var(--font-mono)', 'JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
