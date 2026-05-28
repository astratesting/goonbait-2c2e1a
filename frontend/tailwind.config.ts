import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        brand: '#2563eb',
        mint: '#14b8a6'
      },
      boxShadow: {
        soft: '0 20px 60px rgba(15, 23, 42, 0.10)'
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
};

export default config;
