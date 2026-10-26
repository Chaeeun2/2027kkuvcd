import { defaultDesigners } from "./designers";

export const workCategories = [
  { id: "all", label: "ALL" },
  { id: "branding", label: "BRANDING" },
  { id: "media", label: "MEDIA" },
  { id: "editorial", label: "EDITORIAL" },
  { id: "installation", label: "INSTALLATION" },
];

/** 예전 카테고리 id → 현재 id (URL·저장 데이터 호환) */
export const legacyWorkCategoryIds = {
  experiment: "installation",
};

export const workWorlds = [
  { id: "all", label: "All" },
  {
    id: "my-world",
    label: "My World",
    descriptionKo:
      "나의 내면과 감각, 경험에서 출발해 스스로의 세계를 탐구합니다. 개인의 기억과 취향, 정체성을 관찰하고 자신만의 시각 언어로 표현하며, 가장 개인적인 이야기에서 새로운 가능성을 발견합니다.",
    descriptionEn:
      "We begin with our own senses, memories, and experiences. By observing our identity and personal perspective, we shape an individual visual language and discover new possibilities within the stories closest to us.",
  },
  {
    id: "your-world",
    label: "Your World",
    descriptionKo:
      "우리가 마주한 세계를 관찰하고, 더 나은 방향을 고민합니다. 환경과 안전, 사회와 공동체 등 현실 속 문제를 발견하고 디자인의 시선으로 바라봅니다. 우리의 생각과 제안이 세상에 닿아 작은 변화를 만들어가기를 바라며, 더 나은 삶과 사회를 향한 메시지를 전합니다.",
    descriptionEn:
      "We observe the world around us and imagine how it could be better. Through design, we explore issues of the environment, safety, society, and community. We send our ideas into the world, hoping they can inspire small changes and contribute to a better way of living together.",
  },
  {
    id: "new-world",
    label: "New World",
    descriptionKo:
      "기존의 경계를 넘어 새로운 방식과 가능성을 상상합니다. 낯선 기술과 매체, 실험적인 표현을 통해 아직 존재하지 않는 경험을 제안하고 앞으로 펼쳐질 세계의 모습을 탐색합니다.",
    descriptionEn:
      "We imagine possibilities beyond familiar boundaries. Through emerging media, technology, and experimental expression, we propose experiences that do not yet exist and explore the worlds that may unfold ahead.",
  },
  {
    id: "re-world",
    label: "Re World",
    descriptionKo:
      "익숙한 대상과 이미지를 다시 바라보고 새롭게 해석합니다. 이미 존재하는 것의 맥락과 의미를 재구성하며, 다른 관점과 방식으로 이어지는 새로운 관계를 만들어갑니다.",
    descriptionEn:
      "We revisit familiar objects and images from a different perspective. By rearranging their contexts and meanings, we create new relationships and reveal alternative ways of seeing what already exists.",
  },
];

/* 작품 상세와 디자이너 페이지에 보이는 카테고리 이름 */
export const categoryLabels = {
  branding: "브랜딩",
  media: "미디어",
  editorial: "편집",
  installation: "설치",
};

const categoryIds = Object.keys(categoryLabels);
const worldIds = workWorlds.slice(1).map((world) => world.id);

/* 이미지가 없는 자리표시 칸. src가 없으면 상세 페이지에 빈 상자로 보인다. */
const placeholderGallery = [1, 2, 3, 4].map((number) => ({
  id: `gallery-${number}`,
  src: null,
}));

/* 관리자 화면에서 공개한 작품이 하나도 없을 때 보여 주는 자리표시 작품 */
export const placeholderWorks = defaultDesigners.flatMap((designer, designerIndex) =>
  [1, 2, 3].map((projectNumber, projectIndex) => {
    const title = `Project${projectNumber}`;
    const offset = designerIndex + projectIndex;

    return {
      id: `${designer.id}-project-${projectNumber}`,
      title,
      designerIds: [designer.id],
      thumbnail: null,
      categoryIds: [categoryIds[offset % categoryIds.length]],
      worldType: worldIds[offset % worldIds.length],
      description: {
        ko: `${title}의 프로젝트 설명입니다. 실제 작품 소개가 준비되면 이 내용을 수정해 주세요.`,
        en: `This is the description for ${title}. Replace this text when the final project description is ready.`,
      },
      gallery: placeholderGallery,
      order: designerIndex * 3 + projectIndex,
      published: true,
    };
  }),
);
