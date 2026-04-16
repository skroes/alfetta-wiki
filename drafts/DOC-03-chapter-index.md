# DOC-03 Chapter Index

**Bron:** Alfetta Workshop Manual — Transmission/Suspension/Steering/Brakes
**Publicatie:** 2064, november 1975
**Staging:** `alfetta-project/staging/DOC-03/pages/NNN.md` (110 pagina's)
**PDF:** `/docs/DOC-03-[slug].pdf`
**Archive:** drive.google.com/file/d/11GPcK6-deb0ykBMwIGsVnG35R_zjSpEM/view

## Hoofdstuk-overzicht (uit TOC p4)

Pagina-nummers verwijzen naar **staging-pagina's** (scan-volgorde), niet naar printed page numbers (die liggen ~2 lager).

| Hoofdstuk | Staging p. | Beoogde wiki-pagina's | Status |
|-----------|------------|------------------------|--------|
| **0. Workshop standards** | 3-5 | Geen wiki-pagina (generieke intro) | ⏭️ Skip |
| **1. Transmission (aandrijflijn)** | 4-24 | 3 wiki-pagina's | ✅ Live |
| &nbsp;&nbsp;• Cardanas revisie (verwijderen + demonteren + hermonteren + terugplaatsen + koppel-controle) | 6-16 | `transmissie/cardanas-revisie` | ✅ Live |
| &nbsp;&nbsp;• Aandrijfassen revisie (CV-joint hoezen) | 17-18 | `transmissie/aandrijfassen-revisie` | ✅ Live |
| &nbsp;&nbsp;• Aandrijflijn specificaties (tools + torques + smeer) | 18-24 | `transmissie/aandrijflijn-specificaties` | ✅ Live |
| **2. Front suspension** | 25-41 | 5-7 wiki-pagina's | ⏳ |
| &nbsp;&nbsp;• Overview (overhaul componenten) | 25 | `onderstel/voorwielophanging-overview` | ⏳ |
| &nbsp;&nbsp;• Verwijderen | 26-27 | `onderstel/voorwielophanging-verwijderen` | ✅ Live |
| &nbsp;&nbsp;• Demonteren | 28-30 | `onderstel/voorwielophanging-demonteren` | ✅ Live |
| &nbsp;&nbsp;• Hermonteren (re-building) | 31-32 | `onderstel/voorwielophanging-hermonteren` | ✅ Live |
| &nbsp;&nbsp;• Terugplaatsen | 33 | `onderstel/voorwielophanging-terugplaatsen` | ✅ Live |
| &nbsp;&nbsp;• Partial operations | 34-39 | `onderstel/voorwielophanging-deelbewerkingen` | ✅ Live |
| &nbsp;&nbsp;• Tools + Tightening torques + Lubricants | 39-42 | `onderstel/voorwielophanging-specificaties` | ✅ Live |
| **3. Rear suspension** | 43-59 | 3-5 wiki-pagina's | 🟡 in progress |
| &nbsp;&nbsp;• Verwijderen (uit auto) | 44-46 | `onderstel/achterwielophanging-verwijderen` | ✅ Live |
| &nbsp;&nbsp;• Demonteren (werkbank) | 47-48 | `onderstel/achterwielophanging-demonteren` | ✅ Live |
| &nbsp;&nbsp;• Hermonteren + terugplaatsen | 49-50 | `onderstel/achterwielophanging-hermonteren` | ✅ Live |
| &nbsp;&nbsp;• Partial operations | 51-53 | `onderstel/achterwielophanging-deelbewerkingen` | ✅ Live |
| &nbsp;&nbsp;• Schokbreker-kalibratie + tools + torques + lubes | 54, 56-59 | `onderstel/achterwielophanging-specificaties` | ✅ Live |
| **4. Vehicle height & geometry** | 60-68 | 2 wiki-pagina's | ✅ Live |
| &nbsp;&nbsp;• Rijhoogte controleren + afstellen | 60-63 | `onderstel/rijhoogte` | ✅ Live |
| &nbsp;&nbsp;• Geometrie controleren | 64-68 | `onderstel/wieluitlijning` | ✅ Live |
| **5. Steering gear** | 69-85 | 4 wiki-pagina's | ✅ Live |
| &nbsp;&nbsp;• ZF stuurhuis verwijderen + demonteren | 69-72 | `besturing/stuurhuis-verwijderen-demonteren` | ✅ Live |
| &nbsp;&nbsp;• Stuurhuis hermonteren + terugplaatsen | 72-75 | `besturing/stuurhuis-hermonteren-terugplaatsen` | ✅ Live |
| &nbsp;&nbsp;• Stuurkolom + deelbewerkingen | 75-82 | `besturing/stuurkolom-en-deelbewerkingen` | ✅ Live |
| &nbsp;&nbsp;• Tools + torques + lubricants | 82-85 | `besturing/specificaties` | ✅ Live |
| **6. Braking system** | 87-109 | 5 wiki-pagina's | ✅ Live |
| &nbsp;&nbsp;• Voorremmen demonteren + tests + monteren | 87-90 | `remmen/voorremmen` | ✅ Live |
| &nbsp;&nbsp;• Achterremmen demonteren + tests + monteren | 91-94 | `remmen/achterremmen` | ✅ Live |
| &nbsp;&nbsp;• Rembekrachtiger + leidingen + ontluchten | 95-102 | `remmen/bediening-hydraulisch` | ✅ Live |
| &nbsp;&nbsp;• Handrem revisie | 103-107 | `remmen/handrem` | ✅ Live |
| &nbsp;&nbsp;• Tools + torques + lubricants | 108-109 | `remmen/specificaties` | ✅ Live (torques/lubes OCR-incompleet) |

**Totaal geschat:** 30-38 wiki-pagina's uit DOC-03.

## Nieuwe secties nodig in wiki-structuur

De huidige `pages/` heeft nog geen directories voor:
- `onderstel/` (front + rear suspension + geometry)
- `besturing/` (steering gear + column)
- `remmen/` (braking system)

Deze moeten aangemaakt worden als onderdeel van de eerste PR per sectie, inclusief `_meta.ts` entries en `pages/index.mdx` tile-count updates.

## Legenda

- ⏳ Nog niet gedaan
- 📝 **DRAFT READY** — concept-MDX in deze `drafts/` dir, klaar voor validatie
- ✅ Gevalideerd en gemoved naar `pages/`
- ⏭️ Skip — geen wiki-pagina nodig (tools inline, generieke intro)

## Nawerk (trigger: ~40 wiki-pagina's totaal)

- **Unified gereedschap-index** `/gereedschap` — alfabetische tabel (A.2.0069, A.3.0377, C.6.0111, R.7.0010, ...) met kolom "wordt gebruikt op welke pagina's". Cross-DOC (A.3.0377 zit in DOC-03 én DOC-05). Bouwen via build-script dat alle `| A.X.XXXX | ... |` regels uit `pages/**/*.mdx` grept en aggregeert. **Nu niet:** Nextra ⌘K-zoek vindt tool-codes al, en bij <30 pagina's is overlap te dun voor een aparte index. Trigger wanneer DOC-03 validatie af is.
- **Ingrediënten-index** — vergelijkbaar voor smeermiddelen/sealants (Molykote BR2, Loctite 242, Curil K2, Bostik 475). Check in DOC-05 en DOC-04 of die lijsten overlappen — zo ja: centrale tabel met alternatieven/commercial equivalents.
