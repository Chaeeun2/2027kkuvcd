import { useEffect, useRef, useState } from "react";
import { assetUrl } from "../content/assetUrl";
import Footer from "../components/Footer";
import Header from "../components/Header";
import LanguageToggle from "../components/LanguageToggle";
import MultilineText from "../components/MultilineText";
import {
  getCachedAboutContent,
  loadAboutContent,
} from "../content/aboutContent";
import { resolveImageSrc } from "../content/defaultAssets";
import usePageContent from "../content/usePageContent";
import useIsMobile from "../hooks/useIsMobile";
import { scheduleReveal } from "../utils/loadingReveal";
import "../about.css";

const aboutBg = assetUrl("about_bg.jpg");
const infoCard = assetUrl("about-section2-img.png");
const lineImage = assetUrl("line.png");

const factLabels = {
  ko: { hours: "시간", venue: "장소" },
  en: { hours: "Hours", venue: "Venue" },
};

function useScrollReveal() {
  const pageRef = useRef(null);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return undefined;

    const elements = [...page.querySelectorAll("[data-reveal]")];
    const pendingReveals = new Set();
    const sectionTwoTrigger = page.querySelector("[data-section-two-trigger]");
    const sectionTwoElements = [
      ...page.querySelectorAll("[data-section-two-item]"),
    ];
    const directionalElements = new Set(
      elements.filter(
        (element) =>
          element.hasAttribute("data-reveal-direction") &&
          !element.hasAttribute("data-section-two-item"),
      ),
    );

    elements.forEach((element) => {
      element.style.setProperty(
        "--reveal-delay",
        `${element.dataset.revealDelay ?? 0}ms`,
      );
    });

    const revealElement = (element) => {
      const cancel = scheduleReveal(() => {
        element.classList.add("is-visible");
        pendingReveals.delete(cancel);
      });

      pendingReveals.add(cancel);
    };

    const createObserver = (options) => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;

          revealElement(entry.target);
          observer.unobserve(entry.target);
        });
      }, options);

      return observer;
    };

    const observer = createObserver({
      threshold: 0.12,
      rootMargin: "0px 0px -8% 0px",
    });
    const sectionTwoObserver = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;

        sectionTwoElements.forEach((element) => revealElement(element));
        sectionTwoObserver.disconnect();
      },
      { threshold: 0 },
    );

    elements.forEach((element) => {
      if (
        element.hasAttribute("data-section-two-trigger") ||
        element.hasAttribute("data-section-two-item")
      ) {
        return;
      }

      if (element.hasAttribute("data-reveal-direction")) return;
      observer.observe(element);
    });

    if (sectionTwoTrigger) sectionTwoObserver.observe(sectionTwoTrigger);

    const revealDirectionalElements = () => {
      const triggerLine = window.innerHeight * 0.92;

      directionalElements.forEach((element) => {
        const bounds = element.getBoundingClientRect();
        if (bounds.top > triggerLine || bounds.bottom < 0) return;

        directionalElements.delete(element);
        revealElement(element);
      });
    };

    window.addEventListener("scroll", revealDirectionalElements, {
      passive: true,
    });
    window.addEventListener("resize", revealDirectionalElements);
    revealDirectionalElements();

    return () => {
      observer.disconnect();
      sectionTwoObserver.disconnect();
      window.removeEventListener("scroll", revealDirectionalElements);
      window.removeEventListener("resize", revealDirectionalElements);
      pendingReveals.forEach((cancel) => cancel());
    };
  }, []);

  return pageRef;
}

function IntroBackground({ images }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const count = images.length;

  useEffect(() => {
    if (count < 2) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % count);
    }, 3000);

    return () => window.clearInterval(intervalId);
  }, [count]);

  return (
    <div className="about-intro-background" aria-hidden="true">
      {images.map((item, index) => (
        <img
          className={index === activeIndex % count ? "is-active" : ""}
          src={resolveImageSrc(item.src)}
          alt=""
          key={item.id}
        />
      ))}
    </div>
  );
}

/* 같은 사진 묶음을 두 번 이어 붙여, 절반만큼 흘러가면 처음으로 돌아가도 끊김이 없다. */
function PhotoStrip({ gallery }) {
  const images = gallery.map((item) => resolveImageSrc(item.src));
  const repeatedImages = [...images, ...images];

  return (
    <section
      className="about-gallery"
      aria-label="전시 준비 사진"
      data-reveal
    >
      <div className="about-gallery-track">
        {repeatedImages.map((image, index) => (
          <img src={image} alt="" key={`${image}-${index}`} />
        ))}
      </div>
    </section>
  );
}

/* 콘텐츠가 오기 전에는 빈 페이지를 두고, 로딩 화면이 그동안 화면을 덮는다. */
function AboutPage() {
  const content = usePageContent(getCachedAboutContent, loadAboutContent);

  if (!content) return <main className="about-page" />;

  return <AboutPageContent content={content} />;
}

function AboutPageContent({ content }) {
  const pageRef = useScrollReveal();
  const isMobile = useIsMobile();
  const [language, setLanguage] = useState("ko");
  const labels = factLabels[language];
  const committeeSplit = Math.ceil(content.committee.length / 2);
  const committeeColumns = [
    content.committee.slice(0, committeeSplit),
    content.committee.slice(committeeSplit),
  ];

  return (
    <main className="about-page" ref={pageRef}>
      <Header reveal />

      <div className="about-layout">
        <div className="about-intro-hero">
          <IntroBackground images={content.backgrounds} />
          <section className="about-intro">
          <img
            className="about-intro-image"
            src={resolveImageSrc(content.introImage.src)}
            alt=""
            data-reveal
          />
          <div className="about-intro-copy">
            <div>
              <h1 data-reveal>HELLO WORLD</h1>
              <h2 data-reveal data-reveal-delay="80">
                <MultilineText
                  text={content.subtitle[isMobile ? language : "en"]}
                />
              </h2>
            </div>
            <div className="about-intro-description">
              {isMobile ? (
                <p data-reveal data-reveal-delay="160" lang={language}>
                  {content.body[language]}
                </p>
              ) : (
                <>
                  <p data-reveal data-reveal-delay="160" lang="ko">
                    {content.body.ko}
                  </p>
                  <p data-reveal data-reveal-delay="240" lang="en">
                    {content.body.en}
                  </p>
                </>
              )}
            </div>
            {isMobile ? (
              <>
                <LanguageToggle
                  language={language}
                  onToggle={() =>
                    setLanguage((current) => (current === "ko" ? "en" : "ko"))
                  }
                />
                <a
                  className="about-instagram"
                  href={content.instagram.url}
                  target="_blank"
                  rel="noreferrer"
                  data-reveal
                  data-reveal-delay="320"
                >
                  {content.instagram.label}
                </a>
              </>
            ) : null}
          </div>
          </section>
        </div>

        <div className="about-layout-body">
          <div className="about-page-background" aria-hidden="true">
            <img src={aboutBg} alt="" />
          </div>

        <section
          className="about-section-two"
          aria-label="전시 정보"
          data-section-two-trigger
        >
          <div
            className="about-date-band"
            data-reveal
            data-section-two-item
          >
            <img src={lineImage} alt="" />
            <p>{content.date}</p>
          </div>

          <div
            className="about-info-card"
            data-reveal
            data-reveal-delay="300"
            data-reveal-direction="from-right"
            data-section-two-item
          >
            <img src={infoCard} alt="" />
            <div className="about-info-card-content">
              <div className="about-info-titles">
                <h2>
                  <MultilineText text={content.exhibitionTitle.ko} />
                </h2>
                <p>
                  <MultilineText text={content.exhibitionTitle.en} />
                </p>
              </div>
              {isMobile ? (
                <dl className="about-info-facts">
                  <div className="about-info-fact">
                    <dt>{labels.hours}</dt>
                    <dd>
                      <MultilineText text={content.hours} />
                    </dd>
                  </div>
                  <div className="about-info-fact">
                    <dt>{labels.venue}</dt>
                    <dd>
                      <MultilineText text={content.venue[language]} />
                    </dd>
                  </div>
                </dl>
              ) : (
                <div>
                  <strong>
                    <MultilineText text={content.hours} />
                  </strong>
                  <strong>
                    <MultilineText text={content.venue.ko} />
                  </strong>
                  <p>
                    <MultilineText text={content.venue.en} />
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <PhotoStrip gallery={content.gallery} />

        <section className="about-contributors">
          <h2 data-reveal>CONTRIBUTORS</h2>
          <div className="about-contributors-content">
            <h3 data-reveal>졸업준비위원회</h3>
            <div className="about-contributor-columns">
              {committeeColumns.map((members, columnIndex) => (
                <dl key={columnIndex}>
                  {members.map((member, index) => (
                    <div
                      key={member.id}
                      data-reveal
                      data-reveal-delay={index * 60}
                    >
                      <dt>{member.role}</dt>
                      <dd>{member.name}</dd>
                    </div>
                  ))}
                </dl>
              ))}
            </div>
          </div>
          <img
            className="about-contributor-box"
            src={resolveImageSrc(content.contributorImage.src)}
            alt=""
            data-reveal
            data-reveal-delay="120"
            data-reveal-direction="from-right"
          />
        </section>

        <div className="about-divider about-divider-one" aria-hidden="true">
          <img src={lineImage} alt="" data-reveal />
        </div>

        <section className="about-faculty">
          <img
            className="about-faculty-graphic"
            src={resolveImageSrc(content.facultyImage.src)}
            alt=""
            data-reveal
            data-reveal-direction="from-left"
          />
          <div className="about-faculty-content">
            <h2 data-reveal>작품지도 교수님</h2>
            <div className="about-faculty-tracks">
              {content.faculty.map((track) => (
                <FacultyTrack
                  key={track.id}
                  title={track.title}
                  courses={track.courses}
                />
              ))}
            </div>
          </div>
        </section>

        <div className="about-divider about-divider-two" aria-hidden="true">
          <img src={lineImage} alt="" data-reveal />
        </div>

        <section className="about-supports">
          <h2 data-reveal>SUPPORTS</h2>
          <div>
            {content.supports.map((logo, index) => (
              <img
                key={logo.id}
                src={resolveImageSrc(logo.src)}
                alt=""
                data-reveal
                data-reveal-delay={index * 80}
              />
            ))}
          </div>
        </section>
        </div>
      </div>

      <Footer />
    </main>
  );
}

function FacultyTrack({ courses, title }) {
  return (
    <div className="about-faculty-track">
      <h3 data-reveal>{title}</h3>
      <dl>
        {courses.map((item, index) => (
          <div
            key={item.id}
            data-reveal
            data-reveal-delay={index * 60}
          >
            <dt>{item.course}</dt>
            <dd>{item.professor}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default AboutPage;
