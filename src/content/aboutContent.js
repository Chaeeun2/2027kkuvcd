import createCachedLoader from "./cachedLoader";
import { workWorlds } from "../data/works";
import { assetImage } from "./defaultAssets";
import { fetchFirestoreDocument } from "./firestoreRest";
import { bilingual, image, isText, list, text } from "./normalize";

export const ABOUT_DOCUMENT_PATH = "pages/about";

const worlds = workWorlds.slice(1);

export const defaultAboutContent = {
  backgrounds: [1, 2, 3, 4].map((n) => assetImage(`about/background-${n}`)),
  introImage: assetImage("about/intro"),
  subtitle: {
    ko: "2027 건국대학교 디자인대학교\n시각영상디자인학과 시각트랙\n졸업전시회",
    en: "2027 Konkuk University Visual Communication & Media Design\nGraduation Exhibition",
  },
  body: {
    ko: "이번 졸업 전시 ‘HELLO WORLD’는 지난 4년간 우리가 치열하게 고민하며 쌓아온 시간과 경험이 학교라는 훈련장을 떠나 비로소 사회라는 수취인에게 전달되는 첫 번째 인사를 의미합니다. 우리가 보낸 시간은 각자의 가치를 담아 정성껏 포장되어 달려온 기나긴 운송의 과정이며, 이번 전시장은 그 여정이 마침내 세상과 마주하는 도착지이자 상자를 열고 더 넓은 세계로 나아가는 새로운 여정의 시작점입니다. 즉, 전시는 단순히 4년의 마침표를 찍는 결과보고가 아니라, 우리의 작품이라는 상자가 사람들에게 전달되어 새로운 이야기가 시작되는 설레는 첫 만남입니다.",
    en: "‘HELLO WORLD’ marks our first greeting to the world, as four years of ideas and experiences leave the training ground of school and are finally delivered to society. Our time together has been a long journey, carefully packed with our own values. This exhibition is both its destination and a new starting point, where we open the box and step into a wider world. More than the end of four years, it is our first encounter with the world—the moment our work is delivered and a new story begins.",
  },
  instagram: {
    label: "@2027kkuvcd",
    url: "https://www.instagram.com/2027kkuvcd",
  },
  date: "2026.10.30-11.02",
  exhibitionTitle: {
    ko: "2027 건국대학교 디자인대학\n시각영상디자인학과 시각트랙\n졸업전시회",
    en: "2027 Konkuk University\nVisual Communication & Media Design\n(Track VCD) Graduation Exhibition",
  },
  hours: "Fri-Sun 10:00 - 18:00\nMon 10:00 - 17:00",
  venue: {
    ko: "서울특별시 종로구 대학로 57\n홍익대학교 대학로 아트센터\nB2 제 3전시장",
    en: "7, Daehak-ro, Jongno-gu,\nSeoul, Republic of Korea,\nB2 Exhibition Hall 3",
  },
  gallery: [1, 2, 3, 4, 5].map((n) => assetImage(`about/gallery-${n}`)),
  contributorImage: assetImage("about/contributor"),
  committee: [
    ["위원장", "이청경"],
    ["부위원장", "김서영"],
    ["총무", "이승민"],
    ["기획", "고서연 최예은"],
    ["디자인", "김현준 이은빈"],
    ["도록", "이청경"],
    ["웹", "이승민 이청경"],
    ["홍보", "김서영"],
  ].map(([role, name], index) => ({ id: `committee-${index}`, role, name })),
  facultyImage: assetImage("about/faculty"),
  faculty: [
    {
      title: "시각트랙",
      courses: [
        ["프로모션디자인", "박지은 교수님"],
        ["전공연구프로젝트(시각)", "김주연 교수님"],
        ["정보디자인프로젝트", "박지은 교수님"],
        ["실험디자인", "김주경 교수님"],
      ],
    },
    {
      title: "영상·디지털트랙",
      courses: [
        ["UIUX캡스톤디자인", "정혜경 교수님"],
        ["전공연구프로젝트(영상)", "박상권 교수님"],
        ["전공연구프로젝트(디지털)", "강일 교수님"],
        ["뉴미디어영상", "고이관 교수님"],
      ],
    },
  ].map(({ title, courses }, trackIndex) => ({
    id: `track-${trackIndex}`,
    title,
    courses: courses.map(([course, professor], index) => ({
      id: `track-${trackIndex}-course-${index}`,
      course,
      professor,
    })),
  })),
  supports: [1, 2, 3].map((n) => assetImage(`about/support-${n}`)),
  /* WORKS 페이지에서 World를 고르면 보이는 설명글. world id별 { ko, en } */
  worldDescriptions: Object.fromEntries(
    worlds.map(({ descriptionEn, descriptionKo, id }) => [
      id,
      { ko: descriptionKo, en: descriptionEn },
    ]),
  ),
};

/* DB 문서에 빠진 필드나 형식이 틀린 값은 기본 콘텐츠로 채운다. */
export function normalizeAboutContent(data) {
  const fallback = defaultAboutContent;
  if (!data) return fallback;

  return {
    backgrounds: list(data.backgrounds, image, fallback.backgrounds),
    introImage: image(data.introImage) ?? fallback.introImage,
    /* 한때 영문 문자열 하나로 저장한 문서가 있어 그 값은 영문으로 이어 쓴다. */
    subtitle: isText(data.subtitle)
      ? { ko: fallback.subtitle.ko, en: data.subtitle }
      : bilingual(data.subtitle, fallback.subtitle),
    body: bilingual(data.body, fallback.body),
    instagram: {
      label: text(data.instagram?.label, fallback.instagram.label),
      url: text(data.instagram?.url, fallback.instagram.url),
    },
    date: text(data.date, fallback.date),
    exhibitionTitle: bilingual(data.exhibitionTitle, fallback.exhibitionTitle),
    hours: text(data.hours, fallback.hours),
    venue: bilingual(data.venue, fallback.venue),
    gallery: list(data.gallery, image, fallback.gallery),
    contributorImage: image(data.contributorImage) ?? fallback.contributorImage,
    committee: list(
      data.committee,
      (item, index) => ({
        id: text(item?.id, `committee-${index}`),
        role: text(item?.role, ""),
        name: text(item?.name, ""),
      }),
      fallback.committee,
    ),
    facultyImage: image(data.facultyImage) ?? fallback.facultyImage,
    faculty: list(
      data.faculty,
      (track, trackIndex) => ({
        id: text(track?.id, `track-${trackIndex}`),
        title: text(track?.title, ""),
        courses: list(
          track?.courses,
          (item, index) => ({
            id: text(item?.id, `track-${trackIndex}-course-${index}`),
            course: text(item?.course, ""),
            professor: text(item?.professor, ""),
          }),
          [],
        ),
      }),
      fallback.faculty,
    ),
    supports: list(data.supports, image, fallback.supports),
    worldDescriptions: Object.fromEntries(
      worlds.map(({ id }) => [
        id,
        bilingual(data.worldDescriptions?.[id], fallback.worldDescriptions[id]),
      ]),
    ),
  };
}

export const {
  getCached: getCachedAboutContent,
  load: loadAboutContent,
} = createCachedLoader(
  () => fetchFirestoreDocument(ABOUT_DOCUMENT_PATH).then(normalizeAboutContent),
  defaultAboutContent,
);
