// 验证：主标题悬停弹跳 + 窄屏 more-row 不再压字
import puppeteer from 'puppeteer-core'
import path from 'node:path'

const OUT = path.resolve('..', '_preview')
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--hide-scrollbars', '--disable-gpu'],
})

// 1) 悬停弹跳
const page = await browser.newPage()
await page.setViewport({ width: 1700, height: 1000 })
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 800))

for (const sel of ['.hero__title', '#work h2', '#profile h2', '#capabilities h2', '#contact h2']) {
  await page.mouse.move(4, 4)
  await new Promise((r) => setTimeout(r, 60))
  await page.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'center' }), sel)
  await new Promise((r) => setTimeout(r, 1200))
  const box = await page.evaluate((s) => {
    const r = document.querySelector(s).getBoundingClientRect()
    return { x: r.x + r.width * 0.25, y: r.y + r.height * 0.5, w: Math.min(r.width, 900), h: r.height }
  }, sel)

  await page.mouse.move(box.x - 260, box.y)
  await new Promise((r) => setTimeout(r, 120))
  await page.mouse.move(box.x, box.y)
  await new Promise((r) => setTimeout(r, 130))

  const mid = await page.evaluate((s) => {
    const chars = [...document.querySelectorAll(`${s} .char`)]
    const anims = chars.flatMap((c) => c.getAnimations())
    const ts = chars.slice(0, 4).map((c) => getComputedStyle(c).transform)
    return { chars: chars.length, anims: anims.length, sample: ts }
  }, sel)
  console.log(sel, JSON.stringify(mid))

  await page.screenshot({
    path: path.join(OUT, `bounce-${sel.replace(/[^a-z]/gi, '')}.png`),
    clip: { x: box.x - 220, y: box.y - 90, width: 660, height: 200 },
  })
  await new Promise((r) => setTimeout(r, 900))
}
await page.close()

// 2) 窄屏 more-row
for (const width of [1180, 1024]) {
  const p = await browser.newPage()
  await p.setViewport({ width, height: 900 })
  await p.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' })
  const geo = await p.evaluate(() => {
    const rows = [...document.querySelectorAll('.more-row')]
    return rows.map((r) => {
      const t = r.querySelector('.more-row__thumb').getBoundingClientRect()
      const m = r.querySelector('.more-row__main').getBoundingClientRect()
      return { thumbRight: +t.right.toFixed(1), mainLeft: +m.left.toFixed(1), overlap: +(t.right - m.left).toFixed(1) }
    })
  })
  console.log(width, JSON.stringify(geo))
  await p.evaluate(() => document.querySelector('.more').scrollIntoView({ block: 'center' }))
  await new Promise((r) => setTimeout(r, 900))
  const el = await p.$('.more')
  await el.screenshot({ path: path.join(OUT, `more-${width}.png`) })
  await p.close()
}

await browser.close()
