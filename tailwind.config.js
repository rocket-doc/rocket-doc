/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './lib/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {},
  },
  safelist: [{ pattern: /bg-gray-/, group: 0 }, 'dark:bg-[#2c2c2c]'],
  darkMode: 'class',
};
