import puppeteer from 'puppeteer-core'
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const b = await puppeteer.launch({ executablePath: EDGE, headless: 'new' })
const p = await b.newPage()
await p.setViewport({ width: 1700, height: 1000 })
const bad = []
p.on('response', (r) => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url()) })
p.on('pageerror', (e) => bad.push('JS ' + e.message))
await p.goto('https://thestudke.github.io/portfolio/', { waitUntil: 'networkidle0', timeout: 60000 })
// 逐屏滚动，逼出所有懒加载
for (let y = 0; y < 8000; y += 800) {
  await p.evaluate((v) => window.scrollTo(0, v), y)
  await new Promise((r) => setTimeout(r, 400))
}
await new Promise((r) => setTimeout(r, 1500))
const imgs = await p.$$eval('img', (els) => els.map((e) => ({ src: e.getAttribute('src'), w: e.naturalWidth })))
const video = await p.evaluate(async () => {
  const cta = document.querySelectorAll('#work .case__cta')[1]
  cta.scrollIntoView({ block: 'center' })
  await new Promise((r) => setTimeout(r, 500))
  cta.click()
  await new Promise((r) => setTimeout(r, 2500))
  const v = document.querySelector('.detail video')
  return v ? { src: v.getAttribute('src'), currentSrc: v.currentSrc, readyState: v.readyState, w: v.videoWidth } : null
})
console.log(JSON.stringify({ imgs, video, bad }, null, 2))
await b.close()
