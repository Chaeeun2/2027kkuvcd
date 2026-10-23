import { Link } from "react-router-dom";
import ContentImage from "./ContentImage";
import { IMAGE_SIZES } from "../utils/optimizedImage";

function WorkCard({ work }) {
  return (
    <Link
      className="work-card"
      data-work-reveal
      to={`/works/${work.id}`}
    >
      <div className="work-card__thumbnail">
        {work.thumbnail ? (
          <ContentImage
            className="work-card__image"
            src={work.thumbnail.src}
            width={IMAGE_SIZES.workCard}
            alt={`${work.title} 작품`}
          />
        ) : null}
      </div>

      <div className="work-card__copy">
        <h2>{work.title}</h2>
        <p>{work.designers.map((designer) => designer.name).join(", ")}</p>
      </div>
    </Link>
  );
}

export default WorkCard;
