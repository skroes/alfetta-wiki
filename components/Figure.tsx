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

  const openLightbox = () => {
    setView({ src: imgSrc, caption: caption || '', page, docLabel, alt: displayAlt })
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
    })
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

      {/* Lightbox — ArrowLeft/Right of topbar-knoppen navigeren door alle inline
          figures op deze pagina, Escape sluit. Klik op achtergrond sluit ook. */}
      {view && (
        <div className="fig-lightbox-bg" onClick={() => setView(null)}>
          <div
            className="fig-lightbox-toolbar"
            onClick={e => e.stopPropagation()}
            style={{
              position: 'fixed',
              top: 0, left: 0, right: 0,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '0.75rem 1rem',
              background: 'rgba(0,0,0,0.45)',
              zIndex: 10,
            }}
          >
            <button
              type="button"
              aria-label="Vorige figuur"
              onClick={() => navigate('prev')}
              className="fig-lightbox-nav"
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                fontSize: '1.5rem',
                cursor: 'pointer',
                padding: '0.25rem 0.75rem',
                lineHeight: 1,
              }}
            >←</button>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button
                type="button"
                aria-label="Volgende figuur"
                onClick={() => navigate('next')}
                className="fig-lightbox-nav"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.25rem 0.75rem',
                  lineHeight: 1,
                }}
              >→</button>
              <button
                type="button"
                aria-label="Sluiten"
                onClick={() => setView(null)}
                className="fig-lightbox-nav"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'white',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  padding: '0.25rem 0.75rem',
                  lineHeight: 1,
                }}
              >✕</button>
            </div>
          </div>
          <img src={view.src} alt={view.alt} className="fig-lightbox-img" />
          {view.caption && (
            <div className="fig-lightbox-caption">
              {view.caption}{view.page ? ` — ${view.docLabel} p.${view.page}` : ''}
            </div>
          )}
        </div>
      )}
    </>
  )
}
