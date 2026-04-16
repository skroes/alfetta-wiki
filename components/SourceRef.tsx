import React from 'react'

type SourceLanguage = 'it' | 'en' | 'nl' | 'de' | 'fr'

type SourceProps = {
  doc: string
  title: string
  pages: number[]
  pdf?: string
  archive_url?: string
  /** Legacy prop — nieuwe pagina's gebruiken pdf + archive_url */
  url?: string
  language?: SourceLanguage
}

/** Korte display-naam: "DOC-04" → "Alfetta Workshop Manual" */
const DOC_DISPLAY: Record<string, string> = {
  'DOC-03': 'Alfetta Workshop Manual — Transmission/Suspension/Steering/Brakes',
  'DOC-04': 'Alfetta Workshop Manual — Engine',
  'DOC-05': 'Alfetta Workshop Manual — Clutch/Gearbox/Differential',
  'DOC-06': 'Alfetta Inspection Specifications — Berlina & Coupé',
}

export function SourceRef(props: SourceProps) {
  const { doc, title, pages, pdf, archive_url, url, language = 'it' } = props
  const rangeLabel =
    pages.length === 1 ? `p.\u00A0${pages[0]}` : `p.\u00A0${pages[0]}–${pages[pages.length - 1]}`

  const displayName = DOC_DISPLAY[doc] ?? doc
  const primarySource = pdf ?? url

  return (
    <aside
      id="source-ref"
      style={{
        marginTop: '2rem',
        padding: '1rem 1.25rem',
        borderLeft: '4px solid #cc0000',
        background: 'rgba(204,0,0,0.06)',
        fontSize: '0.95rem',
        borderRadius: '4px',
      }}
    >
      <div>
        <span style={{ marginRight: '0.4em' }}>📄</span>
        <strong>Bron: {displayName}</strong> — {title}, {rangeLabel} ({language.toUpperCase()})
      </div>

      {/* Per-pagina deep-links: eerst alle PDF-jumps, dan alle JPG page-scans */}
      <div style={{ marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.2rem', fontSize: '0.9em' }}>
        {primarySource && pages.map((p) => (
          <a
            key={`pdf-${p}`}
            href={`${primarySource}#page=${p}`}
            target="_blank"
            rel="noreferrer"
            style={{ textDecoration: 'underline' }}
          >
            📕 open PDF (opent op pagina p{p}) ↗
          </a>
        ))}
        {pages.length > 0 && <div style={{ height: '0.4rem' }} />}
        {pages.map((p) => {
          const pagePadded = String(p).padStart(3, '0')
          return (
            <a
              key={`scan-${p}`}
              href={`/pages/${doc}/${pagePadded}.jpg`}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: 'underline' }}
            >
              🖼️ open pagina p{p} scan (JPG) ↗
            </a>
          )
        })}
      </div>

      {archive_url && (
        <div style={{ marginTop: '0.3rem', fontSize: '0.85em', opacity: 0.75 }}>
          Archief-locatie:{' '}
          <span>{archive_url.replace(/^https?:\/\//, '').replace(/\/+$/, '')}</span>
        </div>
      )}
    </aside>
  )
}

type CiteProps = { p: number | string }

export function Cite({ p }: CiteProps) {
  return (
    <a
      href="#source-ref"
      style={{ fontSize: '0.85em', verticalAlign: 'super', textDecoration: 'none' }}
      aria-label={`Bronverwijzing naar pagina ${p}`}
    >
      [p{p}]
    </a>
  )
}
