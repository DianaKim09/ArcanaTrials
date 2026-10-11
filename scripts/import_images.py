#!/usr/bin/env python3
"""Import card-named PNGs and update their image paths in the tarot deck."""

import argparse
import json
import re
import shutil
import sys
from pathlib import Path


PROJECT_ROOT = Path(__file__).resolve().parents[1]
CARDS_FILE = PROJECT_ROOT / "data" / "cards.json"


def slugify(name):
    slug = re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    return re.sub(r"-+", "-", slug)


def main():
    parser = argparse.ArgumentParser(
        description=(
            "Import PNGs named after tarot cards. Use <card-name>.png for card art "
            "and <card-name>-scene.png for scenario backgrounds."
        )
    )
    parser.add_argument("source_folder", type=Path, help="Folder containing the PNG files")
    parser.add_argument(
        "--overwrite",
        action="store_true",
        help="replace image files already in the project",
    )
    args = parser.parse_args()

    if not args.source_folder.is_dir():
        parser.error(f"source folder does not exist: {args.source_folder}")

    try:
        cards = json.loads(CARDS_FILE.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        print(f"Could not read {CARDS_FILE}: {error}", file=sys.stderr)
        return 1

    card_slugs = {slugify(card["name"]): card for card in cards}
    imports = []
    seen = set()

    for source in sorted(args.source_folder.iterdir()):
        if not source.is_file() or source.suffix.lower() != ".png":
            continue

        stem = source.stem.lower()
        is_scene = stem.endswith("-scene")
        slug = stem[:-6] if is_scene else stem
        card = card_slugs.get(slug)
        if card is None:
            print(
                f"Unrecognized image filename: {source.name}. "
                "Name each PNG after a tarot card, optionally adding -scene.",
                file=sys.stderr,
            )
            return 1

        kind = "scene" if is_scene else "card"
        key = (slug, kind)
        if key in seen:
            print(f"More than one {kind} image found for {card['name']}.", file=sys.stderr)
            return 1
        seen.add(key)

        relative_path = Path("assets") / ("scenes" if is_scene else "cards") / f"{slug}.png"
        target = PROJECT_ROOT / relative_path
        if target.exists() and not args.overwrite:
            print(
                f"{target.relative_to(PROJECT_ROOT)} already exists. "
                "Use --overwrite to replace it.",
                file=sys.stderr,
            )
            return 1
        imports.append((source, target, card, kind, relative_path.as_posix()))

    if not imports:
        print(f"No PNG files found in {args.source_folder}.", file=sys.stderr)
        return 1

    for source, target, card, kind, relative_path in imports:
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, target)
        if kind == "scene":
            card["scenario"]["image"] = relative_path
        else:
            card["image"] = relative_path
        print(f"{card['name']} ({kind}): {relative_path}")

    CARDS_FILE.write_text(
        json.dumps(cards, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"Imported {len(imports)} PNG file(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
