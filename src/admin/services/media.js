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

const UPLOAD_MAX_EDGE = 2400;
const UPLOAD_JPEG_QUALITY = 0.88;

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error(`${file.name}: 이미지를 읽을 수 없습니다.`));
    };
    image.src = url;
  });
}

/*
 * 원본이 크면 업로드 전에 리사이즈·재압축한다. SVG/GIF는 그대로 둔다.
 * Worker ?w= 변환과 함께 썸네일·상세 모두 전송량을 줄인다.
 */
export async function prepareImageForUpload(file) {
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }

  if (!file.type.startsWith("image/")) return file;

  const image = await loadImageFromFile(file);
  const longest = Math.max(image.naturalWidth, image.naturalHeight);
  if (longest <= UPLOAD_MAX_EDGE && file.size <= 1_500_000) {
    return file;
  }

  const scale = longest > UPLOAD_MAX_EDGE ? UPLOAD_MAX_EDGE / longest : 1;
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return file;

  context.drawImage(image, 0, 0, width, height);

  const outputType =
    file.type === "image/png" && file.size < 800_000 ? "image/png" : "image/jpeg";
  const blob = await new Promise((resolve) => {
    canvas.toBlob(resolve, outputType, UPLOAD_JPEG_QUALITY);
  });

  if (!blob || blob.size >= file.size) return file;

  const extension = outputType === "image/png" ? ".png" : ".jpg";
  const baseName = file.name.replace(/\.[^.]+$/, "");
  return new File([blob], `${baseName}${extension}`, { type: outputType });
}

/* 반환값 { src, key }의 src는 Worker가 공개로 내려주는 이미지 주소다. */
export async function uploadImage(file, folder) {
  validateImageFile(file);
  const payload = await prepareImageForUpload(file);

  const response = await authorizedFetch(
    `/upload?folder=${encodeURIComponent(folder)}`,
    {
      method: "PUT",
      headers: { "Content-Type": payload.type },
      body: payload,
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
