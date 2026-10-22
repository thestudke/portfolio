/**
 * 量出一段录屏里「真正的画面」占多大——用来把黑边裁掉。
 * 做法：无头 Edge 里 seek 若干帧 → 降采样 → 找非黑像素的包围盒 → 给出 CSS 参数。
 *
 * 用法: node scripts/measure-video.mjs <http视频地址> [采样秒数,逗号分隔]
 * 输出: { box, aspect, objectPosition }
 */
import puppeteer from 'puppeteer-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const url = process.argv[2]
const times = (process.argv[3] || '5,20,35,50').split(',').map(Number)

const u = new URL(url)
const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--autoplay-policy=no-user-gesture-required'],
})
const page = await browser.newPage()
await page.goto(`${u.origin}/`, { waitUntil: 'domcontentloaded' })

const result = await page.evaluate(
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

    const W = 480
    const H = Math.round((W * v.videoHeight) / v.videoWidth)
    const cv = document.createElement('canvas')
    cv.width = W
    cv.height = H
    const cx = cv.getContext('2d', { willReadFrequently: true })

    const boxes = []
    for (const t of times) {
      if (t > v.duration) continue
      v.currentTime = t
      await new Promise((res) => {
        v.onseeked = res
        setTimeout(res, 1500)
      })
      cx.drawImage(v, 0, 0, W, H)
      const d = cx.getImageData(0, 0, W, H).data
      // 逐行/逐列统计「亮像素占比」，占比过 60% 才算真正的画面（抗压缩噪点和鼠标）
      const rowRatio = new Array(H).fill(0)
      const colRatio = new Array(W).fill(0)
      for (let y = 0; y < H; y++) {
        let rowBright = 0
        for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 4
          const lum = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]
          if (lum > 22) {
            rowBright++
            colRatio[x]++
          }
        }
        rowRatio[y] = rowBright / W
      }
      const colRatioN = colRatio.map((c) => c / H)
      const firstIdx = (arr, th) => arr.findIndex((r) => r > th)
      const lastIdx = (arr, th) => {
        for (let i = arr.length - 1; i >= 0; i--) if (arr[i] > th) return i
        return -1
      }
      const top = firstIdx(rowRatio, 0.6)
      const bottom = lastIdx(rowRatio, 0.6)
      const left = firstIdx(colRatioN, 0.6)
      const right = lastIdx(colRatioN, 0.6)
      if (right > 0 && bottom > 0) boxes.push({ t, left, right, top, bottom, W, H })
      if (window.__dump) {
        window.__dump.push({
          t,
          png: cv.toDataURL('image/png'),
          rows: rowRatio.map((r) => +r.toFixed(2)),
          cols: colRatioN.map((r) => +r.toFixed(2)),
        })
      }
    }

    const median = (arr) => {
      const a = [...arr].sort((x, y) => x - y)
      return a[Math.floor(a.length / 2)]
    }
    const left = median(boxes.map((b) => b.left)) / W
    const right = (median(boxes.map((b) => b.right)) + 1) / W
    const top = median(boxes.map((b) => b.top)) / H
    const bottom = (median(boxes.map((b) => b.bottom)) + 1) / H
    return { w: v.videoWidth, h: v.videoHeight, samples: boxes.length, left, right, top, bottom }
  },
  { src: u.pathname, times }
)

await browser.close()

const { w, h, left, right, top, bottom } = result
const fw = right - left
const fh = bottom - top
const aspect = (w * fw) / (h * fh)
const yPct = fh < 0.999 ? top / (1 - fh) : 0.5
const xPct = fw < 0.999 ? left / (1 - fw) : 0.5

console.log(
  JSON.stringify(
    {
      file: u.pathname.split('/').pop(),
      size: `${w}x${h}`,
      samples: result.samples,
      box: {
        left: +left.toFixed(4),
        right: +right.toFixed(4),
        top: +top.toFixed(4),
        bottom: +bottom.toFixed(4),
      },
      aspect: +aspect.toFixed(3),
      objectPosition: `${Math.round(xPct * 100)}% ${Math.round(yPct * 100)}%`,
      note:
        fw < 0.995
          ? '画面不满宽：object-fit:cover 只能裁上下，左右黑边要靠 aspect 更窄或另裁'
          : '画面满宽，cover 裁上下即可',
    },
    null,
    2
  )
)
