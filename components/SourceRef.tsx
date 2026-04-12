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
  'DOC-04': 'Alfetta Workshop Manual — Engine',
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

      {/* Per-pagina deep-links naar de PDF */}
      {primarySource && (
        <div style={{ marginTop: '0.4rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {pages.map((p) => (
            <a
              key={p}
              href={`${primarySource}#page=${p}`}
              target="_blank"
              rel="noreferrer"
              style={{ textDecoration: 'underline' }}
            >
              <span style={{ marginRight: '0.25em' }}>📕</span>
              PDF openen op p.{'\u00A0'}{p} ↗
            </a>
          ))}
        </div>
      )}

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
