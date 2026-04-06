"""
Поиск и получение треков через Jamendo API.
Проксирует запросы, чтобы обойти CORS-ограничения браузера.
"""
import json
import urllib.request
import urllib.parse
import urllib.error

CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
}

CLIENT_ID = "b1a9c428"
BASE = "https://api.jamendo.com/v3.0"


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    params = event.get("queryStringParameters") or {}
    action = params.get("action", "top")
    query = params.get("q", "")
    limit = params.get("limit", "30")
    offset = params.get("offset", "0")
    tag = params.get("tag", "")

    try:
        if action == "search" and query:
            results = _search(query, int(limit), int(offset))
        elif action == "tag" and tag:
            results = _by_tag(tag, int(limit), int(offset))
        else:
            results = _top(int(limit), int(offset))
    except Exception as e:
        return _err(str(e))

    return _ok({"results": results, "count": len(results)})


def _fetch(url: str) -> dict:
    req = urllib.request.Request(url, headers={"User-Agent": "VolnaApp/1.0"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        return json.loads(resp.read())


def _build_track(t: dict) -> dict:
    return {
        "id": str(t.get("id", "")),
        "title": t.get("name", ""),
        "artist": t.get("artist_name", ""),
        "album": t.get("album_name", ""),
        "duration": int(t.get("duration", 0)),
        "cover": t.get("image") or "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&h=300&fit=crop",
        "audioUrl": t.get("audio", ""),
        "downloadUrl": t.get("audiodownload") or t.get("audio", ""),
    }


def _search(query: str, limit: int, offset: int) -> list:
    q = urllib.parse.urlencode({
        "client_id": CLIENT_ID,
        "format": "json",
        "limit": min(limit, 50),
        "offset": offset,
        "search": query,
        "audioformat": "mp32",
        "imagesize": "300",
        "include": "musicinfo",
    })
    data = _fetch(f"{BASE}/tracks/?{q}")
    return [_build_track(t) for t in data.get("results", [])]


def _top(limit: int, offset: int) -> list:
    q = urllib.parse.urlencode({
        "client_id": CLIENT_ID,
        "format": "json",
        "limit": min(limit, 50),
        "offset": offset,
        "order": "popularity_total",
        "audioformat": "mp32",
        "imagesize": "300",
    })
    data = _fetch(f"{BASE}/tracks/?{q}")
    return [_build_track(t) for t in data.get("results", [])]


def _by_tag(tag: str, limit: int, offset: int) -> list:
    q = urllib.parse.urlencode({
        "client_id": CLIENT_ID,
        "format": "json",
        "limit": min(limit, 50),
        "offset": offset,
        "tags": tag,
        "order": "popularity_total",
        "audioformat": "mp32",
        "imagesize": "300",
    })
    data = _fetch(f"{BASE}/tracks/?{q}")
    return [_build_track(t) for t in data.get("results", [])]


def _ok(data: dict) -> dict:
    return {
        "statusCode": 200,
        "headers": {**CORS, "Content-Type": "application/json"},
        "body": json.dumps({"ok": True, **data}),
    }


def _err(msg: str) -> dict:
    return {
        "statusCode": 500,
        "headers": {**CORS, "Content-Type": "application/json"},
        "body": json.dumps({"ok": False, "error": msg, "results": []}),
    }
