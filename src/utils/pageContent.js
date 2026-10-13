/*
 * 페이지가 원격 콘텐츠를 기다리는 동안 로딩 화면이 이미지 검사를 미루도록
 * 붙잡아 둔다. 콘텐츠가 그려지면 로딩 화면이 그때 이미지·영상을 센다.
 */
let holdCount = 0;
const readyListeners = new Set();

export function holdPageContent() {
  holdCount += 1;
  let isReleased = false;

  return () => {
    if (isReleased) return;
    isReleased = true;
    holdCount -= 1;
    if (holdCount > 0) return;

    const listeners = [...readyListeners];
    readyListeners.clear();
    listeners.forEach((listener) => listener());
  };
}

export function isPageContentPending() {
  return holdCount > 0;
}

export function onPageContentReady(listener) {
  readyListeners.add(listener);
  return () => readyListeners.delete(listener);
}
