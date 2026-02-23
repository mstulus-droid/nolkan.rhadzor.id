/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: '#0df269',
                'primary-dark': '#0bc956',
                'primary-light': '#e8fdf0',
                'background-light': '#f5f8f7',
                'background-dark': '#102217',
                'sidebar-bg': '#f0f4f2',
                'text-primary': '#1a1c1a',
                'text-secondary': '#6e7570',
                gold: '#d9a404',
                danger: '#ef4444',
                'danger-light': '#fef2f2',
                warning: '#f59e0b',
                'warning-light': '#fffbeb',
                success: '#10b981',
            },
            fontFamily: {
                display: ['Inter', 'sans-serif'],
                mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
            },
            borderRadius: {
                DEFAULT: '0.25rem',
                lg: '0.5rem',
                xl: '0.75rem',
                '2xl': '1rem',
                '3xl': '1.5rem',
                full: '9999px',
            },
            boxShadow: {
                soft: '0 4px 20px -2px rgba(0,0,0,0.05)',
                card: '0 2px 8px -1px rgba(0,0,0,0.04)',
                fab: '0 4px 12px rgba(13,242,105,0.35)',
                up: '0 -4px 6px -1px rgba(0,0,0,0.08)',
                sidebar: '2px 0 12px rgba(0,0,0,0.06)',
            },
            animation: {
                'slide-up': 'slideUp 0.3s ease-out',
                'fade-in': 'fadeIn 0.2s ease-out',
                'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
            },
            keyframes: {
                slideUp: {
                    '0%': { transform: 'translateY(100%)' },
                    '100%': { transform: 'translateY(0)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                pulseSoft: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.7' },
                },
            },
        },
    },
    plugins: [],
}
