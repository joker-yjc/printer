import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import monaco from '@tomjs/vite-plugin-monaco-editor'
import path from 'path'
import { mockServerPlugin } from './mock/server'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    monaco({ local: true }),
    mockServerPlugin(),  // Mock API 服务插件
  ],
  resolve: {
    alias: mode === 'production'
      ? undefined  // 生产构建使用 npm 包
      : {
          // 本地开发使用当前目录下的 SDK 源码
          '@jcyao/print-sdk': path.resolve(__dirname, '../sdk/src/index.ts'),
        },
  },
}))
