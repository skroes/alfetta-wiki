# alfetta-wiki

Publicatie-laag voor het [skroes/alfetta-project](https://github.com/skroes/alfetta-project) archief.

Privé Nextra-site voor Serge's **1977 Alfa Romeo Alfetta 2.0 Serie 2**. Alle inhoud komt letterlijk uit door Serge aangeleverde bronnen — geen training-data, geen AI-hallucinatie. Zie [`pages/governance/bronregel.mdx`](pages/governance/bronregel.mdx).

## Status

**Content-scale fase.** 13 gevalideerde motorpagina's live uit DOC-04 (Engine, publ 2448, april 1977). 73 figuren geëxtraheerd met metadata. Bronnen-overzicht, figuren-gallery, governance-sectie. Quality gates in opbouw (ESLint, bronregel-validator, robots.txt).

## Stack

- Next.js 14 (Pages Router)
- Nextra 3
- TypeScript
- Geen Tailwind, geen auth, geen database

## Development

```bash
npm install
npm run dev
# http://localhost:3017
```

## Build

```bash
npm run build
```

De `prebuild` hook draait `scripts/generate-llms-txt.js` en schrijft `public/llms.txt` — de site-eigen LLM-index.

## Deploy

Vercel Git integration, push naar `main` → auto deploy.

## Content workflow

1. Bron wordt geselecteerd + vertaald in [`skroes/alfetta-project`](https://github.com/skroes/alfetta-project) (werkrepo)
2. Canonical NL mdx komt in `alfetta-project/content/{doc}/...mdx` met `status: validated`
3. Die mdx wordt gekopieerd naar `alfetta-wiki/pages/{section}/...mdx`
4. `<SourceRef>` en `<Cite>` zorgen voor bron-verwijzing met per-pagina deep-links naar de lokaal gehoste PDF

## Componenten

- `components/SourceRef.tsx` — rendert het bron-blok onderaan elke pagina met per-pagina PDF deep-links + `<Cite>` inline anchor
- `components/Figure.tsx` — inline figuur met lightbox, float, size opties
- `components/FigureGallery.tsx` — doorzoekbare gallery met fuzzy search, tag/pagina filters

## Security

Zie [`SECURITY.md`](SECURITY.md) voor de dependency-triage. Next.js zit bewust op 14.2.x tot er een Nextra 3.x release is die Next 16 ondersteunt (of tot we naar Nextra 4 migreren als onderdeel van PRD-B).
