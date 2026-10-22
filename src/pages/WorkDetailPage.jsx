import { Fragment, useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { assetUrl } from "../content/assetUrl";
import Footer from "../components/Footer";
import Header from "../components/Header";
import LanguageToggle from "../components/LanguageToggle";
import WorksFilters from "../components/WorksFilters";
import usePageContent from "../content/usePageContent";
import {
  getCachedWorks,
  getRelatedWorks,
  loadWorks,
} from "../content/worksContent";
import useIsMobile from "../hooks/useIsMobile";
import { workCategories, workWorlds } from "../data/works";
import { scheduleReveal } from "../utils/loadingReveal";
import "../works.css";
import "../work-detail.css";

const projectArrow = assetUrl("designer-work-arrow.png");

function RelatedProject({ project }) {
  return (
    <Link className="related-project" to={`/works/${project.id}`}>
      <div className="related-project__thumbnail">
        {project.thumbnail?.src ? (
          <img src={project.thumbnail.src} alt={project.title} />
        ) : null}
        <img className="related-project__arrow" src={projectArrow} alt="" />
      </div>
      <div>
        <h2>{project.title}</h2>
        <p>{project.categoryLabel}</p>
      </div>
    </Link>
  );
}

function RelatedWorks({ relatedWorks, work }) {
  const isDualDesigner = work.designers.length === 2;

  if (!isDualDesigner) {
    return (
      <div className="work-detail-related">
        {relatedWorks.map((project) => (
          <RelatedProject key={project.id} project={project} />
        ))}
      </div>
    );
  }

  return (
    <div className="work-detail-related work-detail-related--grouped">
      {work.designers.map((designer) => {
        const projects = relatedWorks.filter((item) =>
          item.designerIds.includes(designer.id),
        );
        if (projects.length === 0) return null;

        return (
          <section className="work-detail-related-group" key={designer.id}>
            <h3 className="work-detail-related-name">{designer.name}</h3>
            <div className="work-detail-related-grid">
              {projects.map((project) => (
                <RelatedProject key={project.id} project={project} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function WorkDetailPage() {
  const works = usePageContent(getCachedWorks, loadWorks);
  if (!works) return <main className="work-detail-page" />;
  return <WorkDetailContent works={works} />;
}

function WorkDetailContent({ works }) {
  const pageRef = useRef(null);
  const isMobile = useIsMobile();
  const [language, setLanguage] = useState("ko");
  const navigate = useNavigate();
  const { workId } = useParams();
  const work = works.find((item) => item.id === workId);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return undefined;

    const elements = [...page.querySelectorAll("[data-work-detail-reveal]")];
    const pendingReveals = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const cancel = scheduleReveal(() => {
            entry.target.classList.add("is-visible");
            pendingReveals.delete(cancel);
          });

          pendingReveals.add(cancel);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.01, rootMargin: "0px 0px -5% 0px" },
    );

    elements.forEach((element) => observer.observe(element));
    return () => {
      observer.disconnect();
      pendingReveals.forEach((cancel) => cancel());
    };
  }, [workId]);

  if (!work) return <Navigate to="/works" replace />;

  const relatedWorks = getRelatedWorks(works, work);
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
          category={work.categoryIds}
          onCategoryChange={(value) =>
            goToFilteredWorks("category", value)
          }
          onWorldChange={(value) => goToFilteredWorks("world", value)}
          world={work.worldType}
          worlds={workWorlds}
        />

        <section className="work-detail-layout">
          <aside className="work-detail-sidebar">
            <div className="work-detail-sidebar-inner">
              <div className="work-detail-heading" data-work-detail-reveal>
                <div>
                  <h1>{work.title}</h1>
                  <p>{work.categoryLabel}</p>
                </div>
                <span className="work-detail-designers">
                  {work.designers.map((designer, index) => (
                    <Fragment key={designer.id}>
                      {index > 0 ? ", " : null}
                      <Link to={`/designers/${designer.id}`}>{designer.name}</Link>
                    </Fragment>
                  ))}
                </span>
              </div>

              <div
                className="work-detail-description"
                data-work-detail-reveal
              >
                {isMobile ? (
                  <>
                    <p lang={language}>{work.description[language]}</p>
                    <LanguageToggle
                      language={language}
                      onToggle={() =>
                        setLanguage((current) =>
                          current === "ko" ? "en" : "ko",
                        )
                      }
                    />
                  </>
                ) : (
                  <>
                    <p lang="ko">{work.description.ko}</p>
                    <p lang="en">{work.description.en}</p>
                  </>
                )}
              </div>

              {relatedWorks.length > 0 && !isMobile ? (
                <div className="work-detail-related-wrap" data-work-detail-reveal>
                  <RelatedWorks relatedWorks={relatedWorks} work={work} />
                </div>
              ) : null}
            </div>
          </aside>

          <div className="work-detail-gallery">
            {work.gallery.map((image) => (
              <div
                className={`work-detail-gallery-image${image.src ? "" : " is-empty"}`}
                data-work-detail-reveal
                key={image.id}
              >
                {image.src ? <img src={image.src} alt={`${work.title} 상세 이미지`} /> : null}
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
