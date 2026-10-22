import { useEffect, useState } from 'react'
import HeroScene from './HeroScene'
import { asset } from '../data'

export default function HeroBackground() {
  const [video, setVideo] = useState(false)

  // 有 public/media/hero.mp4 就自动切视频背景；没有就用程序化 3D 场景
  useEffect(() => {
    let alive = true
    fetch(asset('/media/hero.mp4'), { method: 'HEAD' })
      .then((r) => {
        const ct = r.headers.get('content-type') || ''
        if (alive && r.ok && ct.startsWith('video')) setVideo(true)
      })
      .catch(() => {})
    return () => {
      alive = false
    }
  }, [])

  return (
    <div className="hero-bg" aria-hidden="true">
      <HeroScene />
      {video && (
        <video className="hero-bg__video is-on" src={asset('/media/hero.mp4')} autoPlay muted loop playsInline />
      )}
      <div className="hero-bg__glow" />
      <div className="hero-bg__vignette" />
      <div className="hero-bg__grain" />
    </div>
  )
}
