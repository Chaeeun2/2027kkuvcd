export const LOADING_REVEAL_DELAY_MS = 900;

/*
 * 로딩 화면이 떠 있는 동안 페이지 등장 애니메이션을 붙잡아 둔다.
 * 로딩 화면이 놓아 주면 대기 중이던 애니메이션이 한꺼번에 시작된다.
 */
let isHolding = false;
const waitingStarts = new Set();
const releaseListeners = new Set();

export function holdReveal() {
  isHolding = true;
}

export function releaseReveal() {
  isHolding = false;
  const starts = [...waitingStarts];
  waitingStarts.clear();
  starts.forEach((start) => start());
  releaseListeners.forEach((listener) => listener());
}

export function onRevealReleased(listener) {
  releaseListeners.add(listener);
  return () => releaseListeners.delete(listener);
}

export function scheduleReveal(callback, delay = 0) {
  let timer = null;
  const start = () => {
    timer = window.setTimeout(callback, delay);
  };

  if (isHolding) waitingStarts.add(start);
  else start();

  return () => {
    waitingStarts.delete(start);
    if (timer !== null) window.clearTimeout(timer);
  };
}
