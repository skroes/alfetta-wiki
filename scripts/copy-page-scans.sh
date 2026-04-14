#!/usr/bin/env bash
#
# copy-page-scans.sh — Kopieer page-scan JPEGs uit alfetta-project naar alfetta-wiki/public/pages/.
#
# Bron:   ../alfetta-project/staging/DOC-XX/images/*.jpg  (300 DPI page-renders uit stage-pdf.sh)
# Dest:   ./public/pages/DOC-XX/*.jpg                     (gebruikt door <PageScan>)
#
# Idempotent — skipt bestanden die al bestaan met gelijke mtime.
# Draait in Next.js prebuild hook zodat Vercel de assets meekrijgt.
#
# Usage:
#   ./scripts/copy-page-scans.sh [--force]
#
# Bronregel-notitie: dit kopieert alleen afgeleide assets; de bron-PDFs blijven in
# alfetta-project. Wiki-repo committed deze kopie WEL (nodig voor Vercel deploy).

set -euo pipefail

WIKI_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_ROOT="$(cd "$WIKI_ROOT/../alfetta-project" && pwd)"
STAGING_DIR="$PROJECT_ROOT/staging"
DEST_DIR="$WIKI_ROOT/public/pages"

FORCE=0
[[ "${1:-}" == "--force" ]] && FORCE=1

if [[ ! -d "$STAGING_DIR" ]]; then
    echo "[copy-page-scans] Geen staging/ gevonden in $PROJECT_ROOT — niets te kopiëren."
    exit 0
fi

mkdir -p "$DEST_DIR"

TOTAL=0
COPIED=0
SKIPPED=0

for doc_dir in "$STAGING_DIR"/DOC-*; do
    [[ -d "$doc_dir/images" ]] || continue
    doc_code="$(basename "$doc_dir")"
    dest_doc="$DEST_DIR/$doc_code"
    mkdir -p "$dest_doc"

    for src in "$doc_dir/images"/*.jpg; do
        [[ -f "$src" ]] || continue
        TOTAL=$((TOTAL+1))
        name="$(basename "$src")"
        dest="$dest_doc/$name"

        if [[ -f "$dest" && $FORCE -eq 0 ]]; then
            # Check mtime-gelijkheid (simpel, geen hash)
            src_mtime=$(stat -f %m "$src" 2>/dev/null || stat -c %Y "$src")
            dest_mtime=$(stat -f %m "$dest" 2>/dev/null || stat -c %Y "$dest")
            if [[ "$src_mtime" == "$dest_mtime" ]]; then
                SKIPPED=$((SKIPPED+1))
                continue
            fi
        fi

        cp -p "$src" "$dest"
        COPIED=$((COPIED+1))
    done
done

echo "[copy-page-scans] totaal=$TOTAL, gekopieerd=$COPIED, geskipt=$SKIPPED"
