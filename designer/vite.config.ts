import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import monaco from '@tomjs/vite-plugin-monaco-editor'
import path from 'path'
import { mockServerPlugin } from './mock/server'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    monaco({ local: true }),
    mockServerPlugin(),  // Mock API 服务插件
  ],
  resolve: {
    alias: {
      // 本地 SDK 路径映射，用于开发和调试
      '@jcyao/print-sdk': path.resolve(__dirname, '../sdk/src/index.ts'),
    },
  },
})
