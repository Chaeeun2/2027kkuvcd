import { MEDIA_API_URL } from "../config/firebase";

/** 화면용 대략적 너비(2x 레티나 기준으로 잡은 값). */
export const IMAGE_SIZES = {
  workCard: 720,
  workRelated: 520,
  workGallery: 1400,
  designerCard: 880,
  designerProfile: 1024,
  designerProject: 520,
  aboutIntro: 960,
  aboutBackground: 1440,
  aboutGallery: 640,
};

const TRANSFORM_SKIP = /\.(svg|gif)(\?|$)/i;

export function optimizeMediaUrl(
  src,
  { width, quality = 82, format = "auto" } = {},
) {
  if (!src || typeof src !== "string") return src;
  if (src.startsWith("data:") || TRANSFORM_SKIP.test(src)) return src;
  if (!width && quality === 82 && format === "auto") return src;

  let url;
  try {
    url = new URL(src, window.location.origin);
  } catch {
    return src;
  }

  if (MEDIA_API_URL && !url.href.startsWith(MEDIA_API_URL)) return src;

  if (width) url.searchParams.set("w", String(Math.round(width)));
  url.searchParams.set("q", String(Math.round(quality)));
  url.searchParams.set("f", format);

  return url.toString();
}
