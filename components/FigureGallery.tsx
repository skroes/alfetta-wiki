import { useState, useMemo } from 'react'
import Link from 'next/link'
import doc04Data from '../public/figures/doc-04/figures-index.json'
import doc03Data from '../public/figures/doc-03/figures-index.json'

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

const allDataSources = [doc04Data, doc03Data] as unknown as FiguresFile[]
const mergedFigures: Figure[] = allDataSources.flatMap(d => d.figures || [])

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
  // DOC-03 — Transmission/Suspension/Steering/Brakes
  '/transmissie/cardanas-revisie': 'Cardanas revisie',
  '/transmissie/aandrijfassen-revisie': 'Aandrijfassen revisie',
  '/transmissie/aandrijflijn-specificaties': 'Aandrijflijn specificaties (DOC-03)',
  '/onderstel/voorwielophanging-verwijderen': 'Voorwielophanging verwijderen',
  '/onderstel/voorwielophanging-demonteren': 'Voorwielophanging demonteren',
  '/onderstel/voorwielophanging-hermonteren': 'Voorwielophanging hermonteren',
  '/onderstel/voorwielophanging-terugplaatsen': 'Voorwielophanging terugplaatsen',
  '/onderstel/voorwielophanging-deelbewerkingen': 'Voorwielophanging deelbewerkingen',
  '/onderstel/voorwielophanging-specificaties': 'Voorwielophanging specificaties',
  '/onderstel/achterwielophanging-verwijderen': 'Achterwielophanging verwijderen',
  '/onderstel/achterwielophanging-demonteren': 'Achterwielophanging demonteren',
  '/onderstel/achterwielophanging-hermonteren': 'Achterwielophanging hermonteren',
  '/onderstel/achterwielophanging-deelbewerkingen': 'Achterwielophanging deelbewerkingen',
  '/onderstel/achterwielophanging-specificaties': 'Achterwielophanging specificaties',
  '/onderstel/rijhoogte': 'Rijhoogte',
  '/onderstel/wieluitlijning': 'Wieluitlijning',
  '/besturing/stuurhuis-verwijderen-demonteren': 'Stuurhuis verwijderen en demonteren',
  '/besturing/stuurhuis-hermonteren-terugplaatsen': 'Stuurhuis hermonteren en terugplaatsen',
  '/besturing/stuurkolom-en-deelbewerkingen': 'Stuurkolom en deelbewerkingen',
  '/besturing/specificaties': 'Besturing specificaties',
  '/remmen/voorremmen': 'Voorremmen',
  '/remmen/achterremmen': 'Achterremmen',
  '/remmen/bediening-hydraulisch': 'Rembekrachtiger en hydraulisch circuit',
  '/remmen/handrem': 'Handrem revisie',
  '/remmen/specificaties': 'Remmen specificaties',
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

// Leesbare DOC-titel voor group-header. Bij nieuwe DOCs: hier aanvullen of
// afleiden uit canonical JSON metadata. Fallback: alleen de DOC-code.
const DOC_LABELS: Record<string, string> = {
  'DOC-04': 'Alfetta Workshop Manual: Engine',
  'DOC-03': 'Alfetta Workshop Manual: Transmission/Suspension/Steering/Brakes',
}

type ViewMode = 'grouped' | 'flat'

// Groepeer figures per DOC; behoud originele volgorde binnen groep en tussen groepen
// (stable: eerste voorkomen per DOC bepaalt groepsvolgorde).
function groupByDoc(figs: Figure[]): Array<[string, Figure[]]> {
  const order: string[] = []
  const buckets: Record<string, Figure[]> = {}
  for (const f of figs) {
    const key = f.doc || 'UNKNOWN'
    if (!(key in buckets)) {
      buckets[key] = []
      order.push(key)
    }
    buckets[key].push(f)
  }
  return order.map(k => [k, buckets[k]] as [string, Figure[]])
}

function renderCard(fig: Figure, setSelected: (f: Figure) => void) {
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
      <div className="fig-thumb" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160, overflow: 'hidden' }}>
        <img
          src={fig.public_path}
          alt={fig.label}
          loading="lazy"
          style={{ maxWidth: '100%', maxHeight: '160px', objectFit: 'contain' }}
        />
      </div>
      <div style={{ padding: '0.5rem 0.625rem' }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.3, marginBottom: '0.25rem' }}>{fig.label}</div>
        <div className="fig-meta-muted" style={{ fontSize: '0.7rem' }}>p. {fig.page}</div>
      </div>
    </div>
  )
}

export default function FigureGallery() {
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [pageFilter, setPageFilter] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('grouped')
  const [selected, setSelected] = useState<Figure | null>(null)

  // /figuren toont uitsluitend begeleidende illustraties (figure-crops), geen
  // full-page scans. Page-scans blijven bereikbaar via <SourceRef> deeplinks en
  // directe /pages/DOC-XX/NNN.jpg URLs, maar horen niet in de visuele index.
  const figures = mergedFigures.filter(f => f.kind === 'figure-crop')

  const allTags = useMemo(() => {
    const s = new Set<string>()
    figures.forEach(f => (f.tags || []).forEach(t => s.add(t)))
    return Array.from(s).sort()
  }, [figures])

  // Verzamel álle routes uit used_in — een figure kan in meerdere MDX-pagina's voorkomen.
  const allPages = useMemo(() => {
    const s = new Set<string>()
    figures.forEach(f => {
      ;(f.used_in || []).forEach(u => {
        const route = usedInToRoute(u)
        if (route) s.add(route)
      })
    })
    return Array.from(s).sort()
  }, [figures])

  const filtered = useMemo(() => {
    return figures.filter(f => {
      if (tagFilter) {
        if (!(f.tags || []).includes(tagFilter)) return false
      }
      if (pageFilter) {
        const routes = (f.used_in || []).map(usedInToRoute).filter(Boolean) as string[]
        if (!routes.includes(pageFilter)) return false
      }
      if (search) {
        const tags = (f.tags || []).join(' ')
        const searchable = `${f.label || ''} ${tags} ${f.id} p${f.page} ${f.filename_slug || ''}`
        if (!fuzzyMatch(searchable, search)) return false
      }
      return true
    })
  }, [figures, search, tagFilter, pageFilter])

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

      <p className="fig-meta-muted" style={{ fontSize: '0.8rem', marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
        <span>
          {filtered.length} van {figures.length} figuren
          {(search || tagFilter || pageFilter) && (
            <> &mdash; <button onClick={() => { setSearch(''); setTagFilter(null); setPageFilter(null) }} className="fig-reset" style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.8rem' }}>reset filters</button></>
          )}
        </span>
        <span style={{ marginLeft: 'auto' }}>
          weergave:
          {' '}
          <button
            onClick={() => setViewMode('grouped')}
            aria-pressed={viewMode === 'grouped'}
            className="fig-view-toggle"
            style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: viewMode === 'grouped' ? 'underline' : 'none', fontSize: '0.8rem', fontWeight: viewMode === 'grouped' ? 600 : 400, color: 'inherit', padding: '0 0.25rem' }}
          >
            per document
          </button>
          {' / '}
          <button
            onClick={() => setViewMode('flat')}
            aria-pressed={viewMode === 'flat'}
            className="fig-view-toggle"
            style={{ background: 'none', border: 'none', cursor: 'pointer', textDecoration: viewMode === 'flat' ? 'underline' : 'none', fontSize: '0.8rem', fontWeight: viewMode === 'flat' ? 600 : 400, color: 'inherit', padding: '0 0.25rem' }}
          >
            flat
          </button>
        </span>
      </p>

      {/* Grid — grouped (default) of flat */}
      {viewMode === 'flat' ? (
        <div className="fig-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
        }}>
          {filtered.map(fig => renderCard(fig, setSelected))}
        </div>
      ) : (
        <div>
          {groupByDoc(filtered).map(([docCode, figs], idx) => {
            if (figs.length === 0) return null
            const docLabel = DOC_LABELS[docCode]
            const headerText = docLabel
              ? `${docCode} — ${docLabel} (${figs.length})`
              : `${docCode} (${figs.length})`
            return (
              <section
                key={docCode}
                className="fig-doc-group"
                style={idx > 0 ? {
                  marginTop: '2rem',
                  paddingTop: '1rem',
                  borderTop: '1px solid hsl(var(--nextra-border-color, 0 0% 90%))',
                } : undefined}
              >
                <h3 className="fig-doc-header" style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 0.75rem 0' }}>
                  {headerText}
                </h3>
                <div className="fig-grid" style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: '1rem',
                }}>
                  {figs.map(fig => renderCard(fig, setSelected))}
                </div>
              </section>
            )
          })}
        </div>
      )}

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
