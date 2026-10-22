import { assetUrl } from "./assetUrl";

const introImage = assetUrl("about-main-img.jpg");
const contributorImage = assetUrl("about-section4-img.png");
const facultyImage = assetUrl("about-section5-img.jpg");
const background1 = assetUrl("about-section1-bg01.jpg");
const background2 = assetUrl("about-section1-bg02.jpg");
const background3 = assetUrl("about-section1-bg03.jpg");
const background4 = assetUrl("about-section1-bg04.jpg");
const gallery1 = assetUrl("about-section3-img1.jpg");
const gallery2 = assetUrl("about-section3-img2.jpg");
const gallery3 = assetUrl("about-section3-img3.jpg");
const gallery4 = assetUrl("about-section3-img4.jpg");
const gallery5 = assetUrl("about-section3-img5.jpg");
const support1 = assetUrl("about-section5-img1.png");
const support2 = assetUrl("about-section5-img2.png");
const support3 = assetUrl("about-section5-img3.png");
const seungminProfile = assetUrl("designer-1-profile.jpg");
const seungminSign = assetUrl("designer-1-sign.png");
const cardBack = assetUrl("idcard1-back.png");

/*
 * 기본 이미지 주소에는 내용 해시가 붙어 파일을 바꾸면 주소도 바뀐다.
 * 그래서 DB에는 "asset:이름"으로 저장하고 화면에서 실제 주소로 바꾼다.
 */
const ASSET_PREFIX = "asset:";

const defaultAssets = {
  "about/intro": introImage,
  "about/contributor": contributorImage,
  "about/faculty": facultyImage,
  "about/background-1": background1,
  "about/background-2": background2,
  "about/background-3": background3,
  "about/background-4": background4,
  "about/gallery-1": gallery1,
  "about/gallery-2": gallery2,
  "about/gallery-3": gallery3,
  "about/gallery-4": gallery4,
  "about/gallery-5": gallery5,
  "about/support-1": support1,
  "about/support-2": support2,
  "about/support-3": support3,
  "designers/card-back": cardBack,
  "designers/designer-26-profile": seungminProfile,
  "designers/designer-26-sign": seungminSign,
};

/* DB 이미지 값과 같은 { id, src, key } 형태의 기본 이미지. key가 없어 R2에서 지우지 않는다. */
export function assetImage(name) {
  return { id: name, src: `${ASSET_PREFIX}${name}`, key: null };
}

export function resolveImageSrc(src) {
  if (!src?.startsWith(ASSET_PREFIX)) return src;
  return defaultAssets[src.slice(ASSET_PREFIX.length)] ?? "";
}
