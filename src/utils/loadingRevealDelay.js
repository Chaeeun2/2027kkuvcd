export const LOADING_REVEAL_DELAY_MS = 900;

export function getLoadingRevealDelay() {
  return document.querySelector(".loading-screen")
    ? LOADING_REVEAL_DELAY_MS
    : 0;
}
