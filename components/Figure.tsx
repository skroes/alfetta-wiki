import { useState } from 'react'

type FigureProps = {
  src: string
  caption?: string
  alt?: string
  page?: number
  float?: 'left' | 'right'
  size?: 'sm' | 'md' | 'lg' | 'full'
}

const SIZES = {
  sm: '240px',
  md: '360px',
  lg: '480px',
  full: '100%',
}

export default function Figure({ src, caption, alt, page, float, size = 'md' }: FigureProps) {
  const [open, setOpen] = useState(false)
  const imgSrc = src.startsWith('/') ? src : `/figures/doc-04/${src}${src.endsWith('.png') ? '' : '.png'}`
  const displayAlt = alt || caption || src

  const floatStyle = float ? {
    float: float as 'left' | 'right',
    margin: float === 'left' ? '0.25rem 1.25rem 0.75rem 0' : '0.25rem 0 0.75rem 1.25rem',
    maxWidth: SIZES[size === 'full' ? 'lg' : size],
  } : {}

  return (
    <>
      <style>{`
        .fig-inline {
          border: 1px solid #e5e7eb;
          border-radius: 0.5rem;
          overflow: hidden;
          margin: 0.75rem 0;
          transition: box-shadow 0.15s;
        }
        :is(html[class~="dark"]) .fig-inline {
          border-color: #374151;
        }
        .fig-inline:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        :is(html[class~="dark"]) .fig-inline:hover {
          box-shadow: 0 2px 8px rgba(255,255,255,0.06);
        }
        .fig-inline-thumb {
          background: #f9fafb;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: zoom-in;
        }
        :is(html[class~="dark"]) .fig-inline-thumb {
          background: #111827;
        }
        .fig-inline-caption {
          padding: 0.375rem 0.625rem;
          font-size: 0.8rem;
          line-height: 1.4;
          color: #374151;
          border-top: 1px solid #e5e7eb;
        }
        :is(html[class~="dark"]) .fig-inline-caption {
          color: #d1d5db;
          border-top-color: #374151;
        }
        .fig-inline-page {
          color: #9ca3af;
          font-size: 0.7rem;
        }
        .fig-lightbox-bg {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          z-index: 50;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          cursor: zoom-out;
        }
        .fig-lightbox-img {
          max-width: 90vw;
          max-height: 88vh;
          border-radius: 0.375rem;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
        }
        .fig-lightbox-caption {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          text-align: center;
          padding: 0.75rem;
          background: rgba(0,0,0,0.6);
          color: #e5e7eb;
          font-size: 0.85rem;
        }
        @media (max-width: 640px) {
          .fig-inline[style] {
            float: none !important;
            margin-left: 0 !important;
            margin-right: 0 !important;
            max-width: 100% !important;
          }
        }
      `}</style>

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
            {caption}{page ? <> <span className="fig-inline-page">— DOC-04 p.{page}</span></> : null}
          </figcaption>
        )}
      </figure>

      {/* Lightbox */}
      {open && (
        <div className="fig-lightbox-bg" onClick={() => setOpen(false)}>
          <img src={imgSrc} alt={displayAlt} className="fig-lightbox-img" />
          {caption && <div className="fig-lightbox-caption">{caption}{page ? ` — DOC-04 p.${page}` : ''}</div>}
        </div>
      )}
    </>
  )
}
