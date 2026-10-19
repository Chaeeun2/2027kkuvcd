import { createRemoteJWKSet, jwtVerify } from "jose";

/*
 * 관리자 이미지 업로드/삭제와 공개 이미지 제공을 맡는 Worker.
 *   GET    /media/:key        누구나 읽기 (사이트 <img>가 쓰는 주소)
 *   PUT    /upload?folder=..  관리자만. 요청 본문이 파일 자체다.
 *   DELETE /media/:key        관리자만
 * 관리자 판별은 Firebase ID 토큰을 검증한 뒤, 그 토큰으로 Firestore
 * admins/{uid} 문서를 읽을 수 있는지로 한다(보안 규칙과 같은 기준).
 */

const FIREBASE_KEYS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com",
  ),
);

const IMAGE_EXTENSIONS = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/gif", "gif"],
  ["image/svg+xml", "svg"],
  ["image/avif", "avif"],
]);

const FOLDER_PATTERN = /^[a-z0-9-]{1,40}$/;
const KEY_PATTERN = /^[a-z0-9-]{1,40}\/[0-9a-f-]{36}\.[a-z0-9]{2,5}$/;
/* scripts/upload-assets.mjs가 올리는 사이트 기본 파일. 이름에 내용 해시가 들어간다. */
const STATIC_KEY_PATTERN = /^static\/[a-z0-9-]{1,80}\.[0-9a-f]{8}\.[a-z0-9]{2,5}$/;

class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function json(body, status = 200) {
  return Response.json(body, { status });
}

function corsHeaders(request, env) {
  const origin = request.headers.get("Origin");
  const allowed = env.ALLOWED_ORIGINS.split(",").map((item) => item.trim());
  if (!origin || !allowed.includes(origin)) return {};

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Authorization, Content-Type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

async function requireAdmin(request, env) {
  const header = request.headers.get("Authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) throw new HttpError(401, "로그인이 필요합니다.");

  let payload;
  try {
    ({ payload } = await jwtVerify(token, FIREBASE_KEYS, {
      issuer: `https://securetoken.google.com/${env.FIREBASE_PROJECT_ID}`,
      audience: env.FIREBASE_PROJECT_ID,
    }));
  } catch {
    throw new HttpError(401, "로그인이 만료되었습니다. 다시 로그인해 주세요.");
  }

  const adminUrl = `https://firestore.googleapis.com/v1/projects/${env.FIREBASE_PROJECT_ID}/databases/(default)/documents/admins/${encodeURIComponent(payload.sub)}`;
  const response = await fetch(adminUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });
  await response.body?.cancel();

  if (!response.ok) throw new HttpError(403, "관리자 권한이 없습니다.");
}

async function serveMedia(request, env, key) {
  const isHead = request.method === "HEAD";
  const object = isHead
    ? await env.MEDIA_BUCKET.head(key)
    : await env.MEDIA_BUCKET.get(key);
  if (!object) throw new HttpError(404, "이미지를 찾을 수 없습니다.");

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("ETag", object.httpEtag);
  /* 키에 UUID가 들어가 같은 주소의 내용이 바뀌지 않으므로 길게 캐시한다. */
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("X-Content-Type-Options", "nosniff");
  /* 폰트와 3D 모델은 CORS 요청으로 받으므로 공개 파일은 어느 출처에서나 읽게 한다. */
  headers.set("Access-Control-Allow-Origin", "*");
  /* SVG 안의 스크립트가 이 주소에서 실행되지 않게 막는다. */
  headers.set("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; sandbox");

  return new Response(isHead ? null : object.body, { headers });
}

async function uploadMedia(request, env) {
  await requireAdmin(request, env);

  const folder = new URL(request.url).searchParams.get("folder") ?? "";
  if (!FOLDER_PATTERN.test(folder)) throw new HttpError(400, "잘못된 폴더 이름입니다.");

  const contentType = (request.headers.get("Content-Type") ?? "").split(";")[0].trim();
  const extension = IMAGE_EXTENSIONS.get(contentType);
  if (!extension) throw new HttpError(415, "지원하지 않는 이미지 형식입니다.");

  const size = Number(request.headers.get("Content-Length"));
  if (!Number.isFinite(size) || size <= 0) throw new HttpError(411, "파일 크기를 알 수 없습니다.");
  if (size > Number(env.MAX_UPLOAD_BYTES)) throw new HttpError(413, "10MB 이하 파일만 올릴 수 있습니다.");

  const key = `${folder}/${crypto.randomUUID()}.${extension}`;
  await env.MEDIA_BUCKET.put(key, request.body, {
    httpMetadata: { contentType },
  });

  const url = `${new URL(request.url).origin}/media/${key}`;
  return json({ key, url }, 201);
}

async function deleteMedia(request, env, key) {
  await requireAdmin(request, env);
  await env.MEDIA_BUCKET.delete(key);
  return json({ deleted: key });
}

async function route(request, env) {
  const { pathname } = new URL(request.url);
  const mediaKey = pathname.startsWith("/media/") ? pathname.slice("/media/".length) : null;

  const isStatic = mediaKey !== null && STATIC_KEY_PATTERN.test(mediaKey);
  if (mediaKey !== null && !isStatic && !KEY_PATTERN.test(mediaKey)) {
    throw new HttpError(404, "이미지를 찾을 수 없습니다.");
  }

  if (mediaKey && (request.method === "GET" || request.method === "HEAD")) {
    return serveMedia(request, env, mediaKey);
  }
  if (mediaKey && !isStatic && request.method === "DELETE") {
    return deleteMedia(request, env, mediaKey);
  }
  if (pathname === "/upload" && request.method === "PUT") return uploadMedia(request, env);

  throw new HttpError(404, "없는 경로입니다.");
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request, env);
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    let response;
    try {
      response = await route(request, env);
    } catch (error) {
      if (error instanceof HttpError) {
        response = json({ error: error.message }, error.status);
      } else {
        console.error(JSON.stringify({ message: "unhandled error", error: String(error) }));
        response = json({ error: "서버 오류가 발생했습니다." }, 500);
      }
    }

    Object.entries(cors).forEach(([name, value]) => response.headers.set(name, value));
    return response;
  },
};
