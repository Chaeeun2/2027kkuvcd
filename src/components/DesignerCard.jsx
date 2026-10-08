import { Link } from "react-router-dom";
import { formatEnglishName, getDesignerDetail } from "../data/designers";

function DesignerCard({ designer, isMobile = false }) {
  const { backImage, colorScheme, englishName, frontImage, id, koreanName } =
    designer;

  const commonProps = {
    "aria-label": `${koreanName}, ${englishName} 디자이너 상세 보기`,
    "data-designer-card": true,
    to: `/designers/${id}`,
  };

  /*
   * 모바일 시안은 아이디카드가 아니라 세로 프로필 사진을 깔고 이름을 카드 밖
   * 아래에 둔다. 뒤집히지도 않으므로 뒷면 이미지를 받지 않도록 구조를 따로 쓴다.
   */
  if (isMobile) {
    const { profileImage } = getDesignerDetail(designer);

    return (
      <Link className="designer-card designer-card--portrait" {...commonProps}>
        <div className="designer-card__photo">
          {profileImage ? (
            <img src={profileImage} alt="" />
          ) : (
            <span>PROFILE IMAGE</span>
          )}
        </div>

        <p className="designer-card__korean-name">{koreanName}</p>
        <p className="designer-card__english-name">
          {formatEnglishName(englishName)}
        </p>
      </Link>
    );
  }

  return (
    <Link className="designer-card" {...commonProps}>
      <div className="designer-card__inner">
        <div
          className={`designer-card__face designer-card__front designer-card__front--${colorScheme}`}
        >
          <img src={frontImage} alt="" />
          <div className="designer-card__front-body">
            <p className="designer-card__korean-name">{koreanName}</p>
            <p className="designer-card__english-name">{englishName}</p>
          </div>
        </div>

        <div
          className="designer-card__face designer-card__back"
          aria-hidden="true"
        >
          <img src={backImage} alt="" />
        </div>
      </div>
    </Link>
  );
}

export default DesignerCard;
