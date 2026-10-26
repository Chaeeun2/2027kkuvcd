import { defaultDesigners } from "../data/designers";
import {
  categoryLabels,
  legacyWorkCategoryIds,
  placeholderWorks,
  workWorlds,
} from "../data/works";
import createCachedLoader from "./cachedLoader";
import { loadDesigners } from "./designersContent";
import { queryFirestoreCollection } from "./firestoreRest";
import { bilingual, image, isText, text } from "./normalize";

export const WORKS_COLLECTION = "works";

const categoryIds = new Set(Object.keys(categoryLabels));
const worldIds = new Set(workWorlds.slice(1).map((world) => world.id));

const normalizeCategoryIds = (value, known) => {
  if (!Array.isArray(value)) return [];

  const ids = value.map((id) => legacyWorkCategoryIds[id] ?? id);
  return [...new Set(ids.filter((id) => known.has(id)))];
};

/* 예전 문서는 { layout, images } 줄 단위라 줄 안의 이미지를 순서대로 펼친다. */
function normalizeGallery(value) {
  if (!Array.isArray(value)) return [];
  return value
    .flatMap((item) => (Array.isArray(item?.images) ? item.images : [item]))
    .map(image)
    .filter(Boolean);
}

/* 관리자 화면과 사이트가 같이 쓰는 작품 한 개의 저장 형태 */
export function normalizeWork(data) {
  return {
    title: text(data?.title, ""),
    designerIds: Array.isArray(data?.designerIds) ? data.designerIds.filter(isText) : [],
    thumbnail: image(data?.thumbnail),
    categoryIds: normalizeCategoryIds(data?.categoryIds, categoryIds),
    worldType: worldIds.has(data?.worldType) ? data.worldType : "",
    description: bilingual(data?.description, { ko: "", en: "" }),
    gallery: normalizeGallery(data?.gallery),
    order: Number.isFinite(data?.order) ? data.order : Date.now(),
    published: data?.published === true,
  };
}

/*
 * 화면에 쓰기 좋게 디자이너 이름과 카테고리 이름을 붙인다.
 * 삭제된 디자이너는 작품에서 빠진다.
 */
function toWorkView(id, work, designersById) {
  const designerIds = work.designerIds.filter((designerId) => designersById.has(designerId));

  return {
    ...work,
    id,
    designerIds,
    designers: designerIds.map((designerId) => ({
      id: designerId,
      name: designersById.get(designerId).koreanName,
    })),
    categoryLabel: work.categoryIds.map((categoryId) => categoryLabels[categoryId]).join(" · "),
  };
}

const toDesignerMap = (designers) =>
  new Map(designers.map((designer) => [designer.id, designer]));

const placeholderWorkViews = placeholderWorks.map((work) =>
  toWorkView(work.id, work, toDesignerMap(defaultDesigners)),
);

async function fetchPublishedWorks() {
  const [designers, documents] = await Promise.all([
    loadDesigners(),
    queryFirestoreCollection(WORKS_COLLECTION, {
      where: { field: "published", value: true },
    }),
  ]);
  const designersById = toDesignerMap(designers);
  if (documents.length === 0) {
    return placeholderWorks.map((work) => toWorkView(work.id, work, designersById));
  }

  return documents
    .map((document) => toWorkView(document.id, normalizeWork(document), designersById))
    .sort((a, b) => a.order - b.order);
}

export const { getCached: getCachedWorks, load: loadWorks } = createCachedLoader(
  fetchPublishedWorks,
  placeholderWorkViews,
);

export function getWorksByDesignerId(works, designerId) {
  return works.filter((work) => work.designerIds.includes(designerId));
}

/* 같은 디자이너의 다른 작품 */
export function getRelatedWorks(works, work) {
  return works.filter(
    (item) =>
      item.id !== work.id &&
      item.designerIds.some((designerId) => work.designerIds.includes(designerId)),
  );
}
