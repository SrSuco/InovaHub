import daisyui from 'daisyui';

const forma = {
  '--rounded-box': '0.75rem',
  '--rounded-btn': '0.5rem',
  '--rounded-badge': '0.375rem',
};

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [daisyui],
  daisyui: {
    logs: false,
    themes: [
      {
        inovahub: {
          primary: '#AB218E',
          'primary-content': '#ffffff',
          secondary: '#00703C',
          'secondary-content': '#ffffff',
          accent: '#83C45B',
          'accent-content': '#10240a',
          neutral: '#2a2230',
          'neutral-content': '#f4eef6',
          'base-100': '#ffffff',
          'base-200': '#f6f3f7',
          'base-300': '#e9e3ec',
          'base-content': '#221b26',
          info: '#1d4ed8',
          'info-content': '#ffffff',
          success: '#15803d',
          'success-content': '#ffffff',
          warning: '#b45309',
          'warning-content': '#ffffff',
          error: '#b91c1c',
          'error-content': '#ffffff',
          ...forma,
        },
      },
      {
        'inovahub-escuro': {
          primary: '#d04cb0',
          'primary-content': '#ffffff',
          secondary: '#3fae6f',
          'secondary-content': '#06170d',
          accent: '#9bd677',
          'accent-content': '#10240a',
          neutral: '#d9cfe0',
          'neutral-content': '#1b1620',
          'base-100': '#1c1720',
          'base-200': '#151118',
          'base-300': '#2b2430',
          'base-content': '#ece6ef',
          info: '#60a5fa',
          success: '#4ade80',
          warning: '#fbbf24',
          error: '#f87171',
          ...forma,
        },
      },
    ],
  },
};
