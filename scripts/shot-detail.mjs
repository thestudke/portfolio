import puppeteer from 'puppeteer-core'
import path from 'node:path'

const OUT = path.resolve('..', '_preview')
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--hide-scrollbars', '--autoplay-policy=no-user-gesture-required'],
})
const page = await browser.newPage()
await page.setViewport({ width: 1700, height: 1100 })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' })
await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important}' })

const openCase = async (i) => {
  await page.evaluate(
    (idx) => document.querySelectorAll('#work .case')[idx].scrollIntoView({ block: 'center', behavior: 'instant' }),
    i
  )
  await new Promise((r) => setTimeout(r, 700))
  const btns = await page.$$('.case__cta')
  await btns[i].click()
  await new Promise((r) => setTimeout(r, 1200))
  return page.$eval('.detail', (n) => {
    const v = n.querySelector('video')
    return {
      title: n.querySelector('h3')?.textContent?.trim(),
      blocks: n.querySelectorAll('.detail__blocks section').length,
      facts: n.querySelectorAll('.detail__facts > div').length,
      tag: n.querySelector('.detail__media-tag')?.textContent?.trim(),
      hasVideo: !!v,
      video: v
        ? {
            src: v.getAttribute('src'),
            poster: v.getAttribute('poster'),
            controls: v.controls,
            autoplay: v.autoplay,
            paused: v.paused,
            muted: v.muted,
            duration: Number.isFinite(v.duration) ? +v.duration.toFixed(1) : null,
            boxW: Math.round(v.getBoundingClientRect().width),
            boxH: Math.round(v.getBoundingClientRect().height),
            videoW: v.videoWidth,
            videoH: v.videoHeight,
          }
        : null,
    }
  })
}

const close = async () => {
  await page.keyboard.press('Escape')
  await new Promise((r) => setTimeout(r, 500))
  return (await page.$('.detail')) === null
}

const a = await openCase(0)
await page.screenshot({ path: path.join(OUT, 'detail-01-video.png') })
const closed1 = await close()

// 播放 01，验证能出画面（取 currentTime 前进）
const played = await (async () => {
  await openCase(0)
  const r = await page.evaluate(async () => {
    const v = document.querySelector('.detail video')
    await v.play().catch(() => {})
    await new Promise((res) => setTimeout(res, 2200))
    return { currentTime: +v.currentTime.toFixed(1), paused: v.paused, readyState: v.readyState }
  })
  await page.screenshot({ path: path.join(OUT, 'detail-01-playing.png') })
  return r
})()
await close()

const b = await openCase(1)
await page.screenshot({ path: path.join(OUT, 'detail-02-video.png') })
const closed2 = await close()

console.log(JSON.stringify({ a, closed1, played, b, closed2, errors }, null, 2))
await browser.close()
