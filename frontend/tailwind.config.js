/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        brand: {
          DEFAULT: '#2563eb',
          foreground: '#f8fafc',
        },
      },
      boxShadow: {
        smooth: '0 20px 45px rgba(15,23,42,0.12)',
      },
    },
  },
  plugins: [],
};
