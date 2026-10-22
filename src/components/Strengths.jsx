import { strengths } from '../data'
import { useReveal } from '../hooks'
import { Chars, useBounceHover } from './Chars'
import DecryptText from './DecryptText'

function Card({ item, index }) {
  const [ref, shown] = useReveal()
  return (
    <article
      className={`strength reveal${shown ? ' is-in' : ''}`}
      ref={ref}
      style={{ '--d': `${index * 70}ms` }}
    >
      <span className="strength__corner" aria-hidden="true" />
      <div className="strength__top mono">
        <span>{item.id}</span>
        <span className="dim">CAPABILITY</span>
      </div>
      <h3>{item.title}</h3>
      <p>{item.desc}</p>
      <div className="chips">
        {item.chips.map((c) => (
          <span key={c} className="chip">
            {c}
          </span>
        ))}
      </div>
    </article>
  )
}

export default function Strengths() {
  const [headRef, headShown] = useReveal()
  const titleRef = useBounceHover()

  return (
    <section className="section" id="capabilities">
      <div className="shell section__grid">
        <aside className="section__aside">
          <span className="section__index mono">03</span>
          <span className="section__label">个人优势</span>
          <span className="section__en mono">CAPABILITIES</span>
        </aside>

        <div className="section__body">
          <header className={`sec-head reveal${headShown ? ' is-in' : ''}`} ref={headRef}>
            <h2 ref={titleRef}>
              <Chars text="六项能独立交付的能力" />
              <br />
              <span className="muted">
                <Chars text="每项都有对应项目作证据" />
              </span>
            </h2>
            <p>
              <DecryptText text="这里的每一条，都能在项目里找到对应的代码、机制说明，以及我踩过的失效场景。" />
            </p>
          </header>

          <div className="strengths">
            {strengths.map((s, i) => (
              <Card key={s.id} item={s} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
