/**
 * 用无头 Edge 的 MediaRecorder 把一张截图做成无声循环短片（WebM/VP9）。
 * 没有 ffmpeg 也能出真视频：canvas.captureStream → MediaRecorder → 存盘。
 *
 * 用法：node scripts/make-video.mjs [输入png] [输出文件名] [时长ms]
 *   node scripts/make-video.mjs ../data/企业年报.png 02-rag.webm 9000
 */
import fs from 'node:fs'
import path from 'node:path'
import puppeteer from 'puppeteer-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const OUT_DIR = path.resolve('public', 'media')
const W = 1280
const H = 720

const input = process.argv[2] || path.resolve('..', 'data', '企业年报.png')
const outName = process.argv[3] || '02-rag.webm'
const duration = Number(process.argv[4] || 9000)

const pngBase64 = fs.readFileSync(path.resolve(input)).toString('base64')
fs.mkdirSync(OUT_DIR, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: [
    '--autoplay-policy=no-user-gesture-required',
    '--disable-background-timer-throttling',
    '--disable-renderer-backgrounding',
    '--disable-backgrounding-occluded-windows',
    '--force-device-scale-factor=1',
  ],
})

const page = await browser.newPage()
await page.setViewport({ width: W, height: H })
await page.goto('about:blank')

const result = await page.evaluate(
  async ({ pngBase64, W, H, duration }) => {
    const cv = document.createElement('canvas')
    cv.width = W
    cv.height = H
    document.body.style.margin = '0'
    document.body.appendChild(cv)
    const ctx = cv.getContext('2d', { alpha: false })

    const img = new Image()
    img.src = 'data:image/png;base64,' + pngBase64
    await img.decode()

    const paper = '#e8e5e1'
    const ease = (t) => 1 - Math.pow(1 - t, 3)

    // 缓慢推近 + 轻微平移，首尾各留一点静止，看起来像「镜头推进」
    const draw = (progress) => {
      const p = ease(progress)
      const zoom = 1.03 + p * 0.07
      const panX = (p - 0.5) * 46
      const panY = (p - 0.5) * -18

      ctx.fillStyle = paper
      ctx.fillRect(0, 0, W, H)

      const base = Math.max(W / img.width, H / img.height) * zoom
      const dw = img.width * base
      const dh = img.height * base
      const dx = (W - dw) / 2 + panX
      const dy = (H - dh) / 2 + panY

      ctx.save()
      ctx.imageSmoothingQuality = 'high'
      ctx.drawImage(img, dx, dy, dw, dh)
      ctx.restore()

      // 入场淡入（前 12%）
      const fade = Math.min(1, progress / 0.12)
      if (fade < 1) {
        ctx.fillStyle = paper
        ctx.globalAlpha = 1 - fade
        ctx.fillRect(0, 0, W, H)
        ctx.globalAlpha = 1
      }
    }

    draw(0)

    const types = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
    const mime = types.find((t) => window.MediaRecorder && MediaRecorder.isTypeSupported(t))
    if (!mime) return { error: 'no supported webm mime' }

    const stream = cv.captureStream(30)
    const rec = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 3_200_000 })
    const chunks = []
    rec.ondataavailable = (e) => {
      if (e.data && e.data.size) chunks.push(e.data)
    }
    const stopped = new Promise((res) => {
      rec.onstop = res
    })

    rec.start(200)
    const t0 = performance.now()
    await new Promise((done) => {
      const frame = (now) => {
        const progress = Math.min(1, (now - t0) / duration)
        draw(progress)
        if (progress < 1) requestAnimationFrame(frame)
        else done()
      }
      requestAnimationFrame(frame)
    })
    await new Promise((r) => setTimeout(r, 150))
    rec.stop()
    await stopped
    stream.getTracks().forEach((t) => t.stop())

    const blob = new Blob(chunks, { type: mime })
    const bytes = new Uint8Array(await blob.arrayBuffer())
    let s = ''
    const CH = 0x8000
    for (let i = 0; i < bytes.length; i += CH) {
      s += String.fromCharCode.apply(null, bytes.subarray(i, i + CH))
    }
    return { mime, b64: btoa(s), size: bytes.length }
  },
  { pngBase64, W, H, duration }
)

await browser.close()

if (result.error) {
  console.error('FAILED:', result.error)
  process.exit(1)
}

const outPath = path.join(OUT_DIR, outName)
fs.writeFileSync(outPath, Buffer.from(result.b64, 'base64'))
console.log(
  JSON.stringify(
    {
      out: outPath,
      mime: result.mime,
      bytes: result.size,
      kb: Math.round(result.size / 1024),
      durationMs: duration,
      size: `${W}x${H}`,
    },
    null,
    2
  )
)
