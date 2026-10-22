import puppeteer from 'puppeteer-core'
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const b = await puppeteer.launch({ executablePath: EDGE, headless: 'new' })
const p = await b.newPage()
await p.setViewport({ width: 1700, height: 1000 })
const bad = []
p.on('response', (r) => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url()) })
await p.goto('http://127.0.0.1:4173/portfolio/', { waitUntil: 'networkidle0' })
await p.evaluate(() => window.scrollTo(0, 2000))
await new Promise((r) => setTimeout(r, 1200))
const imgs = await p.$$eval('img', (els) => els.map((e) => ({ src: e.getAttribute('src'), w: e.naturalWidth })))
console.log(JSON.stringify({ imgs, bad }, null, 2))
await b.close()
