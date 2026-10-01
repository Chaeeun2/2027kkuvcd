import { useEffect, useRef } from "react";
import DesignerCard from "../components/DesignerCard";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { designers } from "../data/designers";
import "../designers.css";

function DesignersPage() {
  const pageRef = useRef(null);

  useEffect(() => {
    const cards = [
      ...pageRef.current.querySelectorAll("[data-designer-card]"),
    ];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -5% 0px",
      },
    );

    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
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
