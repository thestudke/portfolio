import { useEffect, useRef } from 'react'

/**
 * 柔和跟随光标：实心点贴手 + 描边环延迟跟随，落到可点击元素上时环放大。
 * 触屏与「减少动态效果」下整块降级为系统光标（不接管）。
 */
export default function Cursor() {
  const dotRef = useRef(null)
  const ringRef = useRef(null)

  useEffect(() => {
    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    const fine = matchMedia('(hover: hover) and (pointer: fine)').matches
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine || reduce) return

    const root = document.documentElement
    root.classList.add('cursor-on')

    let x = window.innerWidth / 2
    let y = window.innerHeight / 2
    let rx = x
    let ry = y
    let raf = 0
    let visible = false

    const show = () => {
      if (visible) return
      visible = true
      dot.style.opacity = '1'
      ring.style.opacity = '1'
    }

    const onMove = (e) => {
      x = e.clientX
      y = e.clientY
      show()
    }

    const interactive = 'a,button,input,textarea,select,[role="button"],.case,.more-row,.strength,.copy'

    const onOver = (e) => {
      const t = e.target instanceof Element ? e.target.closest(interactive) : null
      ring.classList.toggle('is-grow', !!t)
      dot.classList.toggle('is-dim', !!t)
    }

    const onLeave = () => {
      visible = false
      dot.style.opacity = '0'
      ring.style.opacity = '0'
    }

    const render = () => {
      raf = 0
      rx += (x - rx) * 0.17
      ry += (y - ry) * 0.17
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`
      ring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
      raf = requestAnimationFrame(render)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerover', onOver, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    raf = requestAnimationFrame(render)

    return () => {
      root.classList.remove('cursor-on')
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerover', onOver)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <>
      <span ref={ringRef} className="cursor-ring" aria-hidden="true" />
      <span ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  )
}
