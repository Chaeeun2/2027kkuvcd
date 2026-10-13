/* DB 문서는 관리자 화면에서 만들지만, 빠진 필드나 형식이 틀린 값에 대비해 읽을 때마다 다듬는다. */

export const isText = (value) => typeof value === "string";

export const text = (value, fallback) => (isText(value) ? value : fallback);

export const bilingual = (value, fallback) => ({
  ko: text(value?.ko, fallback.ko),
  en: text(value?.en, fallback.en),
});

/* 업로드 이미지는 { id, src, key }, 기본 이미지는 key가 null이다. */
export const image = (value) =>
  value && isText(value.src)
    ? {
        id: text(value.id, value.key ?? value.src),
        src: value.src,
        key: isText(value.key) ? value.key : null,
      }
    : null;

export const list = (value, mapItem, fallback) =>
  Array.isArray(value) ? value.map(mapItem).filter(Boolean) : fallback;
