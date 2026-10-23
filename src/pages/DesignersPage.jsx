import { useEffect, useMemo, useRef, useState } from "react";
import { assetUrl } from "../content/assetUrl";
import DesignerCard from "../components/DesignerCard";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { getCachedDesigners, loadDesigners } from "../content/designersContent";
import usePageContent from "../content/usePageContent";
import { formatEnglishName } from "../data/designers";
import useIsMobile from "../hooks/useIsMobile";
import { bindScrollReveal, scheduleVisibleClass } from "../utils/scrollReveal";
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

    return bindScrollReveal({
      elements: cards,
      reveal: (card) => {
        const grid = card.parentElement;
        const columnCount = getComputedStyle(grid)
          .gridTemplateColumns.split(" ")
          .filter(Boolean).length;
        const index = [...grid.children].indexOf(card);
        card.style.setProperty(
          "--card-reveal-delay",
          `${(index % Math.max(columnCount, 1)) * 80}ms`,
        );

        return scheduleVisibleClass(card);
      },
    });
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
