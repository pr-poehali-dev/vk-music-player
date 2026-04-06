"""
OAuth авторизация через ВКонтакте и Одноклассники.
Обрабатывает callback с кодом авторизации, обменивает на токен, возвращает данные пользователя.
"""
import os
import json
import urllib.request
import urllib.parse
import urllib.error
import hashlib
import hmac
import time


CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Id, X-Auth-Token",
}


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS_HEADERS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    body_str = event.get("body") or "{}"

    try:
        body = json.loads(body_str)
    except Exception:
        body = {}

    action = params.get("action") or body.get("action", "")

    # ── GET AUTH URL ──────────────────────────────────────────────────────────
    if action == "get_vk_url":
        vk_app_id = os.environ.get("VK_APP_ID", "")
        redirect_uri = body.get("redirect_uri") or params.get("redirect_uri", "")
        if not vk_app_id:
            return _error("VK_APP_ID не настроен")
        scope = "audio,offline"
        url = (
            f"https://oauth.vk.com/authorize"
            f"?client_id={vk_app_id}"
            f"&display=page"
            f"&redirect_uri={urllib.parse.quote(redirect_uri)}"
            f"&scope={scope}"
            f"&response_type=code"
            f"&v=5.131"
        )
        return _ok({"url": url})

    if action == "get_ok_url":
        ok_app_id = os.environ.get("OK_APP_ID", "")
        redirect_uri = body.get("redirect_uri") or params.get("redirect_uri", "")
        if not ok_app_id:
            return _error("OK_APP_ID не настроен")
        scope = "GET_EMAIL;VALUABLE_ACCESS"
        url = (
            f"https://connect.ok.ru/oauth/authorize"
            f"?client_id={ok_app_id}"
            f"&scope={scope}"
            f"&response_type=code"
            f"&redirect_uri={urllib.parse.quote(redirect_uri)}"
            f"&layout=w"
        )
        return _ok({"url": url})

    # ── EXCHANGE CODE → TOKEN ─────────────────────────────────────────────────
    if action == "vk_callback":
        code = body.get("code") or params.get("code", "")
        redirect_uri = body.get("redirect_uri", "")
        if not code:
            return _error("Код авторизации не передан")
        return _vk_exchange(code, redirect_uri)

    if action == "ok_callback":
        code = body.get("code") or params.get("code", "")
        redirect_uri = body.get("redirect_uri", "")
        if not code:
            return _error("Код авторизации не передан")
        return _ok_exchange(code, redirect_uri)

    # ── GET USER INFO ─────────────────────────────────────────────────────────
    if action == "vk_user":
        token = body.get("token", "")
        user_id = body.get("user_id", "")
        return _vk_get_user(token, user_id)

    if action == "ok_user":
        token = body.get("token", "")
        return _ok_get_user(token)

    return _error("Неизвестное действие", 400)


def _vk_exchange(code: str, redirect_uri: str) -> dict:
    vk_app_id = os.environ.get("VK_APP_ID", "")
    vk_secret = os.environ.get("VK_APP_SECRET", "")
    if not vk_app_id or not vk_secret:
        return _error("VK credentials не настроены")

    params = urllib.parse.urlencode({
        "client_id": vk_app_id,
        "client_secret": vk_secret,
        "redirect_uri": redirect_uri,
        "code": code,
    })
    req = urllib.request.Request(
        f"https://oauth.vk.com/access_token?{params}",
        method="GET",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return _error(f"VK OAuth ошибка: {e.code}")

    if "error" in data:
        return _error(data.get("error_description", "VK OAuth ошибка"))

    return _ok({
        "token": data.get("access_token"),
        "user_id": str(data.get("user_id", "")),
        "expires_in": data.get("expires_in", 0),
    })


def _vk_get_user(token: str, user_id: str) -> dict:
    params = urllib.parse.urlencode({
        "user_ids": user_id,
        "fields": "photo_100,screen_name",
        "access_token": token,
        "v": "5.131",
    })
    req = urllib.request.Request(
        f"https://api.vk.com/method/users.get?{params}",
        method="GET",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return _error(f"VK API ошибка: {e.code}")

    users = data.get("response", [])
    if not users:
        return _error("Пользователь не найден")
    u = users[0]
    return _ok({
        "id": str(u.get("id", "")),
        "name": f"{u.get('first_name','')} {u.get('last_name','')}".strip(),
        "avatar": u.get("photo_100", ""),
        "screen_name": u.get("screen_name", ""),
        "provider": "vk",
    })


def _ok_exchange(code: str, redirect_uri: str) -> dict:
    ok_app_id = os.environ.get("OK_APP_ID", "")
    ok_secret = os.environ.get("OK_APP_SECRET", "")
    ok_public = os.environ.get("OK_APP_PUBLIC_KEY", "")
    if not ok_app_id or not ok_secret:
        return _error("OK credentials не настроены")

    params = urllib.parse.urlencode({
        "client_id": ok_app_id,
        "client_secret": ok_secret,
        "redirect_uri": redirect_uri,
        "code": code,
        "grant_type": "authorization_code",
    })
    req = urllib.request.Request(
        "https://api.ok.ru/oauth/token.do",
        data=params.encode(),
        method="POST",
        headers={"Content-Type": "application/x-www-form-urlencoded"},
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return _error(f"OK OAuth ошибка: {e.code}")

    if "error_code" in data:
        return _error(data.get("error_msg", "OK OAuth ошибка"))

    return _ok({
        "token": data.get("access_token"),
        "refresh_token": data.get("refresh_token", ""),
        "expires_in": data.get("expires_in", 0),
    })


def _ok_get_user(token: str) -> dict:
    ok_app_id = os.environ.get("OK_APP_ID", "")
    ok_secret = os.environ.get("OK_APP_SECRET", "")
    ok_public = os.environ.get("OK_APP_PUBLIC_KEY", "")
    if not ok_secret or not ok_public:
        return _error("OK credentials не настроены")

    session_secret = hashlib.md5(f"{token}{ok_secret}".encode()).hexdigest()
    sig_str = f"application_key={ok_public}fields=uid,name,pic_1format=jsonmethod=users.getCurrentUser{session_secret}"
    sig = hashlib.md5(sig_str.encode()).hexdigest()

    params = urllib.parse.urlencode({
        "application_key": ok_public,
        "fields": "uid,name,pic_1",
        "format": "json",
        "method": "users.getCurrentUser",
        "access_token": token,
        "sig": sig,
    })
    req = urllib.request.Request(
        f"https://api.ok.ru/fb.do?{params}",
        method="GET",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
    except urllib.error.HTTPError as e:
        return _error(f"OK API ошибка: {e.code}")

    if "error_code" in data:
        return _error(data.get("error_msg", "OK API ошибка"))

    return _ok({
        "id": str(data.get("uid", "")),
        "name": data.get("name", ""),
        "avatar": data.get("pic_1", ""),
        "provider": "ok",
    })


def _ok(data: dict) -> dict:
    return {
        "statusCode": 200,
        "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
        "body": json.dumps({"ok": True, **data}),
    }


def _error(msg: str, code: int = 500) -> dict:
    return {
        "statusCode": code,
        "headers": {**CORS_HEADERS, "Content-Type": "application/json"},
        "body": json.dumps({"ok": False, "error": msg}),
    }
