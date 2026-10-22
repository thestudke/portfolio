// 截参考站：看它的背景与光标氛围
import puppeteer from 'puppeteer-core'
import path from 'node:path'

const OUT = process.argv[3] || path.resolve('..', '_preview', 'ref')
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--hide-scrollbars', '--disable-gpu', '--force-device-scale-factor=1'],
  defaultViewport: { width: 1600, height: 1000, deviceScaleFactor: 1 },
})
const page = await browser.newPage()
await page.goto(process.argv[2], { waitUntil: 'networkidle2', timeout: 45000 })
await new Promise((r) => setTimeout(r, 3500))
await page.screenshot({ path: path.join(OUT, 'ref-hero.png') })

// 把鼠标移到中间，看光标样式
await page.mouse.move(800, 500)
await new Promise((r) => setTimeout(r, 800))
await page.screenshot({ path: path.join(OUT, 'ref-cursor.png') })

const probe = await page.evaluate(() => {
  const cs = (sel, props) => {
    const el = document.querySelector(sel)
    if (!el) return null
    const s = getComputedStyle(el)
    const o = {}
    for (const p of props) o[p] = s.getPropertyValue(p)
    return o
  }
  return {
    bodyCursor: getComputedStyle(document.body).cursor,
    htmlBg: getComputedStyle(document.documentElement).backgroundColor,
    canvas: !!document.querySelector('canvas.hero3d'),
    cursorEl: document.querySelector('#cursor')?.outerHTML?.slice(0, 400) || null,
    hero: cs('.hero', ['background', 'background-image']),
  }
})
console.log(JSON.stringify(probe, null, 2))
await browser.close()
