import { assetUrl } from "./assetUrl";
import { DEFAULT_CARD_BACK, defaultDesigners } from "../data/designers";
import createCachedLoader from "./cachedLoader";
import { resolveImageSrc } from "./defaultAssets";
import { queryFirestoreCollection } from "./firestoreRest";
import { image, text } from "./normalize";

const blueCardFront = assetUrl("idcard1-front.png");
const grayCardFront = assetUrl("idcard2-front.png");

export const DESIGNERS_COLLECTION = "designers";

/* 관리자 화면과 사이트가 같이 쓰는 디자이너 한 명의 저장 형태 */
export function normalizeDesigner(data) {
  return {
    koreanName: text(data?.koreanName, ""),
    englishName: text(data?.englishName, ""),
    cardFront: image(data?.cardFront),
    cardBack: image(data?.cardBack) ?? DEFAULT_CARD_BACK,
    profileImage: image(data?.profileImage),
    signatureImage: image(data?.signatureImage),
    email: text(data?.email, ""),
    instagram: text(data?.instagram, ""),
    statement: text(data?.statement, ""),
    order: Number.isFinite(data?.order) ? data.order : Date.now(),
  };
}

/*
 * 사이트 화면은 이미지 주소만 쓰므로 실제 주소로 풀어 둔다.
 * 카드 앞면 글자색은 목록 순서대로 파랑 카드용과 회색 카드용을 번갈아 쓰고,
 * 앞면 이미지를 올리지 않았으면 같은 순서로 기본 카드를 깐다.
 */
function toDesignerView(designer, index) {
  const colorScheme = index % 2 === 0 ? "blue" : "gray";
  const defaultFront = colorScheme === "blue" ? blueCardFront : grayCardFront;

  return {
    ...designer,
    colorScheme,
    frontImage: resolveImageSrc(designer.cardFront?.src) || defaultFront,
    backImage: resolveImageSrc(designer.cardBack.src),
    profileImage: resolveImageSrc(designer.profileImage?.src) ?? null,
    signatureImage: resolveImageSrc(designer.signatureImage?.src) ?? null,
  };
}

const defaultDesignerViews = defaultDesigners.map(toDesignerView);

/* 관리자 화면에서 디자이너를 아직 불러오지 않았으면 기본 목록을 쓴다. */
async function fetchDesigners() {
  const documents = await queryFirestoreCollection(DESIGNERS_COLLECTION);
  if (documents.length === 0) return defaultDesignerViews;

  return documents
    .map((document) => ({ ...normalizeDesigner(document), id: document.id }))
    .sort((a, b) => a.order - b.order)
    .map(toDesignerView);
}

export const { getCached: getCachedDesigners, load: loadDesigners } =
  createCachedLoader(fetchDesigners, defaultDesignerViews);
