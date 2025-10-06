/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '2rem',
        '2xl': '2.5rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1440px',
      }
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "Helvetica", "Arial", "sans-serif"],
      },
      colors: {
        primary: {
          50: '#eef7f4',
          100: '#d9efe6',
          200: '#b6dfcf',
          300: '#8ecbb5',
          400: '#67b79a',
          500: '#3aa07c',   // CareQ green
          600: '#2f8869',
          700: '#256e56',
          800: '#1c5543',
          900: '#153f32',
        },
        accent: {
          500: '#ff8a00',   // accent orange
          600: '#e57800',
        },
        neutral: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1f2937',
          900: '#0f172a',
        },
        success: '#16a34a',
        warning: '#f59e0b',
        danger: '#ef4444',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        card: '0 6px 20px rgba(16, 24, 40, 0.08)',
      }
    },
  },
  plugins: [],
}
