/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './App.{js,jsx,ts,tsx}',
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
    './screens/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#121212',
        surface: '#1E1E1E',
        surfaceMuted: '#2E2E2E',
        primary: '#0D47A1',
        danger: '#D32F2F',
        muted: '#AAAAAA',
      },
    },
  },
  plugins: [],
};
