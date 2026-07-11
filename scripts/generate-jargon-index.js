#!/usr/bin/env node
/**
 * generate-jargon-index.js — deterministische jargon-aggregator (fase 7,
 * wiki-verbetersessie 2026-07; richting B-13).
 *
 * Parset alle "## Jargon (EN → NL)"-tabellen uit pages/*.mdx en schrijft
 * components/jargon-index.json:
 *   - gegroepeerd op NL-term (B-13: oriëntatie NL → EN)
 *   - per groep de EN-varianten met context + backlinks naar bronpagina's
 *   - conflict-detectie: EN-termen die elders een andere NL-vertaling hebben
 *
 * De lokale jargon-blokken op de pagina's blijven de bron — dit bestand is
 * afgeleide data en wordt bij elke build geregenereerd (prebuild).
 * Bronregel: alle termen komen letterlijk uit de al-gevalideerde blokken.
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const PAGES = path.join(ROOT, 'pages')
const OUT = path.join(ROOT, 'components', 'jargon-index.json')

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) return e.name.startsWith('_') ? [] : walk(p)
    return e.name.endsWith('.mdx') ? [p] : []
  })

const fm = (text, key) => {
  const m = text.match(new RegExp(`^${key}:\\s*"?([^"\\n]+)"?\\s*$`, 'm'))
  return m ? m[1].trim() : null
}

const rows = []
let blocks = 0

for (const file of walk(PAGES).sort()) {
  const text = fs.readFileSync(file, 'utf8')
  const rel = path.relative(PAGES, file).replace(/\.mdx$/, '')
  const route = '/' + rel.split(path.sep).join('/')
  const title = fm(text, 'title') || rel
  const docM = text.match(/^\s{2}doc:\s*(\S+)/m)
  const doc = docM ? docM[1] : null
  const lang = (text.match(/^\s{2}language:\s*(\S+)/m) || [])[1] || 'en'

  const section = text.match(/^## Jargon \(EN → NL\)\s*\n([\s\S]*?)(?=\n## |\n<SourceRef|(?![\s\S]))/m)
  if (!section) continue
  blocks++
  for (const line of section[1].split('\n')) {
    const t = line.trim()
    if (!t.startsWith('|')) continue
    const cells = t.replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim())
    if (cells.length < 2) continue
    if (/^-+$/.test(cells[0].replace(/[:\s]/g, '-'))) continue // separator
    if (/^engels$/i.test(cells[0])) continue // header
    const [en, nlRaw, context = ''] = cells
    if (!en || !nlRaw) continue
    // afkortingen zonder NL-vertaling (nl-cel "—") groeperen op de term zelf
    const nl = /^[—–-]+$/.test(nlRaw) ? en : nlRaw
    rows.push({ en, nl, context, route, title, doc, lang })
  }
}

// Groepeer op genormaliseerde NL-term (B-13: NL → EN flip)
const norm = (s) => s.toLowerCase().replace(/\s+/g, ' ').trim()
const groups = new Map()
for (const r of rows) {
  const key = norm(r.nl)
  if (!groups.has(key)) groups.set(key, { nl: r.nl, entries: [] })
  groups.get(key).entries.push(r)
}

// Conflict-index: EN-term (genormaliseerd) → set van NL-vertalingen
const enToNl = new Map()
for (const r of rows) {
  const key = norm(r.en)
  if (!enToNl.has(key)) enToNl.set(key, new Set())
  enToNl.get(key).add(norm(r.nl))
}

const collator = new Intl.Collator('nl')
const out = {
  stats: { blocks, rows: rows.length, terms: groups.size },
  groups: [...groups.values()]
    .sort((a, b) => collator.compare(a.nl, b.nl))
    .map((g) => {
      // dedup identieke (en, context, route)-entries binnen de groep
      const seen = new Set()
      const entries = []
      for (const e of g.entries) {
        const k = `${norm(e.en)}|${e.context}|${e.route}`
        if (seen.has(k)) continue
        seen.add(k)
        const others = [...enToNl.get(norm(e.en))].filter((n) => n !== norm(g.nl))
        entries.push({
          en: e.en,
          context: e.context,
          route: e.route,
          title: e.title,
          doc: e.doc,
          lang: e.lang,
          ...(others.length ? { alsoNl: others } : {}),
        })
      }
      return { nl: g.nl, entries }
    }),
}

const conflicts = [...enToNl.values()].filter((s) => s.size > 1).length
out.stats.conflicts = conflicts

fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n')
console.log(
  `jargon-index: ${blocks} blokken, ${rows.length} rijen, ${groups.size} NL-termen, ${conflicts} EN-termen met meerdere vertalingen → ${path.relative(ROOT, OUT)}`
)
