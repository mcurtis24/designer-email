/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand colors
        primary: {
          DEFAULT: '#2563EB',
          hover: '#1D4ED8',
          light: '#DBEAFE',
        },
        // Email-safe colors
        email: {
          black: '#000000',
          darkGray: '#333333',
          gray: '#666666',
          lightGray: '#999999',
          white: '#FFFFFF',
          blue: '#0066CC',
        },
      },
      fontFamily: {
        ui: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['Monaco', '"Courier New"', 'monospace'],
      },
      spacing: {
        '18': '4.5rem',
      },
    },
  },
  plugins: [],
}
