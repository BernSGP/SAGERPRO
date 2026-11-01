#!/usr/bin/env python3
"""Best-effort SAGERPRO feed aggregator; standard library only.

Collect links and metadata, never article bodies, from Google News search RSS.
This unofficial feed is not comprehensive and may change or block requests.
Existing news is retained when a source is temporarily unavailable.
"""
import datetime as dt
import email.utils
import html
import json
import re
import sys
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "data" / "news.json"
CONFIG = ROOT / "config" / "sources.json"
UA = "SAGERPRO-EducationAggregator/1.0 (+https://sagerpro.net; RSS headlines only)"
MAX_ITEMS = 90


def clean_text(text):
    text = re.sub(r"<[^>]*>", "", text or "")
    return re.sub(r"\s+", " ", html.unescape(text)).strip()[:320]


def date_iso(value):
    if not value:
        return None
    try:
        d = email.utils.parsedate_to_datetime(value)
        if d.tzinfo is None:
            d = d.replace(tzinfo=dt.timezone.utc)
        return d.astimezone(dt.timezone.utc).isoformat().replace("+00:00", "Z")
    except (TypeError, ValueError, IndexError):
        return None


def fetch(source):
    args = urllib.parse.urlencode({
        "q": source["query"], "hl": "en-PH", "gl": "PH", "ceid": "PH:en"
    })
    url = "https://news.google.com/rss/search?" + args
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "application/rss+xml,application/xml,text/xml"})
    with urllib.request.urlopen(req, timeout=22) as response:
        data = response.read(2_000_000)
    root = ET.fromstring(data)
    entries = root.findall("./channel/item")
    # A valid empty feed is not an error, but don't overwrite an entire previously populated source on zero hits.
    records = []
    for item in entries[:max(1, min(50, source.get("limit", 15)))]:
        title = clean_text(item.findtext("title"))
        link = (item.findtext("link") or "").strip()
        parsed = urllib.parse.urlsplit(link)
        if not title or parsed.scheme != "https" or parsed.netloc.lower() not in {"news.google.com", "www.google.com"}:
            continue
        publisher = item.find("source")
        source_name = clean_text(publisher.text if publisher is not None else "") or source["name"]
        records.append({
            "title": title,
            "url": link,
            "source": source_name,
            "category": source["category"],
            "published": date_iso(item.findtext("pubDate")),
            "via": "Google News",
            "feed_name": source["name"]
        })
    return records


def main():
    config = json.loads(CONFIG.read_text(encoding="utf-8"))
    old = json.loads(OUT.read_text(encoding="utf-8")) if OUT.exists() else {}
    existing = old.get("items", [])
    merged = []
    successes = []
    failures = []
    for source in config["sources"]:
        if not source.get("enabled", True):
            continue
        try:
            latest = fetch(source)
            if not latest:
                # Preserve earlier reports if a source temporarily returns no indexed results.
                latest = [entry for entry in existing if entry.get("feed_name") == source["name"]]
            merged.extend(latest)
            successes.append(source["name"])
            print(f"{source['name']}: {len(latest)} records")
        except Exception as exc:
            print(f"WARNING: {source['name']}: {exc}", file=sys.stderr)
            failures.append(source["name"])
            merged.extend(entry for entry in existing if entry.get("feed_name") == source["name"])
    if not successes:
        raise SystemExit("All feeds failed. Retaining previous data; no file modified.")
    deduped = {}
    for entry in merged:
        key = re.sub(r"\W+", "", (entry.get("title") or "").lower())
        if key and key not in deduped:
            deduped[key] = entry
    records = sorted(deduped.values(), key=lambda v: v.get("published") or "", reverse=True)[:MAX_ITEMS]
    result = {
        "updated_at": dt.datetime.now(dt.timezone.utc).isoformat().replace("+00:00", "Z"),
        "items": records,
        "sources_ok": successes,
        "sources_failed": failures
    }
    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(json.dumps(result, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Saved {len(records)} unique headlines.")


if __name__ == "__main__":
    main()
