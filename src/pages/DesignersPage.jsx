import { useEffect, useMemo, useRef, useState } from "react";
import { assetUrl } from "../content/assetUrl";
import DesignerCard from "../components/DesignerCard";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { getCachedDesigners, loadDesigners } from "../content/designersContent";
import usePageContent from "../content/usePageContent";
import { formatEnglishName } from "../data/designers";
import useIsMobile from "../hooks/useIsMobile";
import { scheduleReveal } from "../utils/loadingReveal";
import "../designers.css";

const searchIcon = assetUrl("search-icon.svg");

function DesignersPage() {
  const designers = usePageContent(getCachedDesigners, loadDesigners);
  if (!designers) return <main className="designers-page" />;
  return <DesignersPageContent designers={designers} />;
}

function DesignersPageContent({ designers }) {
  const pageRef = useRef(null);
  const isMobile = useIsMobile();
  const [query, setQuery] = useState("");
  const visibleDesigners = useMemo(() => {
    if (!isMobile) return designers;

    const needle = query.trim().toLowerCase();
    if (!needle) return designers;

    return designers.filter((designer) => {
      const english = formatEnglishName(designer.englishName).toLowerCase();
      return (
        designer.koreanName.includes(query.trim()) ||
        designer.englishName.toLowerCase().includes(needle) ||
        english.includes(needle)
      );
    });
  }, [designers, isMobile, query]);

  useEffect(() => {
    const cards = [
      ...pageRef.current.querySelectorAll("[data-designer-card]"),
    ];
    const pendingReveals = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const grid = entry.target.parentElement;
          const columnCount = getComputedStyle(grid)
            .gridTemplateColumns.split(" ")
            .filter(Boolean).length;
          const index = [...grid.children].indexOf(entry.target);
          entry.target.style.setProperty(
            "--card-reveal-delay",
            `${(index % Math.max(columnCount, 1)) * 80}ms`,
          );

          const cancel = scheduleReveal(() => {
            entry.target.classList.add("is-visible");
            pendingReveals.delete(cancel);
          });

          pendingReveals.add(cancel);
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -5% 0px",
      },
    );

    cards.forEach((card) => observer.observe(card));

    return () => {
      observer.disconnect();
      pendingReveals.forEach((cancel) => cancel());
    };
  }, [visibleDesigners]);

  return (
    <main className="designers-page" ref={pageRef}>
      <Header />

      <div className="designers-content">
        <h1>DESIGNERS</h1>
        {isMobile ? (
          <label className="designers-search">
            <span className="visually-hidden">디자이너 이름 검색</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="디자이너 이름 검색"
              autoComplete="off"
            />
            <img className="designers-search__icon" src={searchIcon} alt="" />
          </label>
        ) : null}
        <section className="designers-grid" aria-label="졸업 전시 디자이너">
          {visibleDesigners.map((designer) => (
            <DesignerCard
              designer={designer}
              isMobile={isMobile}
              key={designer.id}
            />
          ))}
        </section>
        {isMobile && visibleDesigners.length === 0 ? (
          <p className="designers-empty">검색 결과가 없습니다.</p>
        ) : null}
      </div>

      <Footer />
    </main>
  );
}

export default DesignersPage;
