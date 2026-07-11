import { useMemo, useState } from 'react'
import Link from 'next/link'
import jargonData from './jargon-index.json'

/**
 * JargonIndex — geaggregeerde jargon-naslag (fase 7, richting B-13).
 *
 * Data komt uit components/jargon-index.json, gegenereerd door
 * scripts/generate-jargon-index.js uit de lokale "## Jargon (EN → NL)"-
 * blokken op de pagina's zelf. Die blokken blijven de bron; dit is de
 * doorzoekbare centrale ingang.
 *
 * B-13: oriëntatie NL → EN, context onder de term op eigen regel,
 * zebra zonder witte scheidslijnen, doorzoekbaar.
 */

type Entry = {
  en: string
  context: string
  route: string
  title: string
  doc: string | null
  lang: string
  alsoNl?: string[]
}

type Group = { nl: string; entries: Entry[] }

const { stats, groups } = jargonData as unknown as {
  stats: { blocks: number; rows: number; terms: number; conflicts: number }
  groups: Group[]
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const firstLetter = (s: string) => {
  const c = s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .charAt(0)
    .toUpperCase()
  return /[A-Z]/.test(c) ? c : '#'
}

export default function JargonIndex() {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return groups
    return groups
      .map((g) => {
        if (g.nl.toLowerCase().includes(q)) return g
        const entries = g.entries.filter(
          (e) =>
            e.en.toLowerCase().includes(q) ||
            e.context.toLowerCase().includes(q) ||
            e.title.toLowerCase().includes(q)
        )
        return entries.length ? { ...g, entries } : null
      })
      .filter((g): g is Group => g !== null)
  }, [query])

  const letters = useMemo(() => {
    const present = new Set(filtered.map((g) => firstLetter(g.nl)))
    return [...present].sort()
  }, [filtered])

  let lastLetter = ''

  return (
    <div className="jargon-index">
      <div className="jargon-toolbar">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Zoek op Nederlandse of Engelse term, context of pagina…"
          aria-label="Zoek in jargon"
        />
        <span className="jargon-stats">
          {filtered.length} van {stats.terms} termen · {stats.rows} rijen uit{' '}
          {stats.blocks} paginablokken
        </span>
      </div>

      {!query && (
        <nav className="jargon-letters" aria-label="Alfabet">
          {letters.map((l) => (
            <a key={l} href={`#jargon-${l === '#' ? 'overig' : l.toLowerCase()}`}>
              {l}
            </a>
          ))}
        </nav>
      )}

      <dl className="jargon-list">
        {filtered.map((g) => {
          const letter = firstLetter(g.nl)
          const showLetter = letter !== lastLetter
          lastLetter = letter
          return (
            <div key={g.nl} className="jargon-group" id={slug(g.nl)}>
              {showLetter && !query && (
                <div
                  className="jargon-letter"
                  id={`jargon-${letter === '#' ? 'overig' : letter.toLowerCase()}`}
                >
                  {letter}
                </div>
              )}
              <dt>
                <span className="jargon-nl">{g.nl}</span>
                <span className="jargon-en">
                  {[...new Set(g.entries.map((e) => e.en))].join(' · ')}
                  <span className="jargon-lang">
                    {[...new Set(g.entries.map((e) => e.lang.toUpperCase()))].join('/')}
                  </span>
                </span>
              </dt>
              {g.entries.map((e, i) => (
                <dd key={`${e.en}-${e.route}-${i}`}>
                  {e.context && <span className="jargon-context">{e.context}</span>}
                  <span className="jargon-links">
                    <Link href={e.route}>{e.title}</Link>
                    {e.doc && <span className="jargon-doc">{e.doc}</span>}
                  </span>
                  {e.alsoNl && (
                    <span className="jargon-conflict">
                      “{e.en}” is elders vertaald als:{' '}
                      {e.alsoNl.map((n, j) => (
                        <a key={n} href={`#${slug(n)}`}>
                          {j > 0 ? ', ' : ''}
                          {n}
                        </a>
                      ))}
                    </span>
                  )}
                </dd>
              ))}
            </div>
          )
        })}
      </dl>

      {filtered.length === 0 && (
        <p className="jargon-empty">
          Geen termen gevonden voor “{query}”. De termen komen letterlijk uit de
          jargon-blokken op de pagina&apos;s — probeer een deel van het woord.
        </p>
      )}
    </div>
  )
}
