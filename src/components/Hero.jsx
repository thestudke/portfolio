import { useRef } from 'react'
import HeroBackground from './HeroBackground'
import { Chars, useBounceHover } from './Chars'
import DecryptText from './DecryptText'
import { profile, stats } from '../data'

export default function Hero() {
  const ref = useRef(null)
  const titleRef = useBounceHover({ stagger: 18 })

  const onMove = (e) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    el.style.setProperty('--mx', `${((e.clientX - rect.left) / rect.width) * 100}%`)
    el.style.setProperty('--my', `${((e.clientY - rect.top) / rect.height) * 100}%`)
  }

  return (
    <section className="hero" id="top" ref={ref} onMouseMove={onMove}>
      <HeroBackground />
      <div className="hero__spotlight" aria-hidden="true" />

      <div className="hero__content shell">
        <div className="hero__eyebrow">
          <span className="dot" />
          <span className="mono">AI AGENT ENGINEERING</span>
          <span className="rule" />
          <span className="mono dim">PORTFOLIO 2026</span>
        </div>

        <h1 className="hero__title" ref={titleRef}>
          {profile.headline.map((line, i) => (
            <span key={line} className={`line line--${i}`} style={{ '--d': `${i * 90}ms` }}>
              <Chars text={line} />
            </span>
          ))}
        </h1>

        <div className="hero__foot">
          <p className="hero__lede">
            <DecryptText text={profile.lede} speed={30} hold={420} />
          </p>
          <div className="hero__actions">
            <a className="btn btn--primary" href="#work">
              查看精选项目
              <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
                <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
              </svg>
            </a>
            <a className="btn btn--line" href="#profile">
              个人经历
            </a>
          </div>
        </div>
      </div>

      <div className="hero__rail shell">
        <div className="hero__facts">
          <div>
            <span className="mono dim">BASED IN</span>
            <b>{profile.location}</b>
          </div>
          <div>
            <span className="mono dim">PROJECTS</span>
            <b>{stats[0].value} 个</b>
          </div>
          <div>
            <span className="mono dim">FOCUS</span>
            <b>Agent 编排 / RAG / 数据分析</b>
          </div>
        </div>
        <a className="hero__scroll" href="#profile" aria-label="向下滚动">
          <span className="mono">SCROLL</span>
          <i />
        </a>
      </div>
    </section>
  )
}
