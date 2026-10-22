import puppeteer from 'puppeteer-core'
import path from 'node:path'

const OUT = path.resolve('..', '_preview')
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const browser = await puppeteer.launch({ executablePath: EDGE, headless: 'new', args: ['--disable-gpu'] })

const page = await browser.newPage()
await page.setViewport({ width: 1280, height: 800 })
await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' })
await new Promise((r) => setTimeout(r, 2200))
await page.screenshot({ path: path.join(OUT, 'paper-1280-hero.png') })

// 抽屉打开态（汉堡只在 ≤860 出现）
await page.setViewport({ width: 820, height: 800 })
await new Promise((r) => setTimeout(r, 800))
await page.click('.nav__burger')
await new Promise((r) => setTimeout(r, 700))
await page.screenshot({ path: path.join(OUT, 'paper-1280-drawer.png') })

await browser.close()
