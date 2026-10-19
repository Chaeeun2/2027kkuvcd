import { MEDIA_API_URL } from "../../config/firebase";
import { auth } from "../lib/firebase";

export const IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "image/avif",
];
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const IMAGE_RULE_LABEL = "JPG, PNG, WebP, GIF, SVG, AVIF 지원 (최대 10MB)";

async function authorizedFetch(path, init = {}) {
  if (!MEDIA_API_URL) {
    throw new Error("미디어 서버 주소(VITE_MEDIA_API_URL)가 설정되지 않았습니다.");
  }

  const token = await auth.currentUser.getIdToken();
  const response = await fetch(`${MEDIA_API_URL}${path}`, {
    ...init,
    headers: { ...init.headers, Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? `업로드 서버 오류 (${response.status})`);
  }

  return response;
}

export function validateImageFile(file) {
  if (!IMAGE_TYPES.includes(file.type)) {
    throw new Error(`${file.name}: JPG, PNG, WebP, GIF, SVG, AVIF만 올릴 수 있습니다.`);
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error(`${file.name}: 10MB 이하 파일만 올릴 수 있습니다.`);
  }
}

/* 반환값 { src, key }의 src는 Worker가 공개로 내려주는 이미지 주소다. */
export async function uploadImage(file, folder) {
  validateImageFile(file);

  const response = await authorizedFetch(
    `/upload?folder=${encodeURIComponent(folder)}`,
    {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    },
  );
  const { key, url } = await response.json();
  return { id: key, src: url, key };
}

/* 콘텐츠 안의 업로드 이미지({ src, key })에서 R2 키만 모은다. */
export function collectMediaKeys(value, keys = new Set()) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectMediaKeys(item, keys));
  } else if (value && typeof value === "object") {
    if (typeof value.key === "string" && "src" in value) keys.add(value.key);
    Object.values(value).forEach((item) => collectMediaKeys(item, keys));
  }
  return keys;
}

/* 정리 작업이라 하나가 실패해도 나머지는 계속 지운다. */
export async function deleteImages(keys) {
  await Promise.allSettled(
    keys.map((key) =>
      authorizedFetch(`/media/${key}`, { method: "DELETE" }),
    ),
  );
}
