import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import monaco from '@tomjs/vite-plugin-monaco-editor'
import path from 'path'
import { mockServerPlugin } from './mock/server'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: './',
  define: {
    // 通过 --mode demo 构建时，强制注入 VITE_USE_MOCK=true
    // 避免 Vercel 等平台的 shell 环境变量语法不生效问题
    'import.meta.env.VITE_USE_MOCK': mode === 'demo' ? '"true"' : '"false"',
  },
  plugins: [
    react(),
    monaco({ local: true }),
    mockServerPlugin(),  // Mock API 服务插件
  ],
  resolve: {
    alias: mode !== 'development'
      ? undefined
      : {
        // 本地开发使用当前目录下的 SDK 源码
        '@jcyao/print-sdk': path.resolve(__dirname, '../sdk/src/index.ts'),
      },
  },
}))
