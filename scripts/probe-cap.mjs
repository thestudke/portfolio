import puppeteer from 'puppeteer-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--disable-gpu'] })
const page = await browser.newPage()
await page.setViewport({ width: 1700, height: 1000 })
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 600))

const info = await page.evaluate(() => {
  const h2 = document.querySelector('#capabilities h2')
  h2.scrollIntoView({ block: 'center' })
  const r = h2.getBoundingClientRect()
  const x = Math.round(r.x + r.width * 0.25)
  const y = Math.round(r.y + r.height * 0.5)
  const hit = document.elementFromPoint(x, y)
  const cs = getComputedStyle(h2)
  return {
    rect: { x: +r.x.toFixed(1), y: +r.y.toFixed(1), w: +r.width.toFixed(1), h: +r.height.toFixed(1) },
    hit: hit ? `${hit.tagName}.${hit.className}` : null,
    pointerEvents: cs.pointerEvents,
    visibility: cs.visibility,
    display: cs.display,
    chars: h2.querySelectorAll('.char').length,
  }
})
console.log('info', JSON.stringify(info))

// 合成事件验证监听是否挂上
const synth = await page.evaluate(() => {
  const h2 = document.querySelector('#capabilities h2')
  h2.dispatchEvent(new PointerEvent('pointerenter', { bubbles: false }))
  const chars = [...h2.querySelectorAll('.char')]
  return { anims: chars.flatMap((c) => c.getAnimations()).length }
})
console.log('synth', JSON.stringify(synth))

await new Promise((r) => setTimeout(r, 1500))

// 真实指针
await page.mouse.move(700, 500)
await new Promise((r) => setTimeout(r, 80))
const box = await page.evaluate(() => {
  const r = document.querySelector('#capabilities h2').getBoundingClientRect()
  return { x: Math.round(r.x + r.width * 0.25), y: Math.round(r.y + r.height * 0.5) }
})
await page.mouse.move(box.x, box.y, { steps: 6 })
await new Promise((r) => setTimeout(r, 140))
const real = await page.evaluate((s) => {
  const chars = [...document.querySelectorAll(`${s} .char`)]
  return {
    anims: chars.flatMap((c) => c.getAnimations()).length,
    hover: document.querySelector(s).matches(':hover'),
  }
}, '#capabilities h2')
console.log('real', JSON.stringify(real))

await browser.close()
