import { useEffect, useRef } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { assetUrl } from "../content/assetUrl";
import Footer from "../components/Footer";
import Header from "../components/Header";
import MultilineText from "../components/MultilineText";
import { formatEnglishName } from "../data/designers";
import { getCachedDesigners, loadDesigners } from "../content/designersContent";
import usePageContent from "../content/usePageContent";
import {
  getCachedWorks,
  getWorksByDesignerId,
  loadWorks,
} from "../content/worksContent";
import useIsMobile from "../hooks/useIsMobile";
import { scheduleReveal } from "../utils/loadingReveal";
import "../designer-detail.css";

const designerLine = assetUrl("designer-line.png");
const projectArrow = assetUrl("designer-work-arrow.png");

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
    const pendingReveals = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const delay = Number(entry.target.dataset.revealDelay ?? 0);
          const cancel = scheduleReveal(() => {
            entry.target.classList.add("is-visible");
            pendingReveals.delete(cancel);
          }, delay);

          pendingReveals.add(cancel);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" },
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
      pendingReveals.forEach((cancel) => cancel());
    };
  }, []);

  return pageRef;
}

function DesignerDetailPage() {
  const designers = usePageContent(getCachedDesigners, loadDesigners);
  const works = usePageContent(getCachedWorks, loadWorks);
  if (!designers || !works) return <main className="designer-detail-page" />;
  return <DesignerDetailContent designers={designers} works={works} />;
}

function DesignerDetailContent({ designers, works }) {
  const pageRef = useDetailReveal();
  const isMobile = useIsMobile();
  const { designerId } = useParams();
  const designer = designers.find((item) => item.id === designerId);

  if (!designer) return <Navigate to="/designers" replace />;

  const assignedWorks = getWorksByDesignerId(works, designer.id);
  const projects = assignedWorks.length
    ? assignedWorks.map((work) => ({
        id: work.id,
        title: work.title,
        category: work.categoryLabel,
        image: work.thumbnail?.src,
      }))
    : emptyProjects;
  const displayKoreanName = designer.koreanName;
  const displayEnglishName = formatEnglishName(designer.englishName);
  // 모바일 시안은 세로 프로필 사진 대신 가로 아이디카드 뒷면을 머리에 둔다.
  const headerImage = isMobile ? designer.backImage : designer.profileImage;

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
            {headerImage ? (
              <img src={headerImage} alt={`${displayKoreanName} 프로필`} />
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

                  {designer.email || designer.instagram ? (
                    <dl className="designer-detail-contacts">
                      {designer.email ? (
                        <div>
                          <dt>Email</dt>
                          <dd>
                            <a href={`mailto:${designer.email}`}>{designer.email}</a>
                          </dd>
                        </div>
                      ) : null}
                      {designer.instagram ? (
                        <div>
                          <dt>Instagram</dt>
                          <dd>{designer.instagram}</dd>
                        </div>
                      ) : null}
                    </dl>
                  ) : null}
                </div>

                <div className="designer-detail-signature">
                  {designer.signatureImage && (
                    <img src={designer.signatureImage} alt="" />
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
                <MultilineText text={designer.statement || "디자이너 소개가 준비 중입니다."} />
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
