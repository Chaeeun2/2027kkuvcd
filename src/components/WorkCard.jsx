import { Link } from "react-router-dom";

function WorkCard({ index, work }) {
  return (
    <Link
      className="work-card"
      data-work-reveal
      data-reveal-delay={(index % 4) * 80}
      to={`/works/${work.id}`}
    >
      <div className="work-card__thumbnail">
        {work.thumbnail ? (
          <img
            className="work-card__image"
            src={work.thumbnail}
            alt={`${work.title} 작품`}
          />
        ) : null}
      </div>

      <div className="work-card__copy">
        <h2>{work.title}</h2>
        <p>{work.designer.name}</p>
      </div>
    </Link>
  );
}

export default WorkCard;
