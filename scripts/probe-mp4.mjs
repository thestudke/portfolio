/**
 * 不装 ffmpeg 也能读 mp4 元信息：解析 box 结构，拿 duration / 分辨率 / 有没有音轨。
 * 用法: node scripts/probe-mp4.mjs <file.mp4> [...more]
 */
import fs from 'node:fs'
import path from 'node:path'

const readBoxes = (buf, start, end, depth = 0, out = []) => {
  let off = start
  while (off + 8 <= end) {
    let size = buf.readUInt32BE(off)
    const type = buf.toString('ascii', off + 4, off + 8)
    let header = 8
    if (size === 1) {
      size = Number(buf.readBigUInt64BE(off + 8))
      header = 16
    } else if (size === 0) {
      size = end - off
    }
    if (size < header || off + size > end) break
    out.push({ type, start: off + header, end: off + size, depth })
    if (['moov', 'trak', 'mdia', 'minf', 'stbl', 'edts', 'udta'].includes(type)) {
      readBoxes(buf, off + header, off + size, depth + 1, out)
    }
    off += size
  }
  return out
}

const probe = (file) => {
  const buf = fs.readFileSync(file)
  const boxes = readBoxes(buf, 0, buf.length)
  const find = (t) => boxes.filter((b) => b.type === t)

  const mvhd = find('mvhd')[0]
  let duration = null
  let timescale = null
  if (mvhd) {
    const version = buf.readUInt8(mvhd.start)
    timescale =
      version === 1 ? buf.readUInt32BE(mvhd.start + 20) : buf.readUInt32BE(mvhd.start + 12)
    const dur =
      version === 1
        ? Number(buf.readBigUInt64BE(mvhd.start + 24))
        : buf.readUInt32BE(mvhd.start + 16)
    duration = timescale ? dur / timescale : null
  }

  // 每条 trak 的 handler 类型
  const tracks = []
  for (const trak of find('trak')) {
    const hdlr = boxes.find(
      (b) => b.type === 'hdlr' && b.start > trak.start && b.end < trak.end
    )
    const tkhd = boxes.find(
      (b) => b.type === 'tkhd' && b.start > trak.start && b.end < trak.end
    )
    let handler = null
    if (hdlr) handler = buf.toString('ascii', hdlr.start + 8, hdlr.start + 12)
    let w = null
    let h = null
    if (tkhd) {
      const version = buf.readUInt8(tkhd.start)
      const base = version === 1 ? tkhd.start + 88 : tkhd.start + 76
      if (base + 8 <= tkhd.end) {
        w = Math.round(buf.readUInt32BE(base) / 65536)
        h = Math.round(buf.readUInt32BE(base + 4) / 65536)
      }
    }
    tracks.push({ handler, w, h })
  }

  return {
    file: path.basename(file),
    mb: +(fs.statSync(file).size / 1048576).toFixed(2),
    durationSec: duration ? +duration.toFixed(1) : null,
    durationText: duration
      ? `${Math.floor(duration / 60)}:${String(Math.round(duration % 60)).padStart(2, '0')}`
      : null,
    video: tracks.filter((t) => t.handler === 'vide')[0] || null,
    hasAudio: tracks.some((t) => t.handler === 'soun'),
    tracks: tracks.map((t) => t.handler),
  }
}

for (const f of process.argv.slice(2)) {
  console.log(JSON.stringify(probe(f), null, 2))
}
