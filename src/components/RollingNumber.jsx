/**
 * 滚动数字：像老式计数器那样逐位翻滚到目标值。
 * 每一位是一列 0–9，激活后 translateY 到目标数字，错峰 + 轻微过冲。
 */

export default function RollingNumber({ value, suffix = '', active = true, stagger = 70 }) {
  const chars = [...String(value)]

  return (
    <span className="rollnum" aria-label={`${value}${suffix}`}>
      {chars.map((ch, i) =>
        /\d/.test(ch) ? (
          <span className="rollnum__col" key={`${i}-${ch}`} style={{ '--d': `${i * stagger}ms` }}>
            <span
              className="rollnum__strip"
              style={{ transform: active ? `translateY(-${Number(ch)}em)` : 'translateY(0em)' }}
            >
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                <span key={n}>{n}</span>
              ))}
            </span>
          </span>
        ) : (
          <span className="rollnum__lit" key={`${i}-${ch}`}>
            {ch}
          </span>
        )
      )}
      {suffix ? <em className="rollnum__suffix">{suffix}</em> : null}
    </span>
  )
}
