# Security triage — alfetta-wiki

> Peildatum: **2026-04-11**. Wordt opnieuw beoordeeld bij elke Next.js / Nextra upgrade.

## Huidige stack

- `next@14.2.35` — laatste stable 14.x
- `nextra@3.3.1`, `nextra-theme-docs@3.3.1` — laatste stable 3.x (pages-router)
- `react@18.3.1`, `react-dom@18.3.1`

## Openstaand — `npm audit --omit=dev` (1 high-severity ketting)

Eén ketting-advisory staat open in de productie dependency tree. Fix via `npm audit fix --force` zou `next@16.2.3` installeren — dat is een **niet-compatibele major upgrade** voor Nextra 3 (`pkg.init is not a function` build error). De enige patch-route is Nextra 4 + app-router migratie, wat buiten de scope van de walking-skeleton valt (PRD-A → PRD-B).

### De 5 Next.js CVEs in `next <= 15.5.14`

| CVE | Samenvatting | Raakt deze site? |
|---|---|---|
| [GHSA-9g9p-9gw9-jx7f](https://github.com/advisories/GHSA-9g9p-9gw9-jx7f) | DoS via Image Optimizer `remotePatterns` | **Nee.** `next.config.mjs` zet `images.unoptimized: true` — de Image Optimizer wordt niet geïnitialiseerd |
| [GHSA-h25m-26qc-wcjf](https://github.com/advisories/GHSA-h25m-26qc-wcjf) | HTTP request deserialization DoS via React Server Components | **Nee.** Deze site gebruikt de **pages-router**, er zijn geen React Server Components of `app/` directory |
| [GHSA-ggv3-7p47-pfv8](https://github.com/advisories/GHSA-ggv3-7p47-pfv8) | HTTP request smuggling in Next rewrites | **Nee.** `next.config.mjs` heeft geen `rewrites` of `redirects` gedefinieerd |
| [GHSA-3x4c-7xq6-9pq8](https://github.com/advisories/GHSA-3x4c-7xq6-9pq8) | Unbounded `next/image` disk cache kan storage uitputten | **Nee.** `images.unoptimized: true` — geen image cache actief |
| [GHSA-q4gf-8mx6-v5v3](https://github.com/advisories/GHSA-q4gf-8mx6-v5v3) | DoS via Server Components | **Nee.** Pages-router zonder RSC |

### Waarom de expositie in de praktijk nul is

De site is puur **statisch**. Nextra genereert tijdens `next build` HTML voor alle pagina's (pages-router `getStaticProps` + `getStaticPaths`), en Vercel serveert die files via zijn edge CDN. Er zijn geen:

- API routes (`pages/api/*`)
- Dynamic rewrites of redirects
- Form submissions of user input
- Image optimizer runtime
- Auth of sessions
- App-router of RSC

De enige levende Next.js runtime op Vercel is de 404-fallback en de `_next/static/*` serving — beide liggen ver buiten de aanvalsoppervlakken die in bovenstaande CVEs worden beschreven. De markertag `<meta name="robots" content="noindex, nofollow" />` in `theme.config.tsx` zorgt bovendien dat de site niet door crawlers wordt geïndexeerd (privé archief).

**Gevolgtrekking**: op deze specifieke configuratie zijn de 5 CVEs niet exploitabel. De advisory blijft echter wel in `npm audit` staan omdat `next <= 15.5.14` in de kwetsbare versie-range valt — tool-niveau kan de configuratie niet inspecteren.

## Wanneer heroverwegen

- Er komt een **Nextra 3.x release die Next 16 ondersteunt** → pakken, `next` + `nextra` samen bumpen
- Er komt een **Nextra 4 pages-router build** → pakken
- We besluiten alsnog **Nextra 4 + app-router migratie** als onderdeel van PRD-B (content-scale + chat) → de migratie is dan een natuurlijke stap
- We introduceren **API routes, form handling, image optimizer, of dynamic rewrites** → onmiddellijk heroverwegen; dan worden de CVEs wél relevant

## Dev dependencies

`npm audit` zonder `--omit=dev` kan hogere tellingen laten zien. Die horen bij build-tooling en raken de productie-deploy op Vercel niet. Worden periodiek opgeschoond maar zijn niet urgent.
