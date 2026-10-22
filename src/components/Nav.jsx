import { useEffect, useState } from 'react'
import { navItems, profile } from '../data'
import { useScrollProgress } from '../hooks'

export default function Nav() {
  const { y, progress } = useScrollProgress()
  const [open, setOpen] = useState(false)
  const solid = y > 36

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <>
      <header className={`nav${solid ? ' is-solid' : ''}`}>
        <div className="nav__inner shell">
          <a className="nav__brand" href="#top" aria-label="回到顶部">
            <span className="nav__mark mono">{profile.monogram}</span>
            <span className="nav__name">
              {profile.name}
              <em>{profile.role}</em>
            </span>
          </a>

          <nav className="nav__links" aria-label="主导航">
            {navItems.map((item, i) => (
              <a key={item.href} href={item.href} className="nav__link">
                <span className="mono">0{i + 1}</span>
                {item.label}
              </a>
            ))}
          </nav>

          <div className="nav__right">
            <span className="nav__status">
              <i />
              {profile.status}
            </span>
            <a className="btn btn--ghost" href="#contact">
              联系我
              <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
                <path d="M3 13 13 3M13 3H6m7 0v7" fill="none" stroke="currentColor" strokeWidth="1.4" />
              </svg>
            </a>
            <button
              className="nav__burger"
              onClick={() => setOpen((v) => !v)}
              aria-label="打开导航"
              aria-expanded={open}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
        <div className="nav__progress" style={{ transform: `scaleX(${progress})` }} />
      </header>

      <div className={`drawer${open ? ' is-open' : ''}`}>
        <div className="drawer__inner">
          {navItems.map((item, i) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)}>
              <span className="mono">0{i + 1}</span>
              {item.label}
            </a>
          ))}
          <a href="#contact" onClick={() => setOpen(false)} className="drawer__cta">
            联系我 →
          </a>
        </div>
      </div>
    </>
  )
}
