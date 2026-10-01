import { getWorkById } from "./works";

export const WORKS_PER_DESIGNER = 3;

// 각 디자이너에게 연결할 작품 ID 3개를 순서대로 관리합니다.
// 작품 ID는 designer-{번호}-project-{1~3} 규칙을 사용합니다.
export const designerWorkIds = Object.fromEntries(
  Array.from({ length: 38 }, (_, index) => {
    const designerId = `designer-${index + 1}`;
    const workIds = Array.from(
      { length: WORKS_PER_DESIGNER },
      (__, projectIndex) =>
        `${designerId}-project-${projectIndex + 1}`,
    );

    return [designerId, workIds];
  }),
);

export function getWorkIdsByDesignerId(designerId) {
  return designerWorkIds[designerId] ?? [];
}

export function getWorksByDesignerId(designerId) {
  return getWorkIdsByDesignerId(designerId)
    .map((workId) => getWorkById(workId))
    .filter(Boolean);
}
