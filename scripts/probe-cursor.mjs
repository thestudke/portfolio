// 光标形态探针：把鼠标移到按钮上，截局部图确认环放大 + 系统光标已隐藏
import puppeteer from 'puppeteer-core'
import path from 'node:path'

const OUT = path.resolve('..', '_preview')
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--hide-scrollbars', '--disable-gpu'],
  defaultViewport: { width: 1700, height: 1000 },
})
const page = await browser.newPage()
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 1500))

const box = await page.evaluate(() => {
  const b = document.querySelector('.hero__actions .btn--primary').getBoundingClientRect()
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 }
})
await page.mouse.move(box.x, box.y, { steps: 12 })
await new Promise((r) => setTimeout(r, 700))

const state = await page.evaluate(() => ({
  cursorOn: document.documentElement.classList.contains('cursor-on'),
  bodyCursor: getComputedStyle(document.body).cursor,
  ringGrow: document.querySelector('.cursor-ring')?.classList.contains('is-grow'),
  ringTransform: document.querySelector('.cursor-ring')?.style.transform,
  dotOpacity: getComputedStyle(document.querySelector('.cursor-dot')).opacity,
}))
console.log(JSON.stringify(state, null, 2))

await page.screenshot({
  path: path.join(OUT, 'cursor-probe.png'),
  clip: { x: box.x - 120, y: box.y - 90, width: 320, height: 200 },
})
await browser.close()
