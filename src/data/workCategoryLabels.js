import { categoryLabels, workCategories } from "./works";

export const PRIMARY_WORK_CATEGORY_IDS = workCategories
  .slice(1)
  .map((category) => category.id);

export function getDefaultWorkCategoryLabelMap() {
  return Object.fromEntries(
    workCategories.slice(1).map(({ id, label }) => [
      id,
      { ko: categoryLabels[id], en: label },
    ]),
  );
}

export function resolveWorkCategoryLabelMap(data) {
  const defaults = getDefaultWorkCategoryLabelMap();
  const stored = data?.categories;
  if (!stored || typeof stored !== "object") return defaults;

  return Object.fromEntries(
    PRIMARY_WORK_CATEGORY_IDS.map((id) => {
      const entry = stored[id];
      const ko =
        typeof entry?.ko === "string" && entry.ko.trim()
          ? entry.ko.trim()
          : defaults[id].ko;
      const en =
        typeof entry?.en === "string" && entry.en.trim()
          ? entry.en.trim()
          : defaults[id].en;

      return [id, { ko, en }];
    }),
  );
}

export function buildWorkCategoryFilters(labelMap) {
  return [
    { id: "all", label: "ALL" },
    ...PRIMARY_WORK_CATEGORY_IDS.map((id) => ({
      id,
      label: labelMap[id].en,
    })),
  ];
}

export function getKoreanCategoryLabels(labelMap) {
  return Object.fromEntries(
    PRIMARY_WORK_CATEGORY_IDS.map((id) => [id, labelMap[id].ko]),
  );
}

export function getEnglishCategoryLabels(labelMap) {
  return Object.fromEntries(
    PRIMARY_WORK_CATEGORY_IDS.map((id) => [id, labelMap[id].en]),
  );
}
