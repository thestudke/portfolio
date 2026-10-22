import { useState } from 'react'
import { projects, moreProjects } from '../data'
import { useReveal } from '../hooks'
import { Chars, useBounceHover } from './Chars'
import DecryptText from './DecryptText'
import CaseDetail from './CaseDetail'

function Case({ project, index, onOpen }) {
  const [ref, shown] = useReveal({ threshold: 0.14 })
  const flip = index % 2 === 1

  return (
    <article className={`case${flip ? ' case--flip' : ''} reveal${shown ? ' is-in' : ''}`} ref={ref}>
      <span className="case__ticks" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      <button
        type="button"
        className="case__media"
        onClick={() => onOpen(project)}
        aria-label={`查看 ${project.title} 案例详解`}
      >
        <img src={project.image} alt={`${project.title} 界面截图`} loading="lazy" />
        <span className="case__num mono">{project.id}</span>
        <span className="case__badge mono">FEATURED</span>
      </button>

      <div className="case__body">
        <div className="case__kicker mono">
          <span>{project.subtitle}</span>
        </div>
        <h3>{project.title}</h3>
        <p className="case__summary">{project.summary}</p>

        <ul className="case__metrics">
          {project.metrics.map(([k, v]) => (
            <li key={k}>
              <span className="mono dim">{k}</span>
              <b>{v}</b>
            </li>
          ))}
        </ul>

        <div className="chips">
          {project.tags.map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>

        <button type="button" className="case__cta" onClick={() => onOpen(project)}>
          查看案例详解
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
            <path d="M2 8h11M9 4l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.5" />
          </svg>
        </button>
      </div>
    </article>
  )
}

function MoreRow({ item, index }) {
  const [ref, shown] = useReveal()
  return (
    <a
      className={`more-row reveal${shown ? ' is-in' : ''}`}
      ref={ref}
      href={`#work`}
      style={{ '--d': `${index * 60}ms` }}
    >
      <span className="more-row__id mono">{item.id}</span>
      <span className="more-row__thumb">
        <img src={item.image} alt="" loading="lazy" />
      </span>
      <span className="more-row__main">
        <b>{item.title}</b>
        <em>{item.desc}</em>
      </span>
      <span className="more-row__meta mono">{item.meta}</span>
      <span className="more-row__arrow">
        <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true">
          <path d="M3 13 13 3M13 3H6m7 0v7" fill="none" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </span>
    </a>
  )
}

export default function Projects() {
  const [headRef, headShown] = useReveal()
  const titleRef = useBounceHover()
  const [open, setOpen] = useState(null)

  return (
    <section className="section" id="work">
      <div className="shell section__grid">
        <aside className="section__aside">
          <span className="section__index mono">02</span>
          <span className="section__label">精选项目</span>
          <span className="section__en mono">SELECTED WORK</span>
        </aside>

        <div className="section__body">
          <header className={`sec-head reveal${headShown ? ' is-in' : ''}`} ref={headRef}>
            <h2 ref={titleRef}>
              <Chars text="三个主推案例" />
              <br />
              <span className="muted">
                <Chars text="每个都有真实数字和失败记录" />
              </span>
            </h2>
            <p>
              <DecryptText text="下面每个案例都写了运行路径与代码位置：入口文件、启动命令、预期输出。写进去的每个数字都来自实际运行，写进去的每个坑都真踩过。" />
            </p>
          </header>

          <div className="cases">
            {projects.map((p, i) => (
              <Case key={p.id} project={p} index={i} onOpen={setOpen} />
            ))}
          </div>

          <div className="more">
            <div className="more__head mono">
              <span>MORE WORK</span>
              <span className="dim">04 — 07</span>
            </div>
            {moreProjects.map((item, i) => (
              <MoreRow key={item.id} item={item} index={i} />
            ))}
          </div>
        </div>
      </div>

      <CaseDetail project={open} onClose={() => setOpen(null)} />
    </section>
  )
}
