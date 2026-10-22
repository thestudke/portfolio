import puppeteer from 'puppeteer-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new' })
const page = await browser.newPage()
await page.setViewport({ width: 1700, height: 1000 })
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' })
const out = await page.evaluate(() => ({
  timeline: [...document.querySelectorAll('.timeline__period, .timeline .mono')].map((e) => e.textContent.trim()).filter((t) => /\d{4}\.\d{2}/.test(t)),
  titles: [...document.querySelectorAll('.timeline__title, .timeline h3, .timeline strong')].map((e) => e.textContent.trim()).slice(0, 4),
  strengthLede: document.querySelector('#capabilities header p')?.textContent.trim(),
  ctaTag: document.querySelector('.case__cta')?.tagName,
  ctaHref: document.querySelector('.case__cta')?.getAttribute('href'),
}))
console.log(JSON.stringify(out, null, 2))
await browser.close()
