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

/** Herkenbaar label + gevalideerde href voor de archief-link (ISS-008).
 * Bij een waarde die geen absolute URL is: href null → geen kapotte
 * relatieve link, val terug op platte tekst. */
function archiveLink(url: string): { label: string; href: string | null } {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname
    if (host.includes('drive.google')) return { label: 'Google Drive', href: parsed.href }
    if (host.includes('docs.google')) return { label: 'Google Docs', href: parsed.href }
    return { label: host.replace(/^www\./, ''), href: parsed.href }
  } catch {
    return { label: url.replace(/^https?:\/\//, '').replace(/\/+$/, ''), href: null }
  }
}

/** Korte display-naam: "DOC-04" → "Alfetta Workshop Manual" */
const DOC_DISPLAY: Record<string, string> = {
  'DOC-01': 'Haynes Alfa Romeo Alfetta Owners Workshop Manual (aftermarket)',
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
        borderLeft: '4px solid var(--af-rosso, #cc0000)',
        background: 'var(--af-paper, rgba(204,0,0,0.06))',
        fontSize: '0.95rem',
        borderRadius: '0 6px 6px 0',
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

      {archive_url && (() => {
        const { label, href } = archiveLink(archive_url)
        return (
          <div style={{ marginTop: '0.3rem', fontSize: '0.85em', opacity: 0.85 }}>
            Archief-locatie:{' '}
            {href ? (
              <a href={href} target="_blank" rel="noreferrer" style={{ textDecoration: 'underline' }}>
                {label} ↗
              </a>
            ) : (
              <span>{label}</span>
            )}
          </div>
        )
      })()}
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
