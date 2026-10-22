import puppeteer from 'puppeteer-core'
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const b = await puppeteer.launch({ executablePath: EDGE, headless: 'new' })
const p = await b.newPage()
await p.setViewport({ width: 1700, height: 1000 })
await p.goto('http://127.0.0.1:4173/portfolio/', { waitUntil: 'networkidle0' })
await p.evaluate(() => document.querySelector('#work .case').scrollIntoView({ block: 'center', behavior: 'instant' }))
await new Promise((r) => setTimeout(r, 600))
const btns = await p.$$('.case__cta')
await btns[0].click()
await new Promise((r) => setTimeout(r, 1500))
const v = await p.$eval('.detail video', (n) => ({ src: n.getAttribute('src'), poster: n.getAttribute('poster'), currentSrc: n.currentSrc, readyState: n.readyState, w: n.videoWidth }))
console.log(JSON.stringify(v, null, 2))
await b.close()
