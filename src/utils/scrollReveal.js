import { onRevealReleased, scheduleReveal } from "./loadingReveal";

/*
 * IntersectionObserver는 OS·브라우저마다 threshold·rootMargin 해석이 달라
 * 가끔 교차 이벤트가 누락된다. threshold 0 + 주기적 flush로 보완한다.
 */
export const REVEAL_OBSERVER_OPTIONS = {
  root: null,
  rootMargin: "0px 0px 0px 0px",
  threshold: [0, 0.01, 0.05, 0.1],
};

export function isInRevealViewport(element, { bottomInset = 0 } = {}) {
  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;

  const viewportBottom = window.innerHeight - bottomInset;
  return rect.bottom > 0 && rect.top < viewportBottom;
}

export function scheduleVisibleClass(element, delay = 0) {
  return scheduleReveal(() => {
    element.classList.add("is-visible");
  }, delay);
}

/**
 * @param {object} config
 * @param {Element[]} config.elements
 * @param {(element: Element) => (void | (() => void))} config.reveal
 * @param {(element: Element) => boolean} [config.shouldObserve]
 * @param {IntersectionObserverInit} [config.observerOptions]
 * @param {(element: Element) => boolean} [config.shouldFlush]
 * @param {boolean} [config.useIntersectionObserver]
 */
export function bindScrollReveal({
  elements,
  reveal,
  shouldObserve = () => true,
  observerOptions = REVEAL_OBSERVER_OPTIONS,
  shouldFlush = (element) => isInRevealViewport(element),
  useIntersectionObserver = true,
}) {
  const observed = new Set();
  const pendingCancels = new Set();

  const trigger = (element) => {
    if (element.classList.contains("is-visible")) {
      observed.delete(element);
      return;
    }

    const cancel = reveal(element);
    if (typeof cancel === "function") pendingCancels.add(cancel);
    observed.delete(element);
  };

  const observer = useIntersectionObserver
    ? new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          trigger(entry.target);
          observer.unobserve(entry.target);
        });
      }, observerOptions)
    : null;

  elements.forEach((element) => {
    if (!shouldObserve(element)) return;
    if (element.classList.contains("is-visible")) return;

    observed.add(element);
    observer?.observe(element);
  });

  const flush = () => {
    [...observed].forEach((element) => {
      if (!shouldFlush(element)) return;

      trigger(element);
      observer?.unobserve(element);
    });
  };

  const runFlush = () => {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(flush);
    });
  };

  runFlush();
  const removeReleaseListener = onRevealReleased(runFlush);
  window.addEventListener("scroll", flush, { passive: true });
  window.addEventListener("resize", flush);

  return () => {
    observer?.disconnect();
    removeReleaseListener();
    window.removeEventListener("scroll", flush);
    window.removeEventListener("resize", flush);
    pendingCancels.forEach((cancel) => cancel());
  };
}
