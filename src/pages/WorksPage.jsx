import { useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";
import WorkCard from "../components/WorkCard";
import WorksFilters from "../components/WorksFilters";
import { workCategories, works, workWorlds } from "../data/works";
import "../works.css";

function WorkGrid({ items, threeColumns = false }) {
  if (items.length === 0) {
    return <p className="works-empty">해당 카테고리의 작품이 없습니다.</p>;
  }

  return (
    <section
      className={`works-grid${threeColumns ? " works-grid--three-columns" : ""}`}
      aria-label="졸업 전시 작품"
    >
      {items.map((work, index) => (
        <WorkCard index={index} work={work} key={work.id} />
      ))}
    </section>
  );
}

function WorksPage() {
  const pageRef = useRef(null);
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
    [category, world],
  );
  const selectedWorld = workWorlds.find((item) => item.id === world);
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
      { threshold: 0.01, rootMargin: "0px 0px -5% 0px" },
    );

    elements.forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
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
                <p>{selectedWorld.descriptionKo}</p>
                <p>{selectedWorld.descriptionEn}</p>
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
