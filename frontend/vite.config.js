import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,       // To jest kluczowe: pozwala na dostęp z zewnątrz kontenera (0.0.0.0)
    port: 5173,       // Wymuszamy port 5173
    watch: {
      usePolling: true, // Ważne dla Linuxa/Dockera, żeby zmiany w kodzie odświeżały stronę
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.js', // Opcjonalne, ale przydatne (zaraz stworzymy)
  },
})