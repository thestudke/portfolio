import { profile, stats, timeline } from '../data'
import { useCopy, useReveal } from '../hooks'
import { Chars, useBounceHover } from './Chars'
import DecryptText from './DecryptText'
import RollingNumber from './RollingNumber'

function Stat({ item }) {
  const [ref, shown] = useReveal({ threshold: 0.4 })

  return (
    <div className="stat" ref={ref}>
      <div className="stat__num mono">
        <RollingNumber value={item.value} suffix={item.suffix} active={shown} />
      </div>
      <div className="stat__label">{item.label}</div>
      <div className="stat__note">{item.note}</div>
    </div>
  )
}

export default function Experience() {
  const [copied, copy] = useCopy()
  const [headRef, headShown] = useReveal()
  const [bodyRef, bodyShown] = useReveal()
  const titleRef = useBounceHover()

  return (
    <section className="section" id="profile">
      <div className="shell section__grid">
        <aside className="section__aside">
          <span className="section__index mono">01</span>
          <span className="section__label">经历</span>
          <span className="section__en mono">PROFILE</span>
        </aside>

        <div className="section__body">
          <header className={`sec-head reveal${headShown ? ' is-in' : ''}`} ref={headRef}>
            <h2 ref={titleRef}>
              <Chars text="三年写代码，" />
              <br />
              <span className="muted">
                <Chars text="一年在做「能落地」的 AI" />
              </span>
            </h2>
            <p>
              <DecryptText
                text={`我是${profile.name}，${profile.role}方向。做过医疗问诊的多智能体平台、企业年报的可溯源问答、298 万条电商行为的建模分析，也做过爬虫、全栈与可视化。我关心的不是「能不能跑通一个 demo」，而是「上线后它会不会在某个环节悄悄失效」。`}
              />
            </p>
          </header>

          <div className={`stats reveal${bodyShown ? ' is-in' : ''}`} ref={bodyRef}>
            {stats.map((s) => (
              <Stat key={s.label} item={s} />
            ))}
          </div>

          <div className="contact-strip">
            <div className="contact-strip__label mono">CONTACT</div>
            <ul className="contact-strip__list">
              {profile.contacts.map((c) => (
                <li key={c.label}>
                  <span className="mono dim">{c.label}</span>
                  {c.href ? (
                    <a href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                      {c.value}
                    </a>
                  ) : (
                    <span>{c.value}</span>
                  )}
                  <button
                    type="button"
                    className={`copy${copied === c.value ? ' is-copied' : ''}`}
                    onClick={() => copy(c.value)}
                    aria-label={`复制 ${c.label}`}
                  >
                    {copied === c.value ? '已复制' : '复制'}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <ol className="timeline">
            {timeline.map((item, i) => (
              <TimelineRow key={item.title} item={item} index={i} />
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

function TimelineRow({ item, index }) {
  const [ref, shown] = useReveal()
  return (
    <li className={`timeline__row reveal${shown ? ' is-in' : ''}`} ref={ref} style={{ '--d': `${index * 70}ms` }}>
      <div className="timeline__dot" />
      <div className="timeline__period mono">{item.period}</div>
      <div className="timeline__main">
        <h3>{item.title}</h3>
        <div className="timeline__org">{item.org}</div>
        <p>{item.desc}</p>
        <div className="chips">
          {item.tags.map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>
      </div>
    </li>
  )
}
