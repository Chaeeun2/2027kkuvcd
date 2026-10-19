import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import LanguageToggle from "../components/LanguageToggle";
import WorkCard from "../components/WorkCard";
import WorksFilters from "../components/WorksFilters";
import { getCachedAboutContent, loadAboutContent } from "../content/aboutContent";
import usePageContent from "../content/usePageContent";
import { getCachedWorks, loadWorks } from "../content/worksContent";
import { workCategories, workWorlds } from "../data/works";
import useIsMobile from "../hooks/useIsMobile";
import { scheduleReveal } from "../utils/loadingReveal";
import "../works.css";

const CARD_REVEAL_STEP = 80;

const getCachedWorksPage = () => {
  const works = getCachedWorks();
  const about = getCachedAboutContent();
  return works && about ? { works, about } : null;
};

const loadWorksPage = () =>
  Promise.all([loadWorks(), loadAboutContent()]).then(([works, about]) => ({ works, about }));

/* 한 줄 안에서 왼쪽 카드부터 차례로 들어오도록 화면에 실제로 놓인 열 순서를 쓴다. */
function getWorkRevealDelay(element) {
  const grid = element.closest(".works-grid");
  if (!grid) return Number(element.dataset.revealDelay ?? 0);

  const columnCount = getComputedStyle(grid)
    .gridTemplateColumns.split(" ")
    .filter(Boolean).length;
  const index = [...grid.children].indexOf(element);

  return (index % Math.max(columnCount, 1)) * CARD_REVEAL_STEP;
}

function WorkGrid({ items, threeColumns = false }) {
  if (items.length === 0) {
    return <p className="works-empty">해당 카테고리의 작품이 없습니다.</p>;
  }

  return (
    <section
      className={`works-grid${threeColumns ? " works-grid--three-columns" : ""}`}
      aria-label="졸업 전시 작품"
    >
      {items.map((work) => (
        <WorkCard work={work} key={work.id} />
      ))}
    </section>
  );
}

function WorksPage() {
  const content = usePageContent(getCachedWorksPage, loadWorksPage);
  if (!content) return <main className="works-page" />;
  return <WorksPageContent works={content.works} descriptions={content.about.worldDescriptions} />;
}

function WorksPageContent({ descriptions, works }) {
  const pageRef = useRef(null);
  const isMobile = useIsMobile();
  const [language, setLanguage] = useState("ko");
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get("category");
  const worldParam = searchParams.get("world");
  const category = workCategories.some((item) => item.id === categoryParam)
    ? categoryParam
    : "all";
  const world = workWorlds.some((item) => item.id === worldParam)
    ? worldParam
    : "all";

  const filteredWorks = useMemo(
    () =>
      works.filter(
        (work) =>
          (category === "all" || work.categoryIds.includes(category)) &&
          (world === "all" || work.worldType === world),
      ),
    [category, world, works],
  );
  const selectedWorld = workWorlds.find((item) => item.id === world);
  const description = descriptions[world];
  const updateFilter = (key, value) => {
    const nextParams = new URLSearchParams(searchParams);
    if (value === "all") nextParams.delete(key);
    else nextParams.set(key, value);
    setSearchParams(nextParams);
  };

  useEffect(() => {
    const elements = [
      ...pageRef.current.querySelectorAll(
        "[data-work-reveal]:not(.is-visible)",
      ),
    ];
    const pendingReveals = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const delay = getWorkRevealDelay(entry.target);
          const cancel = scheduleReveal(() => {
            entry.target.classList.add("is-visible");
            pendingReveals.delete(cancel);
          }, delay);

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
  }, [filteredWorks]);

  return (
    <main className="works-page" ref={pageRef}>
      <Header />

      <div className="works-content">
        <WorksFilters
          categories={workCategories}
          category={category}
          onCategoryChange={(value) => updateFilter("category", value)}
          onWorldChange={(value) => updateFilter("world", value)}
          reveal
          world={world}
          worlds={workWorlds}
        />

        {world === "all" ? (
          <WorkGrid items={filteredWorks} />
        ) : (
          <section className="works-selected-world">
            <div className="works-selected-world__layout">
              <aside
                className="works-world-description"
                data-work-reveal
              >
                <h1>{selectedWorld.label}</h1>
                {isMobile ? (
                  <>
                    <p>
                      {language === "ko"
                        ? description.ko
                        : description.en}
                    </p>
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
                    <p>{description.ko}</p>
                    <p>{description.en}</p>
                  </>
                )}
              </aside>
              <WorkGrid items={filteredWorks} threeColumns />
            </div>
          </section>
        )}
      </div>

      <Footer />
    </main>
  );
}

export default WorksPage;
