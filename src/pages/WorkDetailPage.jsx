import { useEffect, useRef } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import WorksFilters from "../components/WorksFilters";
import projectArrow from "../assets/designer-work-arrow.png";
import {
  getWorkById,
  workCategories,
  workWorlds,
} from "../data/works";
import "../works.css";
import "../work-detail.css";

function GalleryImage({ image }) {
  return (
    <div className="work-detail-gallery-image">
      {image.src ? <img src={image.src} alt={image.alt} /> : null}
    </div>
  );
}

function WorkDetailPage() {
  const pageRef = useRef(null);
  const navigate = useNavigate();
  const { workId } = useParams();
  const work = getWorkById(workId);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return undefined;

    const elements = [...page.querySelectorAll("[data-work-detail-reveal]")];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.01, rootMargin: "0px 0px -5% 0px" },
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [workId]);

  if (!work) return <Navigate to="/works" replace />;

  const goToFilteredWorks = (key, value) => {
    const params = new URLSearchParams();
    if (value !== "all") params.set(key, value);
    const query = params.toString();
    navigate(query ? `/works?${query}` : "/works");
  };

  return (
    <main className="work-detail-page" ref={pageRef}>
      <Header />

      <div className="work-detail-content">
        <WorksFilters
          categories={workCategories}
          category="all"
          onCategoryChange={(value) =>
            goToFilteredWorks("category", value)
          }
          onWorldChange={(value) => goToFilteredWorks("world", value)}
          world="all"
          worlds={workWorlds}
        />

        <section className="work-detail-layout">
          <aside className="work-detail-sidebar">
            <div className="work-detail-sidebar-inner">
              <div className="work-detail-heading" data-work-detail-reveal>
                <div>
                  <h1>{work.title}</h1>
                  <p>{work.detail.categoryLabel}</p>
                </div>
                <Link to={`/designers/${work.designer.id}`}>
                  {work.designer.name}
                </Link>
              </div>

              <div
                className="work-detail-description"
                data-work-detail-reveal
              >
                <p>{work.detail.descriptionKo}</p>
                <p>{work.detail.descriptionEn}</p>
              </div>

              <div
                className="work-detail-related"
                data-work-detail-reveal
              >
                {work.detail.relatedProjects.map((project) => (
                  <Link
                    className="related-project"
                    to={`/works/${project.workId}`}
                    key={project.id}
                  >
                    <div className="related-project__thumbnail">
                      {project.thumbnail ? (
                        <img src={project.thumbnail} alt={project.title} />
                      ) : null}
                      <img
                        className="related-project__arrow"
                        src={projectArrow}
                        alt=""
                      />
                    </div>
                    <div>
                      <h2>{project.title}</h2>
                      <p>{project.categoryLabel}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          <div className="work-detail-gallery">
            {work.detail.gallery.map((row) => (
              <div
                className={`work-detail-gallery-row work-detail-gallery-row--${row.layout}`}
                data-work-detail-reveal
                key={row.id}
              >
                {row.images.map((image) => (
                  <GalleryImage image={image} key={image.alt} />
                ))}
              </div>
            ))}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}

export default WorkDetailPage;
