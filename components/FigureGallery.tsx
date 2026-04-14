import { useState, useMemo } from 'react'
import Link from 'next/link'
import figuresData from '../public/figures/doc-04/figures-index.json'

// Canonical schema (zie alfetta-project/content/{doc}/figures.json, gesynct door
// alfetta-wiki/scripts/generate-figures-json.sh). Discriminator: `kind`.
type FigureKind = 'figure-crop' | 'page-scan'

type Figure = {
  id: string
  doc: string
  page: number
  kind: FigureKind
  source: string
  public_path: string
  label: string
  caption_nl?: string
  tags?: string[]
  used_in?: string[]
  needs_label?: boolean
  validated?: boolean
  // Crop-specific
  fig_nr?: string
  filename_slug?: string
}

type FiguresFile = {
  doc_code: string
  last_updated: string
  schema_version: string
  figures: Figure[]
}

const data = figuresData as unknown as FiguresFile

// Labels voor `used_in` relatieve paden → leesbare wiki-pagina naam.
// Gebruikt voor het tonen van gerelateerde wiki-pagina's in de lightbox.
const PAGE_LABELS: Record<string, string> = {
  '/motor/technische-specificaties': 'Technische specificaties',
  '/motor/motor-uitbouwen': 'Motor uitbouwen',
  '/motor/inspectie-kleppen-veren': 'Inspectie kleppen, veren & krukas',
  '/motor/klepspeling-controleren': 'Klepspeling controleren',
  '/motor/cilinderkop-revisie': 'Cilinderkop revisie',
  '/motor/cilinderkop-demonteren-toleranties': 'Cilinderkop demonteren',
  '/motor/koelsysteem': 'Koelsysteem',
  '/motor/gasklep-kabel-afstellen': 'Gasklep-kabel afstellen',
  '/motor/stationair-toerental-co': 'Stationair toerental & CO',
  '/motor/contactpunten-afstellen': 'Contactpunten afstellen',
  '/motor/ontstekings-timing': 'Ontstekings-timing',
  '/motor/weber-carburateur': 'Weber 40 DCOE carburateur',
  '/motor/solex-carburateur': 'Solex C 40 DDH-8 carburateur',
  '/motor/dellorto-carburateur': 'Dellorto DHLA 40F carburateur',
  '/motor/distributieketting': 'Distributieketting',
  '/motor/motor-demonteren-werkbank': 'Motor demonteren (werkbank)',
  '/motor/motor-terugplaatsen': 'Motor terugplaatsen',
  '/motor/krukas-zuigers-herbouwen': 'Krukas & zuigers herbouwen',
}

// used_in levert relatieve paden als "alfetta-wiki/pages/motor/foo.mdx".
// Dit helpt dat naar een wiki-route ("/motor/foo") te mappen voor de lightbox.
function usedInToRoute(usedIn: string): string | null {
  // "alfetta-wiki/pages/motor/foo.mdx" -> "/motor/foo"
  const m = usedIn.match(/pages\/(.+)\.mdx$/)
  if (!m) return null
  return '/' + m[1]
}

function fuzzyMatch(text: string, query: string): boolean {
  const lower = text.toLowerCase()
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  return terms.every(term => lower.includes(term))
}

const KIND_BADGE: Record<FigureKind, { icon: string; label: string }> = {
  'figure-crop': { icon: '\u{1F5BC}\uFE0F', label: 'crop' },
  'page-scan': { icon: '\u{1F4C4}', label: 'page-scan' },
}

export default function FigureGallery() {
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [pageFilter, setPageFilter] = useState<string | null>(null)
  const [kindFilter, setKindFilter] = useState<FigureKind | 'all'>('all')
  const [selected, setSelected] = useState<Figure | null>(null)

  const figures = data.figures || []

  const allTags = useMemo(() => {
    const s = new Set<string>()
    figures.forEach(f => (f.tags || []).forEach(t => s.add(t)))
    return Array.from(s).sort()
  }, [figures])

  // Gebruik `used_in` (eerste entry) als pagina-filter kandidaat — mapbaar naar route.
  const allPages = useMemo(() => {
    const s = new Set<string>()
    figures.forEach(f => {
      const first = (f.used_in || [])[0]
      if (first) {
        const route = usedInToRoute(first)
        if (route) s.add(route)
      }
    })
    return Array.from(s).sort()
  }, [figures])

  const filtered = useMemo(() => {
    return figures.filter(f => {
      if (kindFilter !== 'all' && f.kind !== kindFilter) return false
      if (tagFilter) {
        if (!(f.tags || []).includes(tagFilter)) return false
      }
      if (pageFilter) {
        const first = (f.used_in || [])[0]
        const route = first ? usedInToRoute(first) : null
        if (route !== pageFilter) return false
      }
      if (search) {
        const tags = (f.tags || []).join(' ')
        const searchable = `${f.label || ''} ${tags} ${f.id} p${f.page} ${f.filename_slug || ''} ${f.kind}`
        if (!fuzzyMatch(searchable, search)) return false
      }
      return true
    })
  }, [figures, search, tagFilter, pageFilter, kindFilter])

  const inputStyle = {
    padding: '0.5rem 0.75rem',
    border: '1px solid hsl(var(--nextra-border-color, 0 0% 90%))',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    backgroundColor: 'transparent',
    color: 'inherit',
  } as const

  return (
    <div className="figure-gallery">
      {/* Styling in styles/figure-gallery.css (global import via _app.tsx).
          NIET: nieuwe inline <style> blokken met :is(html[class~="dark"]) —
          veroorzaakte React hydration mismatch (server escapte quotes als &quot;). */}

      {/* Search & filters */}
      <div className="fig-filters" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Zoek op label, tag, pagina..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...inputStyle, flex: '1 1 250px' }}
        />
        <select
          value={kindFilter}
          onChange={e => setKindFilter(e.target.value as FigureKind | 'all')}
          style={inputStyle}
          aria-label="Type filter"
        >
          <option value="all">Alle types</option>
          <option value="figure-crop">Crops</option>
          <option value="page-scan">Page-scans</option>
        </select>
        <select
          value={tagFilter || ''}
          onChange={e => setTagFilter(e.target.value || null)}
          style={inputStyle}
        >
          <option value="">Alle tags</option>
          {allTags.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={pageFilter || ''}
          onChange={e => setPageFilter(e.target.value || null)}
          style={inputStyle}
        >
          <option value="">Alle wiki-pagina&apos;s</option>
          {allPages.map(p => <option key={p} value={p}>{PAGE_LABELS[p] || p}</option>)}
        </select>
      </div>

      <p className="fig-meta-muted" style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>
        {filtered.length} van {figures.length} figuren
        {(search || tagFilter || pageFilter || kindFilter !== 'all') && (
          <> &mdash; <button onClick={() => { setSearch(''); setTagFilter(null); setPageFilter(null); setKindFilter('all') }} className="fig-reset" style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.8rem' }}>reset filters</button></>
        )}
      </p>

      {/* Grid */}
      <div className="fig-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1rem',
      }}>
        {filtered.map(fig => {
          const badge = KIND_BADGE[fig.kind]
          return (
            <div
              key={fig.id}
              className="fig-card"
              onClick={() => setSelected(fig)}
              style={{
                border: '1px solid hsl(var(--nextra-border-color, 0 0% 90%))',
                borderRadius: '0.5rem',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'box-shadow 0.15s',
              }}
            >
              <div className="fig-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160, overflow: 'hidden', position: 'relative' }}>
                <img
                  src={fig.public_path}
                  alt={fig.label}
                  loading="lazy"
                  style={{ maxWidth: '100%', maxHeight: '160px', objectFit: 'contain' }}
                />
                <span
                  className="fig-kind-badge"
                  title={badge.label}
                  aria-label={badge.label}
                  style={{
                    position: 'absolute',
                    top: '0.25rem',
                    right: '0.25rem',
                    fontSize: '0.9rem',
                    lineHeight: 1,
                    padding: '0.15rem 0.3rem',
                    borderRadius: '0.25rem',
                  }}
                >
                  {badge.icon}
                </span>
              </div>
              <div style={{ padding: '0.5rem 0.625rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.3, marginBottom: '0.25rem' }}>{fig.label}</div>
                <div className="fig-meta-muted" style={{ fontSize: '0.7rem' }}>p. {fig.page}</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          className="fig-lightbox-overlay"
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
          }}
        >
          <div
            className="fig-lightbox-panel"
            onClick={e => e.stopPropagation()}
            style={{
              borderRadius: '0.75rem',
              maxWidth: '800px', width: '100%', maxHeight: '90vh', overflow: 'auto',
              padding: '1.5rem',
              boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', gap: '0.5rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
                <span style={{ marginRight: '0.35rem' }} aria-hidden="true">{KIND_BADGE[selected.kind].icon}</span>
                {selected.label}
              </h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1, color: 'inherit', opacity: 0.6 }}>&times;</button>
            </div>
            <img
              src={selected.public_path}
              alt={selected.label}
              style={{ width: '100%', borderRadius: '0.375rem', marginBottom: '1rem' }}
            />
            <table style={{ fontSize: '0.85rem', width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr>
                  <td style={{ padding: '0.25rem 0.5rem 0.25rem 0', fontWeight: 600, whiteSpace: 'nowrap' }}>Type</td>
                  <td>{KIND_BADGE[selected.kind].label}</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.25rem 0.5rem 0.25rem 0', fontWeight: 600, whiteSpace: 'nowrap' }}>Bron</td>
                  <td>{selected.doc} &mdash; pagina {selected.page}</td>
                </tr>
                <tr>
                  <td style={{ padding: '0.25rem 0.5rem 0.25rem 0', fontWeight: 600, whiteSpace: 'nowrap' }}>ID</td>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{selected.id}</td>
                </tr>
                {(selected.tags && selected.tags.length > 0) && (
                  <tr>
                    <td style={{ padding: '0.25rem 0.5rem 0.25rem 0', fontWeight: 600, whiteSpace: 'nowrap' }}>Tags</td>
                    <td>{selected.tags.map(t => <span key={t} className="fig-tag" onClick={(e) => { e.stopPropagation(); setTagFilter(t); setSelected(null) }} style={{ display: 'inline-block', borderRadius: '0.25rem', padding: '0.1rem 0.4rem', marginRight: '0.3rem', fontSize: '0.75rem', cursor: 'pointer' }}>{t}</span>)}</td>
                  </tr>
                )}
                {(selected.used_in && selected.used_in.length > 0) && (
                  <tr>
                    <td style={{ padding: '0.25rem 0.5rem 0.25rem 0', fontWeight: 600, whiteSpace: 'nowrap' }}>Wiki-pagina</td>
                    <td>
                      {selected.used_in.map((u, i) => {
                        const route = usedInToRoute(u)
                        if (!route) return null
                        return (
                          <span key={u}>
                            {i > 0 && ', '}
                            <Link href={route} className="fig-link" onClick={() => setSelected(null)}>{PAGE_LABELS[route] || route}</Link>
                          </span>
                        )
                      })}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
