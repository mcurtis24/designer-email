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
          DEFAULT: '#027DB3',
          hover: '#015f8a',
          light: '#DBEAFE',
        },
        // Override Tailwind's default blue with custom brand color
        blue: {
          50: '#e6f5fb',
          100: '#cceaf6',
          200: '#99d5ed',
          300: '#66c0e4',
          400: '#33abdb',
          500: '#027DB3', // Main brand color
          600: '#027DB3', // Main brand color
          700: '#015f8a',
          800: '#014766',
          900: '#012f43',
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
