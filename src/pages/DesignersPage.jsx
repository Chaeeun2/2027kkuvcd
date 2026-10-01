import { useEffect, useRef } from "react";
import DesignerCard from "../components/DesignerCard";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { designers } from "../data/designers";
import { getLoadingRevealDelay } from "../utils/loadingRevealDelay";
import "../designers.css";

function DesignersPage() {
  const pageRef = useRef(null);

  useEffect(() => {
    const cards = [
      ...pageRef.current.querySelectorAll("[data-designer-card]"),
    ];
    const pendingTimers = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          const loadingDelay = getLoadingRevealDelay();
          const timer = window.setTimeout(() => {
            entry.target.classList.add("is-visible");
            pendingTimers.delete(timer);
          }, loadingDelay);

          pendingTimers.add(timer);
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
      pendingTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return (
    <main className="designers-page" ref={pageRef}>
      <Header />

      <div className="designers-content">
        <h1>DESIGNERS</h1>
        <section className="designers-grid" aria-label="졸업 전시 디자이너">
          {designers.map((designer, index) => (
            <DesignerCard
              designer={designer}
              index={index}
              key={designer.id}
            />
          ))}
        </section>
      </div>

      <Footer />
    </main>
  );
}

export default DesignersPage;
