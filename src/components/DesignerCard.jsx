import { Link } from "react-router-dom";

function DesignerCard({ designer, index }) {
  const { backImage, colorScheme, englishName, frontImage, id, koreanName } =
    designer;

  return (
    <Link
      className="designer-card"
      aria-label={`${koreanName}, ${englishName} 디자이너 상세 보기`}
      data-designer-card
      style={{ "--card-reveal-delay": `${(index % 3) * 80}ms` }}
      to={`/designers/${id}`}
    >
      <div className="designer-card__inner">
        <div
          className={`designer-card__face designer-card__front designer-card__front--${colorScheme}`}
        >
          <img src={frontImage} alt="" />
          <p className="designer-card__korean-name">{koreanName}</p>
          <p className="designer-card__english-name">{englishName}</p>
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
