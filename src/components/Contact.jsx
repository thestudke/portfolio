import { profile } from '../data'
import { useCopy, useReveal } from '../hooks'
import { Chars, useBounceHover } from './Chars'

export default function Contact() {
  const [copied, copy] = useCopy()
  const [ref, shown] = useReveal({ threshold: 0.2 })
  const titleRef = useBounceHover()
  const email = profile.contacts[0].value

  return (
    <section className="contact" id="contact" ref={ref}>
      <div className="contact__bg" aria-hidden="true" />
      <div className="shell contact__inner">
        <div className={`contact__eyebrow mono${shown ? ' is-in' : ''}`}>
          <span className="dot" />
          04 / CONTACT
          <span className="rule" />
          <span className="dim">OPEN TO WORK</span>
        </div>

        <h2 className={`contact__title${shown ? ' is-in' : ''}`} ref={titleRef}>
          <Chars text="有项目，或者只是想聊聊" />
          <br />
          <span className="muted">
            <Chars text="都可以直接找我" />
          </span>
        </h2>

        <div className={`contact__mail${shown ? ' is-in' : ''}`}>
          <a href={`mailto:${email}`} className="contact__link">
            {email}
          </a>
          <button type="button" className="btn btn--line btn--sm" onClick={() => copy(email)}>
            {copied === email ? '已复制 ✓' : '复制邮箱'}
          </button>
        </div>

        <div className={`contact__grid${shown ? ' is-in' : ''}`}>
          {profile.contacts.slice(1).map((c) => (
            <a
              key={c.label}
              className="contact__cell"
              href={c.href || '#'}
              target={c.href?.startsWith('http') ? '_blank' : undefined}
              rel="noreferrer"
            >
              <span className="mono dim">{c.label}</span>
              <b>{c.value}</b>
              <span className="contact__arrow">↗</span>
            </a>
          ))}
        </div>

        <footer className="contact__footer">
          <div>
            <span className="mono dim">© 2026 {profile.name}</span>
            <span className="mono dim">作品集 · 全部数据来自实际运行结果</span>
          </div>
          <div>
            <span className="mono dim">REACT · VITE · 0 DEPENDENCY UI</span>
            <a href="#top" className="backtop mono">
              回到顶部 ↑
            </a>
          </div>
        </footer>
      </div>
    </section>
  )
}
