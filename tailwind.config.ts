const config = {
  darkMode: ['class'],
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-supermarket': 'linear-gradient(135deg, #16a34a 0%, #22c55e 40%, #bbf7d0 100%)',
        'gradient-clothes': 'linear-gradient(135deg, #7c3aed 0%, #a855f7 45%, #ddd6fe 100%)',
        'gradient-medicines': 'linear-gradient(135deg, #0284c7 0%, #06b6d4 40%, #bae6fd 100%)',
        'gradient-promo': 'linear-gradient(120deg, rgba(255,255,255,0.35), rgba(255,255,255,0.08))'
      },
      boxShadow: {
        glass: '0 10px 30px rgba(15, 23, 42, 0.16)'
      },
      backdropBlur: {
        glass: '10px'
      }
    }
  },
  plugins: []
};

export default config;
