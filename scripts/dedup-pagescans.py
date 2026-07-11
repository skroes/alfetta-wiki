#!/usr/bin/env python3
"""Dedup + caption PageScans in pages/**/*.mdx.

Regels (prd269 plaatsings-regels, alfetta-project):
  1. Eén <PageScan> per (doc, page) per MDX-bestand — eerste plaatsing wint,
     latere duplicaten worden verwijderd (regel 1: "Eén page-scan per
     bron-pagina die de MDX citeert"). Hergebruik ACROSS bestanden blijft
     toegestaan (regel 5).
  2. Caption verplicht (regel 4). Ontbrekende captions worden gegenereerd
     uit de sectiekoppen die de bronpagina citeren (<Cite p="N">, alleen
     betrouwbaar als de scan-doc de frontmatter source.doc is), met de
     plaatsings-sectiekop als fallback — gevalideerde wiki-content, dus
     bronregel-veilig. Handmatige captions blijven onaangetast; eerder
     gegenereerde captions (herkenbaar aan "— bronscan bij:") worden
     geregenereerd.

Gebruik: python3 scripts/dedup-pagescans.py [--write]
Zonder --write: dry-run rapport.
"""
import re
import sys
from pathlib import Path

WRITE = "--write" in sys.argv
ROOT = Path(__file__).resolve().parent.parent / "pages"

PAGESCAN = re.compile(r'^(\s*)<PageScan\b([^>]*?)/>\s*$')
DOC = re.compile(r'doc="([^"]+)"')
PAGE = re.compile(r'page=\{(\d+)\}')
GEN_CAPTION = re.compile(r'\s*caption="[^"]*— bronscan bij:[^"]*"')
HAS_CAPTION = re.compile(r'caption="')
HEADING = re.compile(r'^(#{1,3})\s+(.*)')
CITE = re.compile(r'<Cite\s+p="(\d+)"')
SRC_DOC = re.compile(r'^\s*doc:\s*(\S+)', re.M)


def clean_heading(h: str) -> str:
    h = re.sub(r'[*_`]', '', h).strip()
    h = h.replace('"', "'")
    return h


def frontmatter_doc(text: str) -> str | None:
    if not text.startswith('---'):
        return None
    end = text.find('\n---', 3)
    if end == -1:
        return None
    m = SRC_DOC.search(text[:end])
    return m.group(1) if m else None


def fmt_ctx(heads: list[str]) -> str:
    return ", ".join(heads[:4]) + (" e.v." if len(heads) > 4 else "")


def process(path: Path):
    text = path.read_text()
    src_doc = frontmatter_doc(text)
    lines = text.splitlines()
    heading = path.stem  # fallback vóór eerste kop

    occ = {}            # (doc,page) -> list of (line_idx, plaatsings-heading)
    order = []
    cite_heads = {}     # cite-pagenr -> [headings van secties die citeren]
    h1 = None
    for i, line in enumerate(lines):
        m = HEADING.match(line)
        if m:
            heading = clean_heading(m.group(2))
            if m.group(1) == '#' and h1 is None:
                h1 = heading
            continue
        for cm in CITE.finditer(line):
            cite_heads.setdefault(int(cm.group(1)), [])
            if heading not in cite_heads[int(cm.group(1))]:
                cite_heads[int(cm.group(1))].append(heading)
        ps = PAGESCAN.match(line)
        if ps:
            d, p = DOC.search(ps.group(2)), PAGE.search(ps.group(2))
            if not (d and p):
                continue
            key = (d.group(1), int(p.group(1)))
            if key not in occ:
                occ[key] = []
                order.append(key)
            occ[key].append((i, heading))

    removed, captioned = 0, 0
    drop = set()
    for key in order:
        entries = occ[key]
        keep_idx, _ = entries[0]
        for i, _ in entries[1:]:
            drop.add(i)
            removed += 1
        line = GEN_CAPTION.sub('', lines[keep_idx])
        if not HAS_CAPTION.search(line):
            doc, page = key
            heads = []
            if doc == src_doc and cite_heads.get(page):
                # H1-paginatitel is te generiek als context — alleen
                # specifiekere sectiekoppen tellen
                heads = [h for h in cite_heads[page] if h != h1]
            if not heads:
                for _, h in entries:
                    if h not in heads:
                        heads.append(h)
            cap = f'{doc} p{page} — bronscan bij: {fmt_ctx(heads)}'
            line = re.sub(r'\s*/>\s*$', f' caption="{cap}" />', line)
            captioned += 1
        lines[keep_idx] = line

    if not (removed or captioned):
        return None
    out = []
    for i, line in enumerate(lines):
        if i in drop:
            if out and out[-1] == "":
                out.pop()
            continue
        out.append(line)
    if WRITE:
        path.write_text("\n".join(out) + "\n")
    return (removed, captioned)


total_r = total_c = files = 0
for mdx in sorted(ROOT.rglob("*.mdx")):
    res = process(mdx)
    if res:
        files += 1
        total_r += res[0]
        total_c += res[1]
        print(f"{mdx.relative_to(ROOT.parent)}: -{res[0]} duplicaten, +{res[1]} captions")
print(f"\n{'GESCHREVEN' if WRITE else 'DRY-RUN'}: {files} bestanden, "
      f"{total_r} duplicaten verwijderd, {total_c} captions gezet")
