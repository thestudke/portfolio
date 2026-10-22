// 量 more-row 各列几何：确认缩略图是否压到文字
import puppeteer from 'puppeteer-core'
import path from 'node:path'

const OUT = path.resolve('..', '_preview')
const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'

const browser = await puppeteer.launch({
  executablePath: EDGE,
  headless: 'new',
  args: ['--hide-scrollbars', '--disable-gpu'],
})

for (const width of [1700, 1440, 1280]) {
  const page = await browser.newPage()
  await page.setViewport({ width, height: 1000 })
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' })
  const data = await page.evaluate(() => {
    const row = document.querySelector('.more-row')
    const g = (el) => {
      const r = el.getBoundingClientRect()
      return { x: +r.x.toFixed(1), w: +r.width.toFixed(1), right: +r.right.toFixed(1) }
    }
    const r = row.getBoundingClientRect()
    return {
      row: g(row),
      id: g(row.querySelector('.more-row__id')),
      thumb: g(row.querySelector('.more-row__thumb')),
      img: g(row.querySelector('.more-row__thumb img')),
      main: g(row.querySelector('.more-row__main')),
      title: g(row.querySelector('.more-row__main b')),
      meta: g(row.querySelector('.more-row__meta')),
      gridCols: getComputedStyle(row).gridTemplateColumns,
    }
  })
  console.log(width, JSON.stringify(data))
  if (width === 1700) {
    await page.evaluate(() => document.querySelector('.more').scrollIntoView({ block: 'center' }))
    await new Promise((r) => setTimeout(r, 900))
    const el = await page.$('.more-row')
    await el.screenshot({ path: path.join(OUT, 'row-probe.png') })
  }
  await page.close()
}
await browser.close()
