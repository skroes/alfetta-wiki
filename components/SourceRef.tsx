import React from 'react'

type SourceLanguage = 'it' | 'en' | 'nl' | 'de' | 'fr'

type SourceProps = {
  doc: string
  title: string
  pages: number[]
  /**
   * Intern pad naar de gehoste PDF, bijv. "/docs/DOC-04-engine.pdf".
   * Dit bouwt de werkende deep-link met `#page=N` via de native browser
   * PDF-viewer. Verplicht voor nieuwe pagina's.
   */
  pdf?: string
  /**
   * Canonical herkomst-URL (meestal Google Drive). Wordt getoond als
   * "Archief-locatie" label. Klikbaar, maar Drive's viewer negeert `#page=`
   * — dus de primaire deep-link-knop wijst naar `pdf`, niet hiernaartoe.
   */
  archive_url?: string
  /**
   * Legacy prop (walking-skeleton pre-B-11). Als `pdf` ontbreekt valt de
   * component terug op `url` voor de deep-link. Nieuwe pagina's zetten
   * `pdf` + `archive_url` en laten `url` weg.
   */
  url?: string
  language?: SourceLanguage
}

export function SourceRef(props: SourceProps) {
  const { doc, title, pages, pdf, archive_url, url, language = 'it' } = props
  const firstPage = pages[0]
  const rangeLabel =
    pages.length === 1 ? `p. ${pages[0]}` : `p. ${pages[0]}–${pages[pages.length - 1]}`

  // Primaire deep-link — bij voorkeur de lokaal-gehoste PDF (native viewer
  // honoreert #page=N). Fallback op legacy `url` voor backwards-compat.
  const primarySource = pdf ?? url
  const deepLink = primarySource ? `${primarySource}#page=${firstPage}` : undefined

  return (
    <aside
      id="source-ref"
      style={{
        marginTop: '2rem',
        padding: '1rem 1.25rem',
        borderLeft: '4px solid #cc0000',
        background: 'rgba(204,0,0,0.06)',
        fontSize: '0.95rem',
        borderRadius: '4px'
      }}
    >
      <div>
        <strong>Bron: {doc}</strong> — {title}, {rangeLabel} ({language.toUpperCase()})
      </div>
      {deepLink && (
        <div style={{ marginTop: '0.4rem' }}>
          <a href={deepLink} target="_blank" rel="noreferrer">
            PDF openen op p. {firstPage} ↗
          </a>
        </div>
      )}
      {archive_url && (
        <div style={{ marginTop: '0.3rem', fontSize: '0.85em', opacity: 0.75 }}>
          Archief-locatie:{' '}
          <a href={archive_url} target="_blank" rel="noreferrer">
            {archive_url.replace(/^https?:\/\//, '').replace(/\/+$/, '')}
          </a>
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
