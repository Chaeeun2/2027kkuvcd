import { optimizeMediaUrl } from "../utils/optimizedImage";

/*
 * 미디어 Worker ?w=&q=&f= 변환 + lazy/decoding 기본값.
 * LCP 후보는 loading="eager" fetchPriority="high" critical 로 넘긴다.
 */
function ContentImage({
  src,
  width,
  quality,
  format,
  loading = "lazy",
  fetchPriority,
  critical = false,
  alt = "",
  ...rest
}) {
  if (!src) return null;

  const optimizedSrc = width
    ? optimizeMediaUrl(src, { width, quality, format })
    : src;

  return (
    <img
      src={optimizedSrc}
      alt={alt}
      loading={loading}
      decoding="async"
      fetchPriority={fetchPriority}
      data-loading-critical={critical ? "true" : undefined}
      {...rest}
    />
  );
}

export default ContentImage;
