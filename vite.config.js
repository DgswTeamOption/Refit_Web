import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

const PUBLIC_AUTH_PATHS_WITHOUT_COOKIES = new Set([
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/google/login',
  '/api/auth/google/register',
  '/api/user/email/send-code',
  '/api/user/email/verify-code',
])

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
    proxy: {
      "/api": {
        target: "https://refit.team",
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyRequest, request) => {
            const requestPath = new URL(request.url || '/', 'http://vite.local').pathname
            if (PUBLIC_AUTH_PATHS_WITHOUT_COOKIES.has(requestPath)) {
              proxyRequest.removeHeader('cookie')
            }
          })
        },
      },
      "/uploads": {
        target: "https://refit.team",
        changeOrigin: true,
      },
    },
  },
})
