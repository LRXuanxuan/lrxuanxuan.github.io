#!/usr/bin/env python3
"""Non-destructive review report for potentially fragmentary song signs.

This is an editorial checklist, not a claim that every short lyric is incomplete.
No network calls, mutations, censorship, or effect on the build.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

POOL = Path(__file__).resolve().parents[1] / "assets/data/quote-pool.json"


def candidates(quotes: list[dict], max_chars: int) -> list[tuple[int, dict, str]]:
    found = []
    for index, row in enumerate(quotes):
        if row.get("sourceType") != "song":
            continue
        # Convention: the first displayed line is the English lyric excerpt.
        excerpt = row.get("text", "").split("\n", 1)[0].strip()
        if len(excerpt) < max_chars:
            found.append((index, row, excerpt))
    return found


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--max-chars", type=int, default=20,
                        help="Flag English first lines shorter than this threshold (default: 20)")
    parser.add_argument("--limit", type=int, default=40,
                        help="Show at most N candidates; 0 means all (default: 40)")
    args = parser.parse_args()
    if args.max_chars < 1 or args.limit < 0:
        parser.error("--max-chars must be positive and --limit must be nonnegative")

    pool = json.loads(POOL.read_text(encoding="utf-8"))
    quotes = pool["quotes"]
    songs = [row for row in quotes if row.get("sourceType") == "song"]
    review = candidates(quotes, args.max_chars)
    print(f"Song signs: {len(songs)}; potential review candidates (<{args.max_chars} characters): {len(review)}")
    print("Short excerpts can already be complete. Nothing will be deleted or modified.")
    print("index\tid\tsong\tEnglish excerpt")
    for index, row, excerpt in review[:args.limit or None]:
        print(f"{index}\t{row['id']}\t{row['book']}\t{excerpt}")


if __name__ == "__main__":
    main()
