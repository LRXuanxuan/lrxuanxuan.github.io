#!/usr/bin/env python3
"""Update the canonical daily sign and its archive on the Asia/Shanghai calendar.

Uses the same FNV-1a weighted selection as assets/js/sign-calendar.js.
Run by GitHub Actions at 16:00 UTC (00:00 China Standard Time).
"""
from __future__ import annotations

import json
from datetime import date, datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

ROOT = Path(__file__).resolve().parents[1]
START = date(2026, 10, 12)
POOL = ROOT / "assets/data/quote-pool.json"
DAILY = ROOT / "_data/daily_sign.json"
HISTORY = ROOT / "_data/daily_sign_history.json"
FIELDS = ("id", "text", "book", "author", "chapter", "readerLink", "aspect")


def fnv32(value: str) -> float:
    n = 2166136261
    for char in value:
        cp = ord(char)
        values = (cp,) if cp <= 65535 else (
            0xD800 + ((cp - 0x10000) >> 10),
            0xDC00 + ((cp - 0x10000) & 1023),
        )
        for code in values:
            n = ((n ^ code) * 16777619) & 0xFFFFFFFF
    return n / 4294967296


def weight(quote: dict) -> float:
    try:
        value = float(quote.get("quoteWeight") or 1)
        return value if value > 0 else 1.0
    except (TypeError, ValueError):
        return 1.0


def choose(quotes: list[dict], day: str) -> dict:
    if not quotes:
        raise ValueError("Empty quote pool")
    books: dict[str, dict] = {}
    for q in quotes:
        key = q["book"]
        if key not in books:
            books[key] = {"weight": float(q.get("weight") or 1), "items": []}
        books[key]["items"].append(q)
    options = list(books.values())
    for item in options:
        item["weight"] *= sum(weight(q) for q in item["items"]) / len(item["items"])
    ticket = fnv32("rc-daily-sign-v1|" + day + "|book") * sum(
        item["weight"] for item in options
    )
    selection = options[-1]
    for item in options:
        ticket -= item["weight"]
        if ticket < 0:
            selection = item
            break
    ticket = fnv32("rc-daily-sign-v1|" + day + "|quote") * sum(
        weight(q) for q in selection["items"]
    )
    for q in selection["items"]:
        ticket -= weight(q)
        if ticket < 0:
            return q
    return selection["items"][-1]


def write_if_changed(path: Path, payload: object) -> bool:
    encoded = json.dumps(payload, ensure_ascii=False, indent=2) + "\n"
    if path.exists() and path.read_text(encoding="utf-8") == encoded:
        return False
    path.write_text(encoded, encoding="utf-8")
    return True


def main() -> None:
    today = datetime.now(ZoneInfo("Asia/Shanghai")).date()
    pool = json.loads(POOL.read_text(encoding="utf-8"))["quotes"]
    history = json.loads(HISTORY.read_text(encoding="utf-8"))
    if not pool or not all(q.get("id") for q in pool):
        raise ValueError("Missing or incomplete sign pool")
    if not isinstance(history, list):
        raise ValueError("Malformed daily sign history")
    known = {row["date"] for row in history}
    cursor = START
    while cursor <= today:
        key = cursor.isoformat()
        if key not in known:
            q = choose(pool, key)
            history.append({"date": key, **{name: q.get(name, "") for name in FIELDS}})
            known.add(key)
        cursor += timedelta(days=1)
    history.sort(key=lambda entry: entry["date"])
    # Never replace a previously published day's canonical entry.
    for row in history:
        if row["date"] == today.isoformat():
            current = row
            break
    else:
        raise RuntimeError("No quote for today")
    changed = write_if_changed(DAILY, current)
    changed |= write_if_changed(HISTORY, history)
    print(f"Daily sign for {today.isoformat()} (Asia/Shanghai): {current['book']} -- changed={changed}")


if __name__ == "__main__":
    main()
