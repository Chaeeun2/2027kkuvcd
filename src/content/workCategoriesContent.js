import {
  buildWorkCategoryFilters,
  getDefaultWorkCategoryLabelMap,
  resolveWorkCategoryLabelMap,
} from "../data/workCategoryLabels";
import createCachedLoader from "./cachedLoader";
import { fetchFirestoreDocument } from "./firestoreRest";

export const WORK_CATEGORIES_DOCUMENT_PATH = "pages/workCategories";

const defaultLabelMap = getDefaultWorkCategoryLabelMap();
const defaultFilters = buildWorkCategoryFilters(defaultLabelMap);

export function normalizeWorkCategoriesDocument(data) {
  const categories = resolveWorkCategoryLabelMap(data);
  return { categories };
}

async function fetchWorkCategoryLabelMap() {
  const data = await fetchFirestoreDocument(WORK_CATEGORIES_DOCUMENT_PATH);
  return resolveWorkCategoryLabelMap(data);
}

export const {
  getCached: getCachedWorkCategoryFilters,
  invalidate: invalidateWorkCategoryFilters,
  load: loadWorkCategoryFilters,
} = createCachedLoader(
  async () => buildWorkCategoryFilters(await fetchWorkCategoryLabelMap()),
  defaultFilters,
);

export function loadWorkCategoryLabelMap() {
  return fetchWorkCategoryLabelMap().catch(() => defaultLabelMap);
}
