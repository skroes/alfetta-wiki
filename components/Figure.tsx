import { useState } from 'react'

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

export default function Figure({ src, caption, alt, page, doc, float, size = 'md' }: FigureProps) {
  const [open, setOpen] = useState(false)
  const docSlug = resolveDocSlug(src, doc)
  const hasExt = /\.(png|jpe?g|webp|svg)$/i.test(src)
  const imgSrc = src.startsWith('/') ? src : `/figures/${docSlug}/${src}${hasExt ? '' : '.png'}`
  const displayAlt = alt || caption || src
  const docLabel = docSlug.toUpperCase().replace(/^DOC-/, 'DOC-')

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
        {/* Thumbnail — left click opens lightbox, right click gives native context menu on the <a> */}
        <a
          href={imgSrc}
          onClick={e => { e.preventDefault(); setOpen(true) }}
          className="fig-inline-thumb"
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

      {/* Lightbox */}
      {open && (
        <div className="fig-lightbox-bg" onClick={() => setOpen(false)}>
          <img src={imgSrc} alt={displayAlt} className="fig-lightbox-img" />
          {caption && <div className="fig-lightbox-caption">{caption}{page ? ` — ${docLabel} p.${page}` : ''}</div>}
        </div>
      )}
    </>
  )
}
