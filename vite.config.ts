import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // ドメイン直下でも /kateinoigaku/ でも同じファイルで動く
  base: './',
})
