#!/usr/bin/env bash
#
# generate-figures-json.sh — Genereer figures.json per DOC uit:
#   1. Bestaande PNG/JPG crops in public/figures/{doc}/  (filename: doc04-p{N}-fig{NN}-{slug}.{png,jpg})
#   2. <Figure src="..."> placements in pages/**/*.mdx
#
# Output: ../alfetta-project/content/{doc}/figures.json
#
# Usage:
#   ./scripts/generate-figures-json.sh DOC-04
#   ./scripts/generate-figures-json.sh --all
#
# Schema: zie alfetta-project/prds/prd269-figures-placement.md.
#
# Bronregel: dit script herleidt label en caption uit de filename-slug. Geen training-data.
# Velden die niet vast te stellen zijn worden leeg gelaten met needs_label: true.

set -euo pipefail

WIKI_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PROJECT_ROOT="$(cd "$WIKI_ROOT/../alfetta-project" && pwd)"
FIGURES_ROOT="$WIKI_ROOT/public/figures"
PAGES_ROOT="$WIKI_ROOT/pages"

if [[ $# -eq 0 ]]; then
    echo "Usage: $0 DOC-XX [DOC-YY ...] | --all" >&2
    exit 2
fi

if [[ "$1" == "--all" ]]; then
    DOCS=()
    for d in "$FIGURES_ROOT"/doc-*; do
        [[ -d "$d" ]] || continue
        DOCS+=("$(basename "$d" | tr '[:lower:]' '[:upper:]' | sed 's/DOC-/DOC-/')")
    done
else
    DOCS=("$@")
fi

# Per DOC genereren
for DOC_CODE in "${DOCS[@]}"; do
    # filename-conventie: doc04-p... → doc-04
    doc_slug="$(echo "$DOC_CODE" | tr '[:upper:]' '[:lower:]')"
    short_slug="$(echo "$DOC_CODE" | tr '[:upper:]' '[:lower:]' | tr -d '-')"   # doc-04 → doc04
    fig_dir="$FIGURES_ROOT/$doc_slug"
    out_dir="$PROJECT_ROOT/content/$doc_slug"
    out_file="$out_dir/figures.json"

    if [[ ! -d "$fig_dir" ]]; then
        echo "[$DOC_CODE] geen $fig_dir — overslaan"
        continue
    fi
    mkdir -p "$out_dir"

    # Verzamel placements: { src_basename: [mdx_path, ...] }
    # Tijdelijke files (macOS bash 3.2 mist associative arrays in dit pad)
    tmp_placements="$(mktemp)"
    tmp_captions="$(mktemp)"
    trap 'rm -f "$tmp_placements" "$tmp_captions"' EXIT

    while IFS= read -r line; do
        # line = "pad/naar/file.mdx:<Figure src="doc04-..." ..."
        mdx_path="${line%%:*}"
        rest="${line#*:}"
        # Pak src-waarde
        src_val="$(echo "$rest" | sed -n 's/.*src="\([^"]*\)".*/\1/p')"
        [[ -z "$src_val" ]] && continue
        # Strip ev. extensie (component voegt .png toe als geen ext)
        src_base="${src_val%.png}"
        src_base="${src_base%.jpg}"
        # Relatief pad voor used_in (vanaf project root)
        rel_mdx="alfetta-wiki/${mdx_path#$WIKI_ROOT/}"
        echo "$src_base|$rel_mdx" >> "$tmp_placements"
    done < <(grep -rH "<Figure src=\"${short_slug}-" "$PAGES_ROOT" 2>/dev/null || true)

    # Verzamel caption-lookup: src_base -> caption uit <Figure src="..." caption="..." ... />
    # Multi-line safe via perl (slurp mode). Output: src_base<TAB>caption
    # Deduplicatie: eerste voorkomen wint (deterministic via sort + LC_ALL=C + find volgorde).
    if [[ -d "$PAGES_ROOT" ]]; then
        find "$PAGES_ROOT" -name '*.mdx' -print0 2>/dev/null \
          | LC_ALL=C sort -z \
          | xargs -0 perl -0777 -ne '
              while (/<Figure\b[^>]*?\bsrc="([^"]+)"[^>]*?\bcaption="([^"]*)"[^>]*?\/?>/sg) {
                  my ($src, $cap) = ($1, $2);
                  $src =~ s/\.(png|jpg|jpeg)$//i;
                  print "$src\t$cap\n";
              }
              # Ook andere volgorde: caption voor src
              while (/<Figure\b[^>]*?\bcaption="([^"]*)"[^>]*?\bsrc="([^"]+)"[^>]*?\/?>/sg) {
                  my ($cap, $src) = ($1, $2);
                  $src =~ s/\.(png|jpg|jpeg)$//i;
                  print "$src\t$cap\n";
              }
          ' > "$tmp_captions" 2>/dev/null || true
    fi

    # Bouw JSON
    {
        echo '{'
        echo '  "$schema": "https://alfetta-wiki.vercel.app/schemas/figures-v1.json",'
        echo "  \"doc_code\": \"$DOC_CODE\","
        echo "  \"last_updated\": \"$(date -u +%Y-%m-%d)\","
        echo "  \"schema_version\": \"v1\","
        echo "  \"generator\": \"alfetta-wiki/scripts/generate-figures-json.sh\","
        echo "  \"note\": \"Auto-gegenereerd uit public/figures/$doc_slug/ + grep <Figure src=> in pages/. Labels herleid uit filename-slug — verifieer handmatig bij needs_label=true.\","
        echo '  "figures": ['

        first=1
        # Loop alle figure-files (alleen png/jpg) in deterministic volgorde
        for f in $(ls "$fig_dir" | grep -Ei '\.(png|jpg|jpeg)$' | LC_ALL=C sort); do
            base="${f%.*}"   # doc04-p35-fig02-contactpunten-ontsteking
            ext="${f##*.}"

            # Parse filename: docNN-pNN-figNN-slug
            # Bv: doc04-p35-fig02-contactpunten-ontsteking → page=35, fig_nr=02, slug=contactpunten-ontsteking
            page="$(echo "$base" | sed -n 's/^doc[0-9]*-p\([0-9]*\)-.*/\1/p')"
            fig_nr="$(echo "$base" | sed -n 's/^doc[0-9]*-p[0-9]*-fig\([0-9]*\)-.*/\1/p')"
            slug="$(echo "$base" | sed -n 's/^doc[0-9]*-p[0-9]*-fig[0-9]*-\(.*\)/\1/p')"

            # Speciaal geval: doc04-p01-voorpagina (geen fig-nr)
            if [[ -z "$page" ]]; then
                page="$(echo "$base" | sed -n 's/^doc[0-9]*-p\([0-9]*\)-.*/\1/p')"
            fi
            if [[ -z "$fig_nr" ]]; then
                # Probeer: doc04-p01-voorpagina
                slug="$(echo "$base" | sed -n 's/^doc[0-9]*-p[0-9]*-\(.*\)/\1/p')"
                fig_nr="00"
            fi

            # Strip leading zeros voor JSON int (08 → 8) anders is het invalid JSON / octal in printf
            page_int="$((10#${page:-0}))"
            id="${DOC_CODE}-p${page}-fig${fig_nr}"

            # Label: eerst MDX caption proberen (primary), anders default formatter.
            # MDX caption lookup op src_base (= filename zonder extensie)
            mdx_caption=""
            if [[ -s "$tmp_captions" ]]; then
                mdx_caption="$(awk -F'\t' -v k="$base" '$1==k {print $2; exit}' "$tmp_captions")"
            fi

            if [[ -n "$mdx_caption" ]]; then
                label="$mdx_caption"
                needs_label=false
            elif [[ -n "$slug" ]]; then
                # Default crop-label: "Figuur N — slug with spaces, first-letter-upper"
                label_raw="$(echo "$slug" | tr '-' ' ')"
                label_cased="$(echo "$label_raw" | awk '{print toupper(substr($0,1,1)) substr($0,2)}')"
                # fig_nr zonder leading zero voor leesbaar label
                fig_int="$((10#${fig_nr:-0}))"
                if [[ "$fig_int" -gt 0 ]]; then
                    label="Figuur ${fig_int} — ${label_cased}"
                else
                    # fig_nr=00 (bv. voorpagina) — label zonder figuur-nummer
                    label="$label_cased"
                fi
                needs_label=false
            else
                label=""
                needs_label=true
            fi
            # JSON-escape label: backslash en dubbele quote
            label="$(printf '%s' "$label" | sed 's/\\/\\\\/g; s/"/\\"/g')"

            # Verzamel used_in (kan meerdere zijn). `|| true` voorkomt set -e bij geen-match.
            used_in_list="$(grep "^${base}|" "$tmp_placements" 2>/dev/null | cut -d'|' -f2 | sort -u || true)"
            if [[ -n "$used_in_list" ]]; then
                used_in_json="$(echo "$used_in_list" | awk 'BEGIN{ORS=""; print "["} {if(NR>1) printf ", "; printf "\"%s\"", $0} END{print "]"}')"
            else
                used_in_json="[]"
            fi

            # Comma tussen entries
            if [[ $first -eq 1 ]]; then
                first=0
            else
                echo "    },"
            fi

            # related_page: afgeleid uit eerste used_in[] → /route zonder .mdx
            related_page=""
            if [[ -n "$used_in_list" ]]; then
                first_used="$(echo "$used_in_list" | head -n1)"
                # strip "alfetta-wiki/pages" prefix en ".mdx" suffix
                related_page="${first_used#alfetta-wiki/pages}"
                related_page="${related_page%.mdx}"
            fi

            cat <<EOF
    {
      "id": "$id",
      "doc": "$DOC_CODE",
      "page": ${page_int},
      "fig_nr": "$fig_nr",
      "kind": "figure-crop",
      "source": "alfetta-wiki/public/figures/$doc_slug/$f",
      "public_path": "/figures/$doc_slug/$f",
      "filename_slug": "$slug",
      "label": "$label",
      "caption_nl": "",
      "tags": [],
      "related_page": "$related_page",
      "used_in": $used_in_json,
      "needs_label": $needs_label,
      "validated": false
EOF
        done

        # Page-scan entries: scan public/pages/DOC-XX/*.jpg en grep <PageScan doc=".." page={N}>
        pages_dir="$WIKI_ROOT/public/pages/$DOC_CODE"
        if [[ -d "$pages_dir" ]]; then
            # Verzamel PageScan-placements: "pageN|mdx_path"
            tmp_pagescan="$(mktemp)"
            while IFS= read -r line; do
                mdx_path="${line%%:*}"
                rest="${line#*:}"
                # Accepteer page={35} of page="35"
                page_val="$(echo "$rest" | sed -n 's/.*page={\([0-9][0-9]*\)}.*/\1/p')"
                [[ -z "$page_val" ]] && page_val="$(echo "$rest" | sed -n 's/.*page="\([0-9][0-9]*\)".*/\1/p')"
                [[ -z "$page_val" ]] && continue
                rel_mdx="alfetta-wiki/${mdx_path#$WIKI_ROOT/}"
                echo "$page_val|$rel_mdx" >> "$tmp_pagescan"
            done < <(grep -rHE "<PageScan[^>]*doc=\"$DOC_CODE\"" "$PAGES_ROOT" 2>/dev/null || true)

            for p in $(ls "$pages_dir" | grep -Ei '\.jpg$' | LC_ALL=C sort); do
                page_num="${p%.jpg}"
                page_num="${page_num#0}"; page_num="${page_num#0}"
                page_int="$((10#${page_num:-0}))"
                page_padded="$(printf '%03d' "$page_int")"
                used_pagescan="$(grep "^${page_int}|" "$tmp_pagescan" 2>/dev/null | cut -d'|' -f2 | sort -u || true)"
                if [[ -n "$used_pagescan" ]]; then
                    used_ps_json="$(echo "$used_pagescan" | awk 'BEGIN{ORS=""; print "["} {if(NR>1) printf ", "; printf "\"%s\"", $0} END{print "]"}')"
                else
                    used_ps_json="[]"
                fi

                if [[ $first -eq 1 ]]; then
                    first=0
                else
                    echo "    },"
                fi

                # related_page: afgeleid uit eerste used_in[] (of leeg bij geen placement)
                related_page_ps=""
                if [[ -n "$used_pagescan" ]]; then
                    first_ps_used="$(echo "$used_pagescan" | head -n1)"
                    related_page_ps="${first_ps_used#alfetta-wiki/pages}"
                    related_page_ps="${related_page_ps%.mdx}"
                fi

                cat <<EOF
    {
      "id": "${DOC_CODE}-p${page_padded}-full",
      "doc": "$DOC_CODE",
      "page": ${page_int},
      "kind": "page-scan",
      "source": "alfetta-project/staging/$DOC_CODE/images/${page_padded}.jpg",
      "public_path": "/pages/$DOC_CODE/${page_padded}.jpg",
      "label": "${DOC_CODE} pagina ${page_int} (full-page scan)",
      "caption_nl": "",
      "tags": [],
      "related_page": "$related_page_ps",
      "used_in": $used_ps_json,
      "needs_label": false,
      "validated": false
EOF
            done
            rm -f "$tmp_pagescan"
        fi

        # Sluit laatste entry + array
        if [[ $first -eq 0 ]]; then
            echo "    }"
        fi
        echo '  ]'
        echo '}'
    } > "$out_file"

    # Sync canonical → wiki-public kopie zodat FigureGallery (Nextra/Next.js) de
    # canonical JSON kan importeren via relatief pad. Canonical blijft source-of-truth
    # in alfetta-project/content/$doc_slug/figures.json.
    wiki_public_copy="$FIGURES_ROOT/$doc_slug/figures-index.json"
    cp "$out_file" "$wiki_public_copy"

    # Stats
    crop_count="$(ls "$fig_dir" | grep -Eic '\.(png|jpg|jpeg)$' || true)"
    placement_count="$(wc -l < "$tmp_placements" | tr -d ' ')"
    used_count="$(cut -d'|' -f1 "$tmp_placements" | sort -u | wc -l | tr -d ' ')"
    echo "[$DOC_CODE] figures=$crop_count, placements=$placement_count (over $used_count unieke crops) → $out_file"

    rm -f "$tmp_placements" "$tmp_captions"
    trap - EXIT
done
