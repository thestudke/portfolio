import { useEffect, useRef } from 'react'

/**
 * 主标题字符拆分 + 悬停弹跳。
 * 参考站的 [data-rc] 也是按字符拆（SplitText chars + stagger），这里用 WAAPI 手写，
 * 不依赖 GSAP；指针进入标题时每个字依次做一次 translateY + 轻微旋转的弹簧回弹。
 */

// 英文/数字连成一个 token，避免 "AI" 被拆到两行
function tokenize(text) {
  const out = []
  let buf = ''
  for (const ch of text) {
    if (/[A-Za-z0-9.+#&_/-]/.test(ch)) {
      buf += ch
      continue
    }
    if (buf) {
      out.push(buf)
      buf = ''
    }
    out.push(ch === ' ' ? '\u00A0' : ch)
  }
  if (buf) out.push(buf)
  return out
}

export function Chars({ text }) {
  return tokenize(text).map((tk, i) => (
    <span className="char" key={`${i}-${tk}`}>
      {tk}
    </span>
  ))
}

export function useBounceHover({ duration = 620, stagger = 15 } = {}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let busy = false

    const play = () => {
      if (busy) return
      const chars = el.querySelectorAll('.char')
      if (!chars.length) return
      busy = true
      chars.forEach((c, i) => {
        c.animate(
          [
            { transform: 'translate3d(0, 0, 0) rotate(0deg)' },
            { transform: 'translate3d(0, -0.14em, 0) rotate(-1.1deg)', offset: 0.34 },
            { transform: 'translate3d(0, 0.015em, 0) rotate(0.45deg)', offset: 0.72 },
            { transform: 'translate3d(0, 0, 0) rotate(0deg)' },
          ],
          {
            duration,
            delay: i * stagger,
            easing: 'cubic-bezier(.32, 1.42, .52, 1)',
            fill: 'none',
          }
        )
      })
      window.setTimeout(
        () => {
          busy = false
        },
        duration + chars.length * stagger + 60
      )
    }

    el.addEventListener('pointerenter', play)
    return () => el.removeEventListener('pointerenter', play)
  }, [duration, stagger])

  return ref
}
