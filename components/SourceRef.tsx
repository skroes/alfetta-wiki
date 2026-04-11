import React from 'react'

type SourceLanguage = 'it' | 'en' | 'nl' | 'de' | 'fr'

type SourceProps = {
  doc: string
  title: string
  pages: number[]
  url: string
  language?: SourceLanguage
}

export function SourceRef(props: SourceProps) {
  const { doc, title, pages, url, language = 'it' } = props
  const firstPage = pages[0]
  const rangeLabel =
    pages.length === 1 ? `p. ${pages[0]}` : `p. ${pages[0]}–${pages[pages.length - 1]}`
  const deepLink = `${url}#page=${firstPage}`
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
      <div style={{ marginTop: '0.4rem' }}>
        <a href={deepLink} target="_blank" rel="noreferrer">
          PDF openen ↗
        </a>
      </div>
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
