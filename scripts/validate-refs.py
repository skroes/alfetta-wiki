#!/usr/bin/env python3
"""validate-refs.py — structurele bronverwijzing-gates (aanvulling op
validate-sources.sh, dat aanwezigheid checkt; dit script checkt consistentie).

Gates (wiki-verbetersessie 2026-07, review fase 1-5):
  G1  refs(Cite, Figure, PageScan) ⊆ frontmatter source.pages
      (alleen refs op de frontmatter-doc; cross-doc PageScans zijn
      toegestaan mits het asset bestaat)
  G2  SourceRef.pages == source.pages (set-gelijk, voor de SourceRef
      van de frontmatter-doc)
  G3  alle assets bestaan: frontmatter pdf, PageScan-JPG, Figure-bestand
  G4  eigenaarspagina's worden meegenomen (geen skip zoals de bash-MVP)
  G5  <Cite>/<PageScan>/<Figure> zonder source-frontmatter = fout

Rapport (geen gate): TL;DR ontbreekt bij >150 woorden body
(TONE-OF-VOICE regel 4). Redactioneel — mens beoordeelt.

Exit 0 = geen fouten; exit 1 = minstens één gate-fout.
"""
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PAGES = ROOT / "pages"
PUBLIC = ROOT / "public"

SKIP = {"index.mdx", "bronnen.mdx", "figuren.mdx", "jargon.mdx"}
SKIP_DIRS = {"governance"}

CITE = re.compile(r'<Cite\s+p="(\d+)"')
PAGESCAN = re.compile(r'<PageScan\b([^>]*?)/>', re.S)
FIGURE = re.compile(r'<Figure\b([^>]*?)/>', re.S)
SOURCEREF = re.compile(r'<SourceRef\b(.*?)/>', re.S)
ATTR_DOC = re.compile(r'\bdoc="([^"]+)"')
ATTR_PAGE = re.compile(r'\bpage=\{(\d+)\}')
ATTR_PAGES = re.compile(r'\bpages=\{\[([^\]]*)\]\}')
ATTR_SRC = re.compile(r'\bsrc="([^"]+)"')
TLDR = re.compile(r'\*\*TL;?DR\*\*', re.I)

errors, warnings, notes = [], [], []


def parse_frontmatter(text):
    if not text.startswith("---"):
        return None, text
    end = text.find("\n---", 3)
    if end == -1:
        return None, text
    fm, body = text[: end + 4], text[end + 4:]
    src = {}
    m = re.search(r'^source:\s*$', fm, re.M)
    if m:
        block = fm[m.end():]
        d = re.search(r'^\s{2}doc:\s*(\S+)', block, re.M)
        p = re.search(r'^\s{2}pages:\s*\[([^\]]*)\]', block, re.M)
        f = re.search(r'^\s{2}pdf:\s*(\S+)', block, re.M)
        if d:
            src["doc"] = d.group(1).strip('"')
        if p:
            src["pages"] = sorted(
                int(x) for x in p.group(1).split(",") if x.strip().isdigit()
            )
        if f:
            src["pdf"] = f.group(1).strip('"')
    return src or None, body


def resolve_figure(src_attr, doc_attr):
    """Zelfde resolutie als components/Figure.tsx."""
    if src_attr.startswith("/"):
        return PUBLIC / src_attr.lstrip("/")
    m = re.match(r'^(doc)(\d+)-', src_attr)
    slug = f"doc-{m.group(2)}" if m else (doc_attr or "doc-04").lower().replace("doc-", "doc-")
    if not m and doc_attr:
        slug = doc_attr.lower()
        slug = re.sub(r'^doc-?', 'doc-', slug)
    has_ext = re.search(r'\.(png|jpe?g|webp|svg)$', src_attr, re.I)
    name = src_attr if has_ext else f"{src_attr}.png"
    return PUBLIC / "figures" / slug / name


def word_count(body):
    txt = re.sub(r'```.*?```', '', body, flags=re.S)
    txt = re.sub(r'<[^>]+>', ' ', txt)
    return len(re.findall(r'\S+', txt))


for path in sorted(PAGES.rglob("*.mdx")):
    rel = path.relative_to(PAGES).as_posix()
    if path.name in SKIP or rel.split("/")[0] in SKIP_DIRS:
        continue
    text = path.read_text()
    src, body = parse_frontmatter(text)
    doc = src.get("doc") if src else None
    pages = set(src.get("pages", [])) if src else set()

    cites = {int(p) for p in CITE.findall(body)}
    scans, figures, srefs = [], [], []
    for m in PAGESCAN.finditer(body):
        d = ATTR_DOC.search(m.group(1))
        p = ATTR_PAGE.search(m.group(1))
        if d and p:
            scans.append((d.group(1), int(p.group(1))))
    for m in FIGURE.finditer(body):
        s = ATTR_SRC.search(m.group(1))
        d = ATTR_DOC.search(m.group(1))
        p = ATTR_PAGE.search(m.group(1))
        if s:
            figures.append((s.group(1), d.group(1) if d else None,
                            int(p.group(1)) if p else None))
    for m in SOURCEREF.finditer(body):
        d = ATTR_DOC.search(m.group(1))
        ps = ATTR_PAGES.search(m.group(1))
        if d:
            srefs.append((d.group(1), sorted(
                int(x) for x in ps.group(1).split(",") if x.strip().isdigit()
            ) if ps else None))

    has_refs = cites or scans or figures
    if has_refs and not (doc and pages):
        errors.append(f"{rel} — G5: bron-refs aanwezig maar geen source.doc/pages in frontmatter")
        continue
    if not src:
        continue  # eigen pagina zonder refs (bv. bedieningsoverzicht)

    # G1: Cite ⊆ source.pages
    bad = sorted(cites - pages)
    if bad:
        errors.append(f"{rel} — G1: <Cite> p{bad} niet in source.pages {sorted(pages)}")
    # G1: PageScan (frontmatter-doc) ⊆ source.pages
    bad = sorted({p for d, p in scans if d == doc} - pages)
    if bad:
        errors.append(f"{rel} — G1: <PageScan> p{bad} ({doc}) niet in source.pages {sorted(pages)}")
    # G1: Figure met page-prop ⊆ source.pages (alleen frontmatter-doc)
    bad = sorted({p for s, d, p in figures if p and (d or doc) == doc} - pages)
    if bad:
        errors.append(f"{rel} — G1: <Figure> p{bad} niet in source.pages {sorted(pages)}")

    # G2: SourceRef.pages == source.pages
    main_refs = [ps for d, ps in srefs if d == doc]
    for ps in main_refs:
        if ps is None:
            warnings.append(f"{rel} — G2: <SourceRef doc={doc}> zonder pages-attribuut")
        elif set(ps) != pages:
            errors.append(f"{rel} — G2: SourceRef.pages {ps} != source.pages {sorted(pages)}")

    # G3: assets
    pdf = src.get("pdf")
    if pdf and not (PUBLIC / pdf.lstrip("/")).is_file():
        errors.append(f"{rel} — G3: pdf {pdf} bestaat niet in public/")
    for d, p in scans:
        jpg = PUBLIC / "pages" / d / f"{p:03d}.jpg"
        if not jpg.is_file():
            errors.append(f"{rel} — G3: PageScan {d} p{p} — {jpg.relative_to(PUBLIC)} ontbreekt")
    for s, d, p in figures:
        f = resolve_figure(s, d)
        if not f.is_file():
            errors.append(f"{rel} — G3: Figure src={s} — {f.relative_to(PUBLIC)} ontbreekt")

    # Rapport: TL;DR bij >150 woorden
    if word_count(body) > 150 and not TLDR.search(body):
        notes.append(f"{rel} — TL;DR ontbreekt (body >150 woorden)")

print(f"validate-refs — {len(errors)} fout(en), {len(warnings)} waarschuwing(en), {len(notes)} notitie(s)")
for e in errors:
    print(f"  FAIL {e}")
for w in warnings:
    print(f"  WARN {w}")
if "--notes" in sys.argv:
    for n in notes:
        print(f"  NOTE {n}")
sys.exit(1 if errors else 0)
