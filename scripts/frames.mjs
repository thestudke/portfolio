/**
 * 一次开浏览器，按多个时间点抽帧（不用 ffmpeg）。
 * 用法: node scripts/frames.mjs <http视频地址> <输出目录> <秒1,秒2,...>
 */
import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const url = process.argv[2]
const outDir = process.argv[3]
const times = (process.argv[4] || '5,10,20').split(',').map(Number)

const u = new URL(url)
const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--autoplay-policy=no-user-gesture-required'],
})
const page = await browser.newPage()
await page.goto(`${u.origin}/`, { waitUntil: 'domcontentloaded' })

const shots = await page.evaluate(
  async ({ src, times }) => {
    const v = document.createElement('video')
    v.src = src
    v.muted = true
    v.preload = 'auto'
    document.body.appendChild(v)
    await new Promise((res, rej) => {
      v.onloadeddata = res
      v.onerror = () => rej(new Error('video decode failed'))
      setTimeout(() => rej(new Error('load timeout')), 30000)
    })
    const cv = document.createElement('canvas')
    const out = []
    for (const t of times) {
      v.currentTime = t
      await new Promise((res) => {
        v.onseeked = res
        setTimeout(res, 2000)
      })
      cv.width = v.videoWidth
      cv.height = v.videoHeight
      cv.getContext('2d').drawImage(v, 0, 0, cv.width, cv.height)
      out.push({ t, data: cv.toDataURL('image/png'), w: cv.width, h: cv.height })
    }
    return out
  },
  { src: u.pathname, times }
)

await browser.close()

fs.mkdirSync(outDir, { recursive: true })
for (const s of shots) {
  const p = path.join(outDir, `t${String(s.t).padStart(3, '0')}.png`)
  fs.writeFileSync(p, Buffer.from(s.data.split(',')[1], 'base64'))
}
console.log(JSON.stringify({ count: shots.length, w: shots[0]?.w, h: shots[0]?.h }))
