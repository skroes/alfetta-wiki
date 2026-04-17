import { useEffect, useState } from 'react'

type FigureProps = {
  src: string
  caption?: string
  alt?: string
  page?: number
  doc?: string
  float?: 'left' | 'right'
  size?: 'sm' | 'md' | 'lg' | 'full'
}

const SIZES = {
  sm: '240px',
  md: '360px',
  lg: '480px',
  full: '100%',
}

// Leid doc-folder af uit src-prefix (doc03- → doc-03) of uit expliciete doc prop.
function resolveDocSlug(src: string, doc?: string): string {
  if (doc) return doc.toLowerCase().replace(/^doc-?/, 'doc-')
  const m = src.match(/^(doc\d+)-/)
  if (m) return m[1].replace(/^doc/, 'doc-')
  return 'doc-04' // legacy fallback
}

type LightboxView = {
  src: string
  caption: string
  page?: number
  docLabel: string
  alt: string
  idx: number
  total: number
}

export default function Figure({ src, caption, alt, page, doc, float, size = 'md' }: FigureProps) {
  const docSlug = resolveDocSlug(src, doc)
  const hasExt = /\.(png|jpe?g|webp|svg)$/i.test(src)
  const imgSrc = src.startsWith('/') ? src : `/figures/${docSlug}/${src}${hasExt ? '' : '.png'}`
  const displayAlt = alt || caption || src
  const docLabel = docSlug.toUpperCase().replace(/^DOC-/, 'DOC-')

  // Lightbox state — `view` bevat de huidig getoonde figuur (kan verschillen van
  // deze component's eigen props wanneer de gebruiker door pijl-toetsen de
  // volgende/vorige figuur op dezelfde wiki-pagina bekijkt).
  const [view, setView] = useState<LightboxView | null>(null)
  const open = view !== null

  // Zoom-cyclus: 0 (100%) → 1 (120%) → 2 (140%) → 0. Transform-origin volgt
  // de muispositie voor "pan" gevoel zonder drag. Reset bij navigatie/sluiten.
  const [zoomLevel, setZoomLevel] = useState(0)
  const [zoomOrigin, setZoomOrigin] = useState('50% 50%')
  const resetZoom = () => { setZoomLevel(0); setZoomOrigin('50% 50%') }

  const openLightbox = () => {
    resetZoom()
    const anchors = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('a.fig-inline-thumb')
    )
    const idx = anchors.findIndex(a => a.getAttribute('href') === imgSrc)
    setView({
      src: imgSrc,
      caption: caption || '',
      page,
      docLabel,
      alt: displayAlt,
      idx: idx >= 0 ? idx : 0,
      total: anchors.length || 1,
    })
  }

  // Navigeer naar prev/next inline-figure in DOM-volgorde. Gebruikt door zowel
  // keyboard-handler als topbar-knoppen. Geeft boolean terug of navigatie lukte.
  const navigate = (dir: 'prev' | 'next'): boolean => {
    if (!view) return false
    const anchors = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('a.fig-inline-thumb')
    )
    if (!anchors.length) return false
    const idx = anchors.findIndex(a => a.getAttribute('href') === view.src)
    if (idx < 0) return false
    const nextIdx = dir === 'next'
      ? Math.min(idx + 1, anchors.length - 1)
      : Math.max(idx - 1, 0)
    if (nextIdx === idx) return false
    const a = anchors[nextIdx]
    const nextSrc = a.getAttribute('href') || ''
    const nextCaption = a.getAttribute('data-caption') || ''
    const nextPage = parseInt(a.getAttribute('data-page') || '', 10)
    const nextDoc = a.getAttribute('data-doc') || docLabel
    const nextAlt = a.getAttribute('data-alt') || nextCaption || nextSrc
    setView({
      src: nextSrc,
      caption: nextCaption,
      page: Number.isFinite(nextPage) ? nextPage : undefined,
      docLabel: nextDoc,
      alt: nextAlt,
      idx: nextIdx,
      total: anchors.length,
    })
    resetZoom()
    return true
  }

  useEffect(() => {
    if (!view) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setView(null)
        return
      }
      if (e.key === 'ArrowLeft') {
        if (navigate('prev')) e.preventDefault()
      } else if (e.key === 'ArrowRight') {
        if (navigate('next')) e.preventDefault()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view, docLabel])

  const floatStyle = float ? {
    float: float as 'left' | 'right',
    margin: float === 'left' ? '0.25rem 1.25rem 0.75rem 0' : '0.25rem 0 0.75rem 1.25rem',
    maxWidth: SIZES[size === 'full' ? 'lg' : size],
  } : {}

  return (
    <>
      <figure
        className="fig-inline"
        style={{
          width: float ? undefined : SIZES[size],
          maxWidth: '100%',
          ...floatStyle,
        }}
      >
        {/* Thumbnail — left click opens lightbox, right click gives native context menu on the <a>.
            data-* attributes zijn nodig voor keyboard-navigatie tussen figures op dezelfde pagina. */}
        <a
          href={imgSrc}
          onClick={e => { e.preventDefault(); openLightbox() }}
          className="fig-inline-thumb"
          data-caption={caption || ''}
          data-page={page ?? ''}
          data-doc={docLabel}
          data-alt={displayAlt}
          style={{ display: 'flex', padding: '0.5rem' }}
        >
          <img
            src={imgSrc}
            alt={displayAlt}
            loading="lazy"
            style={{ maxWidth: '100%', maxHeight: size === 'sm' ? '160px' : size === 'md' ? '240px' : '320px', objectFit: 'contain' }}
          />
        </a>
        {(caption || page) && (
          <figcaption className="fig-inline-caption">
            {caption}{page ? <> <span className="fig-inline-page">— {docLabel} p.{page}</span></> : null}
          </figcaption>
        )}
      </figure>

      {/* Lightbox — toolbar als eigen header bovenin, body met image daaronder,
          optioneel caption-strook onderin. ArrowLeft/Right of topbar-knoppen
          navigeren door alle inline figures op deze pagina, Escape sluit.
          Klik op achtergrond (buiten toolbar/body/caption) sluit ook. */}
      {view && (
        <div className="fig-lightbox-bg" onClick={() => setView(null)}>
          <div
            className="fig-lightbox-toolbar"
            onClick={e => e.stopPropagation()}
          >
            {/* Linker zone — counter + DOC-XX p.N naast elkaar */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'baseline', gap: '0.75rem', color: 'white', fontSize: '0.85rem' }}>
              <span style={{ opacity: 0.65, fontVariantNumeric: 'tabular-nums' }}>
                {view.idx + 1} / {view.total}
              </span>
              {view.page && (
                <span style={{ opacity: 0.55 }}>
                  {view.docLabel} p.{view.page}
                </span>
              )}
            </div>
            {/* Centrale zone — pijltjes */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                aria-label="Vorige figuur"
                onClick={() => navigate('prev')}
                disabled={view.idx === 0}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: view.idx === 0 ? 'default' : 'pointer', padding: '0.25rem 0.75rem', lineHeight: 1, opacity: view.idx === 0 ? 0.3 : 0.9 }}
              >←</button>
              <button
                type="button"
                aria-label="Volgende figuur"
                onClick={() => navigate('next')}
                disabled={view.idx >= view.total - 1}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: view.idx >= view.total - 1 ? 'default' : 'pointer', padding: '0.25rem 0.75rem', lineHeight: 1, opacity: view.idx >= view.total - 1 ? 0.3 : 0.9 }}
              >→</button>
            </div>
            {/* Rechter zone — ✕ */}
            <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                aria-label="Sluiten"
                onClick={() => setView(null)}
                style={{ background: 'none', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', padding: '0.25rem 0.75rem', lineHeight: 1, opacity: 0.7 }}
              >✕</button>
            </div>
          </div>
          <div className="fig-lightbox-body">
            {view.caption && (
              <div className="fig-lightbox-title" onClick={e => e.stopPropagation()}>
                {view.caption}
              </div>
            )}
            <img
              src={view.src}
              alt={view.alt}
              className="fig-lightbox-img"
              onClick={e => {
                e.stopPropagation()
                const rect = e.currentTarget.getBoundingClientRect()
                const x = ((e.clientX - rect.left) / rect.width) * 100
                const y = ((e.clientY - rect.top) / rect.height) * 100
                setZoomOrigin(`${x}% ${y}%`)
                setZoomLevel(lvl => (lvl + 1) % 4)
              }}
              onMouseMove={e => {
                if (zoomLevel === 0) return
                const rect = e.currentTarget.getBoundingClientRect()
                const x = ((e.clientX - rect.left) / rect.width) * 100
                const y = ((e.clientY - rect.top) / rect.height) * 100
                setZoomOrigin(`${x}% ${y}%`)
              }}
              style={{
                transform: `scale(${1 + zoomLevel * 0.3})`,
                transformOrigin: zoomOrigin,
                transition: 'transform 0.25s ease',
                cursor: zoomLevel === 3 ? 'zoom-out' : 'zoom-in',
              }}
            />
          </div>
          <div className="fig-lightbox-foot" onClick={e => e.stopPropagation()}>
            <a
              href={view.src}
              target="_blank"
              rel="noopener noreferrer"
              className="fig-lightbox-filename"
            >
              {view.src.split('/').pop()}
            </a>
          </div>
        </div>
      )}
    </>
  )
}
