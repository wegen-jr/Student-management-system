module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      backgroundSize: { '200%': '200% 200%' },
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
      },
      colors: {
      dashboardBlue: "#3A5F8B"
    },
      keyframes: {
        'gradient-x': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        'particle-move': {
          '0%': { transform: 'translateY(0) translateX(0)', opacity: 0 },
          '30%': { opacity: 0.5 },
          '100%': { transform: 'translateY(-120vh) translateX(50vw)', opacity: 0 },
        },
      },
    },
  },
  plugins: [],
};