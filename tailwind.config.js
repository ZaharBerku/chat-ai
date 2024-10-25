/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
    'node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        "blue-700": '#003970',
        "blue-800": "#00234B",
        "blue-900": '#001529',
      },
      width: {
        '280': '280px',
      },
      backgroundImage: {
        'vert-dark-gradient': 'linear-gradient(180deg, rgba(53, 55, 64, 0), #001529 58.85%)',
      }
    },
  },
  plugins: [require('flowbite/plugin')],
}
