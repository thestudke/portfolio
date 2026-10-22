import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages 的项目站点部署在 /<repo>/ 下，需要 base；Vercel / Cloudflare / 自有域名用 '/'。
// 由环境变量传入，避免改代码：BASE_PATH=/portfolio/ npm run build
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  server: { port: 5173, host: '127.0.0.1' },
  preview: { port: 4173, host: '127.0.0.1' },
})
