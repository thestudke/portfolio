import { useEffect, useRef, useState } from 'react'

const formatDuration = (sec) => {
  const s = Math.max(0, Math.round(sec))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${m}:${String(r).padStart(2, '0')}`
}

/**
 * 案例详解：站内弹层，不跳二级页。
 * - 点遮罩 / 按 Esc / 点关闭 都能退
 * - 打开时锁 body 滚动，关闭时还原
 */
export default function CaseDetail({ project, onClose }) {
  const panelRef = useRef(null)
  const [mediaFailed, setMediaFailed] = useState(false)

  useEffect(() => {
    setMediaFailed(false)
  }, [project])

  useEffect(() => {
    if (!project) return
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    panelRef.current?.focus()
    return () => {
      document.body.style.overflow = prevOverflow
      document.removeEventListener('keydown', onKey)
    }
  }, [project, onClose])

  if (!project) return null
  const d = project.detail || { blocks: [], metrics: [], stack: '' }

  // video 支持两种写法：字符串，或 { src, poster, duration, caption, autoplay, loop }
  // 长视频（>30s 或显式 autoplay:false）走「点播放」模式，不自动播，带原生控件
  const rawVideo = d.video
  const video =
    typeof rawVideo === 'string' ? { src: rawVideo } : rawVideo || null
  const videoLong =
    !!video && (video.autoplay === false || (video.duration || 0) > 30)
  const showVideo = !!video && !mediaFailed

  return (
    <div
      className="detail"
      role="dialog"
      aria-modal="true"
      aria-label={`${project.title} 案例详解`}
      onClick={onClose}
    >
      <div
        className="detail__panel"
        ref={panelRef}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="detail__head">
          <div className="detail__title">
            <span className="detail__kicker mono">
              CASE {project.id} · {project.subtitle}
            </span>
            <h3>{project.title}</h3>
          </div>
          <button type="button" className="detail__close mono" onClick={onClose}>
            关闭 ESC
            <svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
              <path d="M4 4l8 8M12 4l-8 8" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
        </header>

        <div className="detail__meta">
          <div>
            <span className="mono">ROLE</span>
            <p>{d.role}</p>
          </div>
          <div>
            <span className="mono">PERIOD</span>
            <p>{d.period}</p>
          </div>
          <div>
            <span className="mono">STACK</span>
            <p>{d.stack}</p>
          </div>
        </div>

        {showVideo && (
          <figure
            className={`detail__shot detail__shot--video detail__shot--wide${
              video.bleed ? ' detail__shot--bleed' : ''
            }`}
          >
            <video
              src={video.src}
              poster={video.poster || project.image}
              autoPlay={!videoLong}
              muted
              loop={!videoLong}
              playsInline
              controls={videoLong}
              preload="metadata"
              onError={() => setMediaFailed(true)}
            />
            <figcaption className="detail__media-tag mono">
              <i />
              {video.caption || (videoLong ? '无声演示' : '无声循环演示')}
              {video.duration ? ` · ${formatDuration(video.duration)}` : ''}
            </figcaption>
          </figure>
        )}

        <div className="detail__body">
          <div className="detail__blocks">
            {d.blocks.map((b) => (
              <section key={b.t}>
                <h4>{b.t}</h4>
                <p>{b.p}</p>
              </section>
            ))}
          </div>

          <aside className="detail__side">
            {!showVideo && (
              <figure className="detail__shot">
                <img src={project.image} alt={`${project.title} 界面截图`} />
              </figure>
            )}
            <dl className="detail__facts">
              {d.metrics.map(([k, v]) => (
                <div key={k}>
                  <dt className="mono">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <div className="chips">
              {project.tags.map((t) => (
                <span key={t} className="chip">
                  {t}
                </span>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
