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
        primary: '#D32F2F', // Red Alert
        secondary: '#121212', // Black
        background: '#F5F5F5', // Light Grey
        surface: '#FFFFFF', // White
        surfaceVariant: '#EEEEEE', // Light Grey for cards/borders
        warning: '#FBC02D', // Yellow Warning
        text: '#212121', // Dark Grey/Black text
        textSecondary: '#757575', // Grey text
        danger: '#D32F2F',
        muted: '#9E9E9E',
      },
    },
  },
  plugins: [],
};
