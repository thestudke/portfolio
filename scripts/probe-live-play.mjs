import puppeteer from 'puppeteer-core'
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const b = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--autoplay-policy=no-user-gesture-required'] })
const p = await b.newPage()
await p.setViewport({ width: 1700, height: 1100 })
await p.goto('https://thestudke.github.io/portfolio/', { waitUntil: 'networkidle0', timeout: 60000 })
await p.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' })
await p.evaluate(() => document.querySelectorAll('#work .case')[1].scrollIntoView({ block: 'center', behavior: 'instant' }))
await new Promise((r) => setTimeout(r, 800))
const btns = await p.$$('.case__cta')
await btns[1].click()
await new Promise((r) => setTimeout(r, 1500))
await p.screenshot({ path: '../_preview/live-02.png' })
const play = await p.evaluate(async () => {
  const v = document.querySelector('.detail video')
  await v.play().catch(() => {})
  await new Promise((r) => setTimeout(r, 3000))
  return { currentTime: +v.currentTime.toFixed(1), paused: v.paused, readyState: v.readyState, w: v.videoWidth, h: v.videoHeight }
})
await p.screenshot({ path: '../_preview/live-02-playing.png' })
console.log(JSON.stringify(play))
await b.close()
