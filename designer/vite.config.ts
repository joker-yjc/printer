import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // 本地 SDK 路径映射，用于开发和调试
      '@jcyao/print-sdk': path.resolve(__dirname, '../sdk/src/index.ts'),
    },
  },
})
