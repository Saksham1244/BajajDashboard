/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter Tight"', 'Inter', 'sans-serif'],
      },
      colors: {
        brand: {
          dark: '#0A1931',       // From palette (Very dark navy)
          primary: '#1A3D63',    // From palette (Dark blue)
          accent: '#4A7FA7',     // From palette (Steel blue)
          secondary: '#B3CFE5',  // From palette (Light blue)
          bg: '#F6FAFD',         // From palette (Icy white/blue)
          
          // Fallback UI states
          danger: '#FA5D29',  
          success: '#52c67e', 
          warning: '#ffc107',
          light: '#ffffff',
        }
      },
      boxShadow: {
        'soft': '0 4px 20px 0 rgba(10, 25, 49, 0.05)', // Tinted shadow with brand-dark
        'inner-soft': 'inset 0 2px 4px 0 rgba(10, 25, 49, 0.02)',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      }
    },
  },
  plugins: [],
}
