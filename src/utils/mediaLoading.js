export function isMediaReady(element) {
  if (element instanceof HTMLVideoElement) {
    return (
      element.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA ||
      element.error !== null
    );
  }

  return element.complete;
}

/*
 * 로딩 화면은 첫 화면에 보이는·lazy가 아닌 이미지만 기다린다.
 * 그리드 썸네일 등 lazy 이미지는 스크롤 시 로드되므로 전체 대기하지 않는다.
 */
export function isCriticalMedia(element) {
  if (element instanceof HTMLVideoElement) return true;
  if (element.loading === "lazy") return false;
  if (element.getAttribute("data-loading-critical") === "true") return true;

  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;

  const viewportBottom = window.innerHeight * 1.05;
  return rect.top < viewportBottom && rect.bottom > 0;
}

export function collectCriticalMedia(root = document) {
  return [...root.querySelectorAll("main img, main video")].filter(isCriticalMedia);
}
