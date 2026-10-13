import introImage from "../assets/about-main-img.jpg";
import gallery1 from "../assets/about-section3-img1.jpg";
import gallery2 from "../assets/about-section3-img2.jpg";
import gallery3 from "../assets/about-section3-img3.jpg";
import gallery4 from "../assets/about-section3-img4.jpg";
import gallery5 from "../assets/about-section3-img5.jpg";
import support1 from "../assets/about-section5-img1.png";
import support2 from "../assets/about-section5-img2.png";
import support3 from "../assets/about-section5-img3.png";
import seungminProfile from "../assets/designer-1-profile.jpg";
import seungminSign from "../assets/designer-1-sign.png";
import cardBack from "../assets/idcard1-back.png";

/*
 * 빌드에 포함된 기본 이미지는 파일명에 해시가 붙어 빌드마다 주소가 바뀐다.
 * 그래서 DB에는 "asset:이름"으로 저장하고 화면에서 실제 주소로 바꾼다.
 */
const ASSET_PREFIX = "asset:";

const defaultAssets = {
  "about/intro": introImage,
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
