import { useEffect, useRef } from 'react'

/**
 * 首屏背景：手写 3D 点云球 + 星尘 + 线框二十面体
 * 纯 Canvas 2D 手动投影，不引入 three.js；鼠标视差，滚出首屏时放大淡出。
 * 点缀质感参考 kondius.cn/qq-agent 的粒子球；配色改为纸白底上的墨 → 暖灰 → 青铜。
 */

const RAD = 2.35
const D = 3.9 // 相机到球心的距离（球单位）
const GOLD = Math.PI * (3 - Math.sqrt(5))

const C_TOP = [34, 38, 30]
const C_MID = [92, 96, 78]
const C_LOW = [150, 112, 62]

const lerp = (a, b, t) => a + (b - a) * t
const mix = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]

function buildPoints(count) {
  const pos = new Float32Array(count * 3)
  const col = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const th = GOLD * i
    const jitter = 0.93 + Math.random() * 0.14
    const rr = RAD * jitter
    pos[i * 3] = Math.cos(th) * r * rr
    pos[i * 3 + 1] = y * rr
    pos[i * 3 + 2] = Math.sin(th) * r * rr

    const t = (y + 1) / 2
    const c = t < 0.5 ? mix(C_TOP, C_MID, t * 2) : mix(C_MID, C_LOW, (t - 0.5) * 2)
    col[i * 3] = c[0]
    col[i * 3 + 1] = c[1]
    col[i * 3 + 2] = c[2]
  }
  return { pos, col }
}

function buildDust(count) {
  const pos = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    let x, y, z, l
    do {
      x = Math.random() * 2 - 1
      y = Math.random() * 2 - 1
      z = Math.random() * 2 - 1
      l = Math.hypot(x, y, z)
    } while (l < 0.001 || l > 1)
    const s = (2.45 + Math.random() * 0.32) / (l || 1)
    pos[i * 3] = x * s
    pos[i * 3 + 1] = y * s
    pos[i * 3 + 2] = z * s
  }
  return pos
}

// 二十面体：顶点 → 递归细分 levels 次（每个三角分四块）→ 去重边，得到线框球
const ICO_FACES = [
  [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
  [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
  [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
  [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
]

function buildWire(levels = 2) {
  const t = (1 + Math.sqrt(5)) / 2
  const raw = [
    [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
    [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
    [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
  ]
  const R = RAD * 1.1
  const verts = []
  const index = new Map()
  const push = (v) => {
    const l = Math.hypot(v[0], v[1], v[2]) || 1
    const p = [(v[0] / l) * R, (v[1] / l) * R, (v[2] / l) * R]
    const key = p.map((n) => n.toFixed(3)).join(',')
    if (index.has(key)) return index.get(key)
    index.set(key, verts.length)
    verts.push(p)
    return verts.length - 1
  }
  const mid = (a, b) => [
    (verts[a][0] + verts[b][0]) / 2,
    (verts[a][1] + verts[b][1]) / 2,
    (verts[a][2] + verts[b][2]) / 2,
  ]

  const base = raw.map((v) => push(v))
  const edges = new Set()
  const addEdge = (a, b) => {
    const k = a < b ? `${a}-${b}` : `${b}-${a}`
    edges.add(k)
  }

  // 递归细分：每层把每个三角拆成四个，轮廓越来越接近球面
  let faces = ICO_FACES.map(([a, b, c]) => [base[a], base[b], base[c]])
  for (let lv = 0; lv < levels; lv++) {
    const next = []
    for (const [ia, ib, ic] of faces) {
      const ab = push(mid(ia, ib))
      const bc = push(mid(ib, ic))
      const ca = push(mid(ic, ia))
      next.push([ia, ab, ca], [ab, ib, bc], [ca, bc, ic], [ab, bc, ca])
    }
    faces = next
  }

  for (const [a, b, c] of faces) {
    addEdge(a, b)
    addEdge(b, c)
    addEdge(c, a)
  }

  return {
    verts,
    edges: [...edges].map((k) => k.split('-').map(Number)),
  }
}

export default function HeroScene({ className = 'hero-bg__canvas' }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const host = canvas?.parentElement?.parentElement || canvas?.parentElement
    if (!canvas || !host) return
    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const isSmall = window.innerWidth < 900
    const pts = buildPoints(isSmall ? 1800 : 3200)
    const dust = buildDust(isSmall ? 300 : 520)
    const { verts, edges } = buildWire()

    let w = 0
    let h = 0
    let dpr = 1
    let cx = 0
    let cy = 0
    let unit = 1
    let raf = 0
    let alive = true
    let mx = 0
    let my = 0
    let tmx = 0
    let tmy = 0
    let scrollP = 0
    let tscroll = 0
    const start = performance.now()

    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.6)
      w = host.clientWidth
      h = host.clientHeight
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = w + 'px'
      canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const wide = w > 1180
      cx = w * (wide ? 0.795 : 0.5)
      cy = h * (wide ? 0.46 : 0.42)
      unit = (Math.min(w, h) * (wide ? 0.375 : 0.36)) / RAD
    }

    const project = (x, y, z, cosY, sinY, cosX, sinX) => {
      const x1 = x * cosY + z * sinY
      const z1 = -x * sinY + z * cosY
      const y1 = y * cosX - z1 * sinX
      const z2 = y * sinX + z1 * cosX
      const k = D / (D - z2)
      return [x1, y1, z2, k]
    }

    const draw = (now) => {
      const time = (now - start) * 0.001
      mx += (tmx - mx) * 0.055
      my += (tmy - my) * 0.055
      scrollP += (tscroll - scrollP) * 0.085

      const fade = 1 - scrollP * 0.94
      const sc = 1 + scrollP * 0.9
      const S = unit * sc

      const rotY = time * 0.085 + mx * 0.34
      const rotX = my * 0.22 + Math.sin(time * 0.19) * 0.05
      const cosY = Math.cos(rotY)
      const sinY = Math.sin(rotY)
      const cosX = Math.cos(rotX)
      const sinX = Math.sin(rotX)

      ctx.clearRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'source-over'

      // 线框
      ctx.lineWidth = 1
      for (let e = 0; e < edges.length; e++) {
        const [ia, ib] = edges[e]
        const a = project(verts[ia][0], verts[ia][1], verts[ia][2], cosY, sinY, cosX, sinX)
        const b = project(verts[ib][0], verts[ib][1], verts[ib][2], cosY, sinY, cosX, sinX)
        const depth = ((a[2] + b[2]) / 2 + RAD) / (2 * RAD)
        ctx.strokeStyle = `rgba(18,20,14,${(0.055 + depth * 0.22) * fade})`
        ctx.beginPath()
        ctx.moveTo(cx + a[0] * S * a[3], cy + a[1] * S * a[3])
        ctx.lineTo(cx + b[0] * S * b[3], cy + b[1] * S * b[3])
        ctx.stroke()
      }

      // 星尘
      for (let i = 0; i < dust.length; i += 3) {
        const p = project(dust[i], dust[i + 1], dust[i + 2], cosY, sinY, cosX, sinX)
        const depth = (p[2] + 3.4) / 6.8
        if (depth <= 0.02) continue
        const r = 0.5 + depth * 0.7
        ctx.fillStyle = `rgba(24,26,20,${(0.028 + depth * 0.075) * fade})`
        ctx.beginPath()
        ctx.arc(cx + p[0] * S * p[3], cy + p[1] * S * p[3], r, 0, 6.2832)
        ctx.fill()
      }

      // 球面点云
      const pos = pts.pos
      const col = pts.col
      for (let i = 0; i < pos.length; i += 3) {
        const p = project(pos[i], pos[i + 1], pos[i + 2], cosY, sinY, cosX, sinX)
        const depth = (p[2] + RAD) / (2 * RAD) // 0 后 → 1 前
        if (depth <= 0.04) continue
        const sx = cx + p[0] * S * p[3]
        const sy = cy + p[1] * S * p[3]
        if (sx < -40 || sx > w + 40 || sy < -40 || sy > h + 40) continue
        const a = (0.035 + Math.pow(depth, 1.5) * 0.5) * fade
        const r = 0.7 + depth * 1.2
        const R = col[i] | 0
        const G = col[i + 1] | 0
        const B = col[i + 2] | 0
        ctx.fillStyle = `rgba(${R},${G},${B},${a})`
        ctx.beginPath()
        ctx.arc(sx, sy, r, 0, 6.2832)
        ctx.fill()
      }

      // 中心柔光
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, S * RAD * 1.5)
      glow.addColorStop(0, `rgba(178,158,124,${0.14 * fade})`)
      glow.addColorStop(0.46, `rgba(150,134,104,${0.07 * fade})`)
      glow.addColorStop(1, 'rgba(255,255,255,0)')
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = glow
      ctx.fillRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'source-over'
    }

    const tick = (now) => {
      raf = 0
      if (!alive) return
      draw(now)
      if (!document.hidden) raf = requestAnimationFrame(tick)
    }

    const startLoop = () => {
      if (!raf && alive) raf = requestAnimationFrame(tick)
    }

    size()
    draw(performance.now())

    const onMove = (e) => {
      tmx = (e.clientX / window.innerWidth - 0.5) * 2
      tmy = (e.clientY / window.innerHeight - 0.5) * 2
    }
    const onScroll = () => {
      tscroll = Math.min(1, (window.scrollY || 0) / Math.max(1, h))
    }
    let rt = 0
    const onResize = () => {
      clearTimeout(rt)
      rt = setTimeout(() => {
        size()
        draw(performance.now())
      }, 150)
    }

    if (!reduce) {
      window.addEventListener('pointermove', onMove, { passive: true })
      window.addEventListener('scroll', onScroll, { passive: true })
      startLoop()
    }
    window.addEventListener('resize', onResize)

    const onVis = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf)
        raf = 0
      } else startLoop()
    }
    document.addEventListener('visibilitychange', onVis)

    let io = null
    if (window.IntersectionObserver) {
      io = new IntersectionObserver(
        (ents) => {
          ents.forEach((en) => {
            alive = en.isIntersecting
            if (alive) startLoop()
            else {
              cancelAnimationFrame(raf)
              raf = 0
            }
          })
        },
        { threshold: 0 }
      )
      io.observe(host)
    }

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      io && io.disconnect()
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVis)
      clearTimeout(rt)
    }
  }, [])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
