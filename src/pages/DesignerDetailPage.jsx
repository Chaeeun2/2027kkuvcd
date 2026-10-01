import { useEffect, useRef } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import designerLine from "../assets/designer-line.png";
import projectArrow from "../assets/designer-work-arrow.png";
import { getDesignerById } from "../data/designers";
import { getWorksByDesignerId } from "../data/designerWorks";
import "../designer-detail.css";

const emptyProjects = Array.from({ length: 3 }, (_, index) => ({
  id: `empty-project-${index + 1}`,
  title: "Project",
  category: "준비 중",
  image: null,
}));

function SectionHeading({ children }) {
  return <h2 className="designer-detail-section-title">{children}</h2>;
}

function useDetailReveal() {
  const pageRef = useRef(null);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return undefined;

    const elements = [...page.querySelectorAll("[data-detail-reveal]")];
    const timers = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const delay = Number(entry.target.dataset.revealDelay ?? 0);
          const loadingDelay = document.querySelector(".loading-screen")
            ? 900
            : 0;
          const timer = window.setTimeout(() => {
            entry.target.classList.add("is-visible");
            timers.delete(timer);
          }, delay + loadingDelay);

          timers.add(timer);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" },
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return pageRef;
}

function DesignerDetailPage() {
  const pageRef = useDetailReveal();
  const { designerId } = useParams();
  const designer = getDesignerById(designerId);

  if (!designer) return <Navigate to="/designers" replace />;

  const defaultDetail = getDesignerById("designer-26").detail;
  const detail = designer.detail ?? defaultDetail;
  const assignedWorks = getWorksByDesignerId(designer.id);
  const projects = assignedWorks.length
    ? assignedWorks.map((work) => ({
        id: work.id,
        title: work.title,
        category: work.detail.categoryLabel,
        image: work.thumbnail,
      }))
    : emptyProjects;
  const displayKoreanName = designer.koreanName;
  const displayEnglishName = designer.englishName
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

  return (
    <main className="designer-detail-page" ref={pageRef}>
      <Header />

      <div className="designer-detail-content">
        <div className="designer-detail-heading" data-detail-reveal>
          <h1>DESIGNER</h1>
          <img src={designerLine} alt="" />
        </div>

        <div className="designer-detail-layout">
          <div
            className="designer-detail-profile-image"
            data-detail-reveal
            data-reveal-delay="80"
          >
            {detail.profileImage ? (
              <img
                src={detail.profileImage}
                alt={`${displayKoreanName} 프로필`}
              />
            ) : (
              <span>PROFILE IMAGE</span>
            )}
          </div>

          <div className="designer-detail-information">
            <section
              className="designer-detail-profile"
              data-detail-reveal
              data-reveal-delay="160"
            >
              <SectionHeading>Profile</SectionHeading>
              <div className="designer-detail-profile-body">
                <div className="designer-detail-identity">
                  <div className="designer-detail-name">
                    <strong>{displayKoreanName}</strong>
                    <span>{displayEnglishName}</span>
                  </div>

                  <dl className="designer-detail-contacts">
                    <div>
                      <dt>Email</dt>
                      <dd>
                        {detail.email ? (
                          <a href={`mailto:${detail.email}`}>{detail.email}</a>
                        ) : (
                          "준비 중"
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt>Instagram</dt>
                      <dd>{detail.instagram ?? "준비 중"}</dd>
                    </div>
                  </dl>
                </div>

                <div className="designer-detail-signature">
                  {detail.signatureImage && (
                    <img src={detail.signatureImage} alt="" />
                  )}
                </div>
              </div>
            </section>

            <section
              className="designer-detail-statement"
              data-detail-reveal
            >
              <SectionHeading>Statement</SectionHeading>
              <p>
                {detail.statement ??
                  "디자이너 소개가 준비 중입니다. designers.js에서 정보를 추가할 수 있습니다."}
              </p>
            </section>

            <section
              className="designer-detail-projects"
              data-detail-reveal
            >
              <SectionHeading>Project</SectionHeading>
              <div className="designer-detail-project-grid">
                {projects.map((project) => (
                  <Link
                    className="designer-project-card"
                    to={`/works/${project.id}`}
                    key={project.id}
                  >
                    <div className="designer-project-image">
                      {project.image ? (
                        <img
                          className="designer-project-thumbnail"
                          src={project.image}
                          alt={project.title}
                        />
                      ) : (
                        <span>PROJECT IMAGE</span>
                      )}
                      <img
                        className="designer-project-arrow"
                        src={projectArrow}
                        alt=""
                      />
                    </div>
                    <div>
                      <h3>{project.title}</h3>
                      <p>{project.category}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default DesignerDetailPage;
