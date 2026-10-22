// 截图工具：用本机 Edge 打开本地 dev 服务，冻结动画后逐段截屏
// 用法: node scripts/shot.mjs [url] [outDir]
import puppeteer from 'puppeteer-core'
import fs from 'node:fs'
import path from 'node:path'

const URL = process.argv[2] || 'http://127.0.0.1:5173/'
const OUT = process.argv[3] || path.resolve('..', '_preview')
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'

fs.mkdirSync(OUT, { recursive: true })

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--hide-scrollbars', '--disable-gpu', '--force-device-scale-factor=1'],
  defaultViewport: { width: 1700, height: 1000, deviceScaleFactor: 1 },
})

const page = await browser.newPage()
const errors = []
page.on('console', (m) => {
  if (m.type() === 'error') errors.push('console: ' + m.text())
})
page.on('pageerror', (e) => errors.push('pageerror: ' + e.message))

await page.goto(URL, { waitUntil: 'networkidle0', timeout: 30000 })

// 冻结所有动画与过渡，强制揭示态，保证截图是「终态」
await page.addStyleTag({
  content: `
    *,*::before,*::after{animation:none!important;transition:none!important}
    .reveal{opacity:1!important;transform:none!important}
    .hero__title .line{opacity:1!important;transform:none!important;filter:none!important}
    .hero__eyebrow,.hero__foot,.hero__rail{opacity:1!important;transform:none!important}
    .contact__eyebrow,.contact__title,.contact__mail,.contact__grid{opacity:1!important;transform:none!important}
    html{scroll-behavior:auto!important}
  `,
})
// 等数字动画（1400ms）跑完再截
await new Promise((r) => setTimeout(r, 2200))

await page.screenshot({ path: path.join(OUT, 'shot-hero.png') })

const sections = ['#profile', '#work', '#capabilities', '#contact']
for (const sel of sections) {
  await page.evaluate((s) => {
    const el = document.querySelector(s)
    if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 76)
  }, sel)
  await new Promise((r) => setTimeout(r, 2800))
  await page.screenshot({ path: path.join(OUT, `shot-${sel.slice(1)}.png`) })
}

// 关键局部：数据条 / 更多项目清单
for (const [name, sel] of [
  ['stats', '.stats'],
  ['more', '.more'],
  ['case2', '.case--flip'],
]) {
  const el = await page.$(sel)
  if (!el) continue
  await el.evaluate((n) => n.scrollIntoView({ block: 'center', behavior: 'instant' }))
  await new Promise((r) => setTimeout(r, 600))
  await el.screenshot({ path: path.join(OUT, `shot-${name}.png`) })
}

// 统计数字终值
const nums = await page.$$eval('.stat__num', (els) => els.map((e) => e.textContent.trim()))
console.log('stats:', JSON.stringify(nums))

// 页面底部与整页
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
await new Promise((r) => setTimeout(r, 400))
await page.screenshot({ path: path.join(OUT, 'shot-bottom.png') })

await page.evaluate(() => window.scrollTo(0, 0))
await new Promise((r) => setTimeout(r, 200))
await page.screenshot({ path: path.join(OUT, 'shot-full.png'), fullPage: true })

const info = await page.evaluate(() => ({
  title: document.title,
  height: document.body.scrollHeight,
  width: document.documentElement.scrollWidth,
  overflowX: document.documentElement.scrollWidth > window.innerWidth,
  imgs: [...document.images].map((i) => ({
    src: i.currentSrc.split('/').slice(-1)[0],
    ok: i.complete && i.naturalWidth > 0,
    w: i.naturalWidth,
  })),
  sections: [...document.querySelectorAll('section[id], footer')].map((s) => s.id || s.tagName),
}))

console.log(JSON.stringify({ ...info, errors }, null, 2))
await browser.close()
