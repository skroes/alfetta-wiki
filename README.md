# alfetta-wiki

Publicatie-laag voor het [skroes/alfetta-project](https://github.com/skroes/alfetta-project) archief.

Privé Nextra-site voor Serge's **1977 Alfa Romeo Alfetta 2.0 Serie 2**. Alle inhoud komt letterlijk uit door Serge aangeleverde bronnen — geen training-data, geen AI-hallucinatie. Zie [`pages/governance/bronregel.mdx`](pages/governance/bronregel.mdx).

## Status

**Walking skeleton.** Eén gevalideerde pagina (`/motor/contactpunten-afstellen`), de rest volgt per `validated` DOC-pagina uit het werkrepo.

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
4. `<SourceRef>` en `<Cite>` zorgen voor klikbare bron-verwijzing terug naar de PDF op Drive

## Componenten

- `components/SourceRef.tsx` — rendert het bron-blok onderaan elke pagina + `<Cite>` inline anchor
