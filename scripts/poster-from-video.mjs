/**
 * 从视频里抽一帧当封面（poster），不需要 ffmpeg。
 * 用无头 Edge 加载视频 → seek 到指定秒 → canvas 截图 → 存 PNG。
 *
 * 用法：
 *   node scripts/poster-from-video.mjs <视频文件> <输出png> [秒]
 * 例：
 *   node scripts/poster-from-video.mjs public/media/02-rag.mp4 public/thumbs/02-rag.png 3
 */
import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'

const input = process.argv[2]
const output = process.argv[3] || 'poster.png'
const at = Number(process.argv[4] || 3)

if (!input) {
  console.error('用法: node scripts/poster-from-video.mjs <视频文件> <输出png> [秒]')
  process.exit(1)
}

const absIn = path.resolve(input)
const ext = path.extname(absIn).slice(1).toLowerCase()
const mime =
  ext === 'mp4' ? 'video/mp4' : ext === 'webm' ? 'video/webm' : ext === 'mov' ? 'video/quicktime' : 'video/mp4'
// 支持直接给 http(s) 地址（大文件走 dev server / 静态服务器更快，不用塞 data URL）
const isUrl = /^https?:\/\//i.test(input)
const src = isUrl ? input : `data:${mime};base64,${fs.readFileSync(absIn).toString('base64')}`

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--autoplay-policy=no-user-gesture-required'],
})
const page = await browser.newPage()

// 关键：URL 模式必须先落到同源页面，否则 about:blank 是不透明源，媒体请求会被拦（video decode failed）
const srcUrl = isUrl ? new URL(src) : null
if (srcUrl) {
  await page.goto(`${srcUrl.origin}/`, { waitUntil: 'domcontentloaded' })
} else {
  await page.goto('about:blank')
}

const shot = await page.evaluate(
  async ({ src, at }) => {
    const v = document.createElement('video')
    v.src = src
    v.muted = true
    v.preload = 'auto'
    document.body.appendChild(v)
    await new Promise((res, rej) => {
      v.onloadeddata = res
      v.onerror = () => rej(new Error('video decode failed'))
      setTimeout(() => rej(new Error('load timeout')), 20000)
    })
    v.currentTime = Math.min(at, Math.max(0.1, (isFinite(v.duration) ? v.duration : at) - 0.5))
    await new Promise((res) => {
      v.onseeked = res
      setTimeout(res, 2500)
    })
    const cv = document.createElement('canvas')
    cv.width = v.videoWidth || 1280
    cv.height = v.videoHeight || 720
    cv.getContext('2d').drawImage(v, 0, 0, cv.width, cv.height)
    return { data: cv.toDataURL('image/png'), w: cv.width, h: cv.height }
  },
  { src: srcUrl ? srcUrl.pathname + srcUrl.search : src, at }
)

await browser.close()

const buf = Buffer.from(shot.data.split(',')[1], 'base64')
fs.mkdirSync(path.dirname(path.resolve(output)), { recursive: true })
fs.writeFileSync(path.resolve(output), buf)
console.log(
  JSON.stringify(
    { out: path.resolve(output), size: `${shot.w}x${shot.h}`, kb: Math.round(buf.length / 1024) },
    null,
    2
  )
)
