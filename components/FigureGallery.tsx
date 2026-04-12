import { useState, useMemo } from 'react'
import Link from 'next/link'
import figuresData from '../public/figures/doc-04/figures-index.json'

type Figure = {
  filename: string
  page: number
  figure: number
  title: string
  tags: string[]
  related_page: string
  size_bytes: number
}

const data = figuresData as {
  doc: string
  source: string
  total_figures: number
  figures: Figure[]
}

const PAGE_LABELS: Record<string, string> = {
  '/motor/technische-specificaties': 'Technische specificaties',
  '/motor/motor-uitbouwen': 'Motor uitbouwen',
  '/motor/inspectie-kleppen-veren': 'Inspectie kleppen, veren & krukas',
  '/motor/klepspeling-controleren': 'Klepspeling controleren',
  '/motor/cilinderkop-revisie': 'Cilinderkop revisie',
  '/motor/koelsysteem': 'Koelsysteem',
  '/motor/gasklep-kabel-afstellen': 'Gasklep-kabel afstellen',
  '/motor/stationair-toerental-co': 'Stationair toerental & CO',
  '/motor/contactpunten-afstellen': 'Contactpunten afstellen',
  '/motor/ontstekings-timing': 'Ontstekings-timing',
  '/motor/weber-carburateur': 'Weber 40 DCOE carburateur',
  '/motor/solex-carburateur': 'Solex C 40 DDH-8 carburateur',
  '/motor/dellorto-carburateur': 'Dellorto DHLA 40F carburateur',
}

function fuzzyMatch(text: string, query: string): boolean {
  const lower = text.toLowerCase()
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean)
  return terms.every(term => lower.includes(term))
}

export default function FigureGallery() {
  const [search, setSearch] = useState('')
  const [tagFilter, setTagFilter] = useState<string | null>(null)
  const [pageFilter, setPageFilter] = useState<string | null>(null)
  const [selected, setSelected] = useState<Figure | null>(null)

  const allTags = useMemo(() => {
    const s = new Set<string>()
    data.figures.forEach(f => f.tags.forEach(t => s.add(t)))
    return Array.from(s).sort()
  }, [])

  const allPages = useMemo(() => {
    const s = new Set<string>()
    data.figures.forEach(f => s.add(f.related_page))
    return Array.from(s).sort()
  }, [])

  const filtered = useMemo(() => {
    return data.figures.filter(f => {
      if (tagFilter && !f.tags.includes(tagFilter)) return false
      if (pageFilter && f.related_page !== pageFilter) return false
      if (search) {
        const searchable = `${f.title} ${f.tags.join(' ')} ${f.filename} p${f.page} ${PAGE_LABELS[f.related_page] || ''}`
        if (!fuzzyMatch(searchable, search)) return false
      }
      return true
    })
  }, [search, tagFilter, pageFilter])

  return (
    <div>
      {/* Search & filters */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <input
          type="text"
          placeholder="Zoek op titel, tag, pagina..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: '1 1 250px',
            padding: '0.5rem 0.75rem',
            border: '1px solid var(--nextra-border, #e5e7eb)',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            background: 'var(--nextra-bg, white)',
            color: 'var(--nextra-text, black)',
          }}
        />
        <select
          value={tagFilter || ''}
          onChange={e => setTagFilter(e.target.value || null)}
          style={{
            padding: '0.5rem',
            border: '1px solid var(--nextra-border, #e5e7eb)',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            background: 'var(--nextra-bg, white)',
            color: 'var(--nextra-text, black)',
          }}
        >
          <option value="">Alle tags</option>
          {allTags.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select
          value={pageFilter || ''}
          onChange={e => setPageFilter(e.target.value || null)}
          style={{
            padding: '0.5rem',
            border: '1px solid var(--nextra-border, #e5e7eb)',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            background: 'var(--nextra-bg, white)',
            color: 'var(--nextra-text, black)',
          }}
        >
          <option value="">Alle pagina's</option>
          {allPages.map(p => <option key={p} value={p}>{PAGE_LABELS[p] || p}</option>)}
        </select>
      </div>

      <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '1rem' }}>
        {filtered.length} van {data.total_figures} figuren
        {(search || tagFilter || pageFilter) && (
          <> &mdash; <button onClick={() => { setSearch(''); setTagFilter(null); setPageFilter(null) }} style={{ color: '#dc2626', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.8rem' }}>reset filters</button></>
        )}
      </p>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: '1rem',
      }}>
        {filtered.map(fig => (
          <div
            key={fig.filename}
            onClick={() => setSelected(fig)}
            style={{
              border: '1px solid var(--nextra-border, #e5e7eb)',
              borderRadius: '0.5rem',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'box-shadow 0.15s',
            }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.12)')}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = 'none')}
          >
            <div style={{ background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '160px', overflow: 'hidden' }}>
              <img
                src={`/figures/doc-04/${fig.filename}`}
                alt={fig.title}
                loading="lazy"
                style={{ maxWidth: '100%', maxHeight: '160px', objectFit: 'contain' }}
              />
            </div>
            <div style={{ padding: '0.5rem 0.625rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, lineHeight: 1.3, marginBottom: '0.25rem' }}>{fig.title}</div>
              <div style={{ fontSize: '0.7rem', color: '#6b7280' }}>p. {fig.page}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 50,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--nextra-bg, white)', borderRadius: '0.75rem',
              maxWidth: '800px', width: '100%', maxHeight: '90vh', overflow: 'auto',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{selected.title}</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1, color: 'var(--nextra-text, black)' }}>&times;</button>
            </div>
            <img
              src={`/figures/doc-04/${selected.filename}`}
              alt={selected.title}
              style={{ width: '100%', borderRadius: '0.375rem', marginBottom: '1rem' }}
            />
            <table style={{ fontSize: '0.85rem', width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                <tr><td style={{ padding: '0.25rem 0.5rem 0.25rem 0', fontWeight: 600, whiteSpace: 'nowrap' }}>Bron</td><td>{data.doc} &mdash; pagina {selected.page}</td></tr>
                <tr><td style={{ padding: '0.25rem 0.5rem 0.25rem 0', fontWeight: 600, whiteSpace: 'nowrap' }}>Bestand</td><td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{selected.filename}</td></tr>
                <tr><td style={{ padding: '0.25rem 0.5rem 0.25rem 0', fontWeight: 600, whiteSpace: 'nowrap' }}>Tags</td><td>{selected.tags.map(t => <span key={t} onClick={(e) => { e.stopPropagation(); setTagFilter(t); setSelected(null) }} style={{ display: 'inline-block', background: '#e5e7eb', borderRadius: '0.25rem', padding: '0.1rem 0.4rem', marginRight: '0.3rem', fontSize: '0.75rem', cursor: 'pointer' }}>{t}</span>)}</td></tr>
                <tr>
                  <td style={{ padding: '0.25rem 0.5rem 0.25rem 0', fontWeight: 600, whiteSpace: 'nowrap' }}>Wiki-pagina</td>
                  <td><Link href={selected.related_page} onClick={() => setSelected(null)} style={{ color: '#2563eb' }}>{PAGE_LABELS[selected.related_page] || selected.related_page}</Link></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
