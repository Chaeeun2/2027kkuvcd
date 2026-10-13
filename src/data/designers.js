import { assetImage } from "../content/defaultAssets";

/*
 * 관리자 화면에서 디자이너를 처음 불러올 때 DB에 넣는 기본 목록이자,
 * DB를 읽지 못했을 때 사이트가 대신 보여 주는 목록이다.
 * 작품이 디자이너를 id로 가리키므로 id는 바꾸지 않는다.
 */
const names = [
  ["고서연", "SEOYEON GO"],
  ["금시찬", "SICHAN GEUM"],
  ["김경화", "GYEONGHWA KIM"],
  ["김다민", "DAMIN KIM"],
  ["김민주", "MINJU KIM"],
  ["김서영", "SEOYEONG KIM"],
  ["김예린", "YERIN KIM"],
  ["김은혜", "EUNHYE KIM"],
  ["김지언", "JIEON KIM"],
  ["김채원", "CHAEWON KIM"],
  ["김태희", "TAEHEE KIM"],
  ["김현준", "HYEONJUN KIM"],
  ["김현진", "HYEONJIN KIM"],
  ["리티앤이", "TIANE LI"],
  ["박민경", "MINGYEONG PARK"],
  ["박연주", "YEONJU PARK"],
  ["서이준", "IJUN SEO"],
  ["안소연", "SOYEON AN"],
  ["야오딩쿤", "DINGKUN YAO"],
  ["양양", "YANG YANG"],
  ["엄민선", "MINSEON EOM"],
  ["왕예스위", "YESIWEI WANG"],
  ["윤예지", "YEJI YOON"],
  ["이나경", "NAGYEONG LEE"],
  ["이민영", "MINYEONG LEE"],
  ["이승민", "SEUNGMIN LEE"],
  ["이연재", "YEONJAE LEE"],
  ["이은빈", "EUNBIN LEE"],
  ["이지민", "JIMIN LEE"],
  ["이청경", "CHEONGGYEONG LEE"],
  ["임현지", "HYEONJI LIM"],
  ["장다영", "DAYEONG JANG"],
  ["최나래", "NARAE CHOI"],
  ["최신우", "SINU CHOI"],
  ["최예은", "YEEUN CHOI"],
  ["최효림", "HYORIM CHOI"],
  ["허쥔페이", "JUNFEI HE"],
  ["하지원", "JIWON HA"],
];

const details = {
  "designer-26": {
    email: "xxeungmin@gmail.com",
    instagram: "@leekitadg",
    profileImage: assetImage("designers/designer-26-profile"),
    signatureImage: assetImage("designers/designer-26-sign"),
    statement:
      "일상에서 쉽게 지나치는 장면과 요소를 관찰하고, 그 안에서 새로운 시각적 가능성을 발견하는 것에 관심이 있습니다. 익숙하고 평범한 것이라도 바라보는 방식에 따라 새로운 의미와 경험을 만들어낼 수 있다고 생각합니다. 관찰과 탐색을 통해 발견한 요소를 나만의 시각으로 해석하고, 그래픽과 편집, 브랜딩 등 다양한 방식으로 재구성하며 작업을 발전시켜 나갑니다. 정해진 하나의 방식이나 분야에 머무르기보다 새로운 매체와 표현 방식을 직접 경험하고 시도하는 과정을 중요하게 생각하며, 앞으로도 다양한 가능성을 탐색하면서 나만의 시각과 작업 방식을 만들어가는 디자이너가 되고 싶습니다.",
  },
};

export const DEFAULT_CARD_BACK = assetImage("designers/card-back");

export const defaultDesigners = names.map(([koreanName, englishName], index) => {
  const id = `designer-${index + 1}`;

  return {
    id,
    koreanName,
    englishName,
    cardFront: null,
    cardBack: DEFAULT_CARD_BACK,
    profileImage: null,
    signatureImage: null,
    email: "",
    instagram: "",
    statement: "",
    order: index,
    ...details[id],
  };
});

// 데이터는 "SEUNGMIN LEE" 처럼 전부 대문자라 표시용으로만 다듬는다.
export function formatEnglishName(englishName) {
  return englishName.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}
