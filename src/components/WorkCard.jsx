import { Link } from "react-router-dom";

function WorkCard({ work }) {
  return (
    <Link
      className="work-card"
      data-work-reveal
      to={`/works/${work.id}`}
    >
      <div className="work-card__thumbnail">
        {work.thumbnail ? (
          <img
            className="work-card__image"
            src={work.thumbnail.src}
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
