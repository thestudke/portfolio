import { useEffect, useRef } from 'react'

/**
 * 解密文字：进入视口后，先在每个字符位置跳动随机字形，再逐字收敛成正文。
 * 直接写 textContent，不走 React 重渲染；reduced-motion 下直接出终稿。
 */

const POOL = '的一是在不了有和人这中大为上个国我以要他时来用们生到作地于出就分对成会可主发年动同工也能下过子说产种面而方后多定行学法所民得经十三之进着等部度家电力里如水化高自二理起小物现实加量都两体制机当使点从业本去把性好应开它合还因由其些然前外天政四日那社义事平形相全表间样与关各重新线内数正心反你明看原又么利比或但质气第向道命此变条只没结解问意建月公无系军很情者最立代想已通并提直题党程展五果料象员革位入常文总次品式活设及管特件长求老头基资边流路级少图山统接知较将组见计别她手角期根论运农指几九区强放决西被干做必战先回则任取据处队南给色光门即保治北造百规热领七海口东导器压志世金增争济阶油思术极交受联什认六共权收证改清己美再采转更单风切打白教速花带安场身车例真务具万每目至达走积示议声报斗完类八离华名确才科张信马节话米整空元况今集温传土许步群广石记需段研界拉林律叫且究观越织装影算低持音众书布复容儿须际商非验连断深难近矿千周委素技备半办青省列习响约支般史感劳便团往酸历市克何除消构府称太准精值号率族维划选标写存候毛亲快效斯院查江型眼王按格养易置派层片始却专状育厂京识适属圆包火住调满县局照参红细引听该铁价严龙飞'

// 只有中日韩字符才抖动；ASCII、数字、标点直接给出，避免字宽跳变导致重排
const isCJK = (ch) => /[\u3400-\u9fff\uf900-\ufaff]/.test(ch)
const rand = () => POOL[(Math.random() * POOL.length) | 0]
const scramble = (chars) => chars.map((c) => (isCJK(c) ? rand() : c)).join('')

export default function DecryptText({
  text,
  className = '',
  speed = 26,
  hold = 220,
}) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const chars = [...text]
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.textContent = text
      return
    }

    el.textContent = scramble(chars)

    let raf = 0
    let start = 0
    let done = false
    let io = null

    const run = () => {
      const step = (now) => {
        if (!start) start = now
        const t = now - start
        const reveal = Math.min(chars.length, Math.floor((t - hold + speed) / speed))
        if (reveal < 0) {
          el.textContent = scramble(chars)
        } else {
          let out = ''
          for (let i = 0; i < chars.length; i++) {
            if (i < reveal || chars[i] === ' ') out += chars[i]
            else out += isCJK(chars[i]) ? rand() : chars[i]
          }
          el.textContent = out
        }
        if (reveal >= chars.length) {
          el.textContent = text
          done = true
          return
        }
        raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    }

    if (!window.IntersectionObserver) {
      run()
      return () => cancelAnimationFrame(raf)
    }

    io = new IntersectionObserver(
      (ents) => {
        ents.forEach((en) => {
          if (en.isIntersecting && !done) {
            io.disconnect()
            io = null
            run()
          }
        })
      },
      { threshold: 0.2 }
    )
    io.observe(el)

    return () => {
      cancelAnimationFrame(raf)
      io && io.disconnect()
    }
  }, [text, speed, hold])

  return <span ref={ref} className={`decrypt ${className}`.trim()} data-text={text} />
}
