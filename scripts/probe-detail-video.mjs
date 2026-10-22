import puppeteer from 'puppeteer-core'
import path from 'node:path'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const OUT = path.resolve('..', '_preview')
const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--autoplay-policy=no-user-gesture-required', '--hide-scrollbars'] })
const page = await browser.newPage()
await page.setViewport({ width: 1700, height: 1100 })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' })
await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' })

await page.evaluate(() => document.querySelectorAll('#work .case')[1].scrollIntoView({ block: 'center', behavior: 'instant' }))
await new Promise((r) => setTimeout(r, 800))
const btns = await page.$$('.case__cta')
await btns[1].click()
await new Promise((r) => setTimeout(r, 2500))

const state = await page.evaluate(() => {
  const v = document.querySelector('.detail video')
  return {
    hasVideo: !!v,
    hasImg: !!document.querySelector('.detail__shot img'),
    tag: document.querySelector('.detail__media-tag')?.textContent.trim() ?? null,
    w: v?.videoWidth ?? 0,
    h: v?.videoHeight ?? 0,
    duration: v ? Number(v.duration.toFixed(2)) : null,
    muted: v?.muted ?? null,
    paused: v?.paused ?? null,
    currentTime: v ? Number(v.currentTime.toFixed(2)) : null,
    poster: v?.getAttribute('poster') ?? null,
  }
})
await page.screenshot({ path: path.join(OUT, 'detail-02-video.png') })
console.log(JSON.stringify({ state, errors }, null, 2))
await browser.close()
