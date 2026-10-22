import puppeteer from 'puppeteer-core'
import path from 'node:path'

const OUT = path.resolve('..', '_preview')
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--hide-scrollbars', '--force-device-scale-factor=1'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1700, height: 1000 })
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' })
await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' })
const el = await page.$('.timeline')
await el.evaluate((n) => n.scrollIntoView({ block: 'center', behavior: 'instant' }))
await page.evaluate(() => window.scrollBy(0, 260))
await new Promise((r) => setTimeout(r, 1400))
await el.screenshot({ path: path.join(OUT, 'timeline.png') })
const periods = await page.$$eval('.timeline__period, .tl__period, .timeline .mono', (els) =>
  els.map((e) => e.textContent.trim()).filter((t) => /\d{4}/.test(t))
)
console.log(JSON.stringify(periods))
await browser.close()
