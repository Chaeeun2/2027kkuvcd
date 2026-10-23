import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { resolveImageSrc } from "../content/defaultAssets";
import { IMAGE_SIZES, optimizeMediaUrl } from "../utils/optimizedImage";
import ContentImage from "./ContentImage";

const LOOP_SECONDS = 30;
const DRAG_CLICK_THRESHOLD = 6;

function normalizeOffset(offset, loopWidth) {
  if (loopWidth <= 0) return offset;

  let next = offset;
  while (next <= -loopWidth) next += loopWidth;
  while (next > 0) next -= loopWidth;
  return next;
}

function AboutGallery({ gallery }) {
  const images = useMemo(
    () => gallery.map((item) => resolveImageSrc(item.src)),
    [gallery],
  );
  const repeatedImages = useMemo(() => [...images, ...images], [images]);
  const trackRef = useRef(null);
  const offsetRef = useRef(0);
  const loopWidthRef = useRef(0);
  const dragRef = useRef({
    active: false,
    startX: 0,
    startOffset: 0,
  });
  const rafRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  const applyTransform = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    track.style.transform = `translate3d(${offsetRef.current}px, 0, 0)`;
  }, []);

  const measureLoop = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    loopWidthRef.current = track.scrollWidth / 2;
    offsetRef.current = normalizeOffset(offsetRef.current, loopWidthRef.current);
    applyTransform();
  }, [applyTransform]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduceMotion(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    images.forEach((src) => {
      const img = new Image();
      img.src = optimizeMediaUrl(src, { width: IMAGE_SIZES.aboutGallery });
    });
  }, [images]);

  useEffect(() => {
    measureLoop();
    const observer = new ResizeObserver(measureLoop);
    if (trackRef.current) observer.observe(trackRef.current);
    window.addEventListener("resize", measureLoop);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measureLoop);
    };
  }, [measureLoop, repeatedImages.length]);

  useEffect(() => {
    if (reduceMotion) return undefined;

    let lastTime = performance.now();
    const tick = (now) => {
      if (!dragRef.current.active && loopWidthRef.current > 0) {
        const delta = (now - lastTime) / 1000;
        const speed = loopWidthRef.current / LOOP_SECONDS;
        offsetRef.current -= speed * delta;
        offsetRef.current = normalizeOffset(
          offsetRef.current,
          loopWidthRef.current,
        );
        applyTransform();
      }
      lastTime = now;
      rafRef.current = window.requestAnimationFrame(tick);
    };

    rafRef.current = window.requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current);
    };
  }, [applyTransform, reduceMotion]);

  const handlePointerDown = (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;

    dragRef.current = {
      active: true,
      startX: event.clientX,
      startOffset: offsetRef.current,
    };
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event) => {
    if (!dragRef.current.active) return;

    const deltaX = event.clientX - dragRef.current.startX;
    if (Math.abs(deltaX) <= DRAG_CLICK_THRESHOLD) return;

    offsetRef.current = dragRef.current.startOffset + deltaX;
    applyTransform();
  };

  const finishDrag = (event) => {
    if (!dragRef.current.active) return;

    dragRef.current.active = false;
    setIsDragging(false);
    offsetRef.current = normalizeOffset(
      offsetRef.current,
      loopWidthRef.current,
    );
    applyTransform();

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <section
      className="about-gallery"
      aria-label="전시 준비 사진"
      data-reveal
    >
      <div
        className={`about-gallery-track${isDragging ? " is-dragging" : ""}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        ref={trackRef}
      >
        {repeatedImages.map((image, index) => (
          <div className="about-gallery-slide" key={`${image}-${index}`}>
            <ContentImage
              src={image}
              width={IMAGE_SIZES.aboutGallery}
              alt=""
              loading="eager"
              decoding="async"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default AboutGallery;
