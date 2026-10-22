import puppeteer from 'puppeteer-core'

const EDGE = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
const b = await puppeteer.launch({ executablePath: EDGE, headless: 'new' })
const p = await b.newPage()
await p.setViewport({ width: 1700, height: 1000 })
await p.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' })

const out = await p.evaluate(() => {
  const links = [...document.querySelectorAll('a[href^="mailto:"], a[href^="tel:"], a[href*="github.com"]')]
  return {
    links: links.map((a) => ({ href: a.getAttribute('href'), text: a.textContent.trim().replace(/\s+/g, ' ') })),
    strip: [...document.querySelectorAll('.contact-strip *')]
      .map((n) => n.textContent.trim())
      .filter((t) => t && t.length < 40)
      .slice(0, 14),
    footerMail: document.querySelector('.contact__mail')?.textContent?.trim() || null,
  }
})

console.log(JSON.stringify(out, null, 2))
await b.close()
