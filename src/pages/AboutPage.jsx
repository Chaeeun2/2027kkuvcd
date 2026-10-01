import { useEffect, useRef, useState } from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import aboutBg from "../assets/about_bg.jpg";
import introBg1 from "../assets/about-section1-bg01.jpg";
import introBg2 from "../assets/about-section1-bg02.jpg";
import introBg3 from "../assets/about-section1-bg03.jpg";
import introBg4 from "../assets/about-section1-bg04.jpg";
import introImage from "../assets/about-main-img.jpg";
import infoCard from "../assets/about-section2-img.png";
import gallery1 from "../assets/about-section3-img1.jpg";
import gallery2 from "../assets/about-section3-img2.jpg";
import gallery3 from "../assets/about-section3-img3.jpg";
import gallery4 from "../assets/about-section3-img4.jpg";
import gallery5 from "../assets/about-section3-img5.jpg";
import contributorBox from "../assets/about-section4-img.png";
import facultyGraphic from "../assets/about-section5-img.jpg";
import support1 from "../assets/about-section5-img1.png";
import support2 from "../assets/about-section5-img2.png";
import support3 from "../assets/about-section5-img3.png";
import lineImage from "../assets/line.png";
import { getLoadingRevealDelay } from "../utils/loadingRevealDelay";
import "../about.css";

const introBackgrounds = [introBg1, introBg2, introBg3, introBg4];
const galleryImages = [gallery1, gallery2, gallery3, gallery4, gallery5];

function useScrollReveal() {
  const pageRef = useRef(null);

  useEffect(() => {
    const page = pageRef.current;
    if (!page) return undefined;

    const elements = [...page.querySelectorAll("[data-reveal]")];
    const pendingTimers = new Set();
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
      const loadingDelay = getLoadingRevealDelay();
      const timer = window.setTimeout(() => {
        element.classList.add("is-visible");
        pendingTimers.delete(timer);
      }, loadingDelay);

      pendingTimers.add(timer);
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
      pendingTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  return pageRef;
}

function IntroBackground() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let intervalId;
    const firstChangeId = window.setTimeout(() => {
      setActiveIndex(1);
      intervalId = window.setInterval(() => {
        setActiveIndex((index) => (index + 1) % introBackgrounds.length);
      }, 7000);
    }, 5000);

    return () => {
      window.clearTimeout(firstChangeId);
      window.clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="about-intro-background" aria-hidden="true">
      {introBackgrounds.map((image, index) => (
        <img
          className={index === activeIndex ? "is-active" : ""}
          src={image}
          alt=""
          key={image}
        />
      ))}
    </div>
  );
}

function PhotoStrip() {
  const repeatedImages = [...galleryImages, ...galleryImages];

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

function AboutPage() {
  const pageRef = useScrollReveal();

  return (
    <main className="about-page" ref={pageRef}>
      <Header reveal />
      <IntroBackground />
      <div className="about-page-background" aria-hidden="true">
        <img src={aboutBg} alt="" />
      </div>

      <div className="about-layout">
        <section className="about-intro">
          <img
            className="about-intro-image"
            src={introImage}
            alt=""
            data-reveal
          />
          <div className="about-intro-copy">
            <div>
              <h1 data-reveal>HELLO WORLD</h1>
              <h2 data-reveal data-reveal-delay="80">
                2027 Konkuk University Visual Communication &amp; Media Design
                <br />
                Graduation Exhibition
              </h2>
            </div>
            <div className="about-intro-description">
              <p data-reveal data-reveal-delay="160">
                이번 졸업 전시 ‘HELLO WORLD’는 지난 4년간 우리가 치열하게
                고민하며 쌓아온 시간과 경험이 학교라는 훈련장을 떠나 비로소
                사회라는 수취인에게 전달되는 첫 번째 인사를 의미합니다. 우리가
                보낸 시간은 각자의 가치를 담아 정성껏 포장되어 달려온 기나긴
                운송의 과정이며, 이번 전시장은 그 여정이 마침내 세상과 마주하는
                도착지이자 상자를 열고 더 넓은 세계로 나아가는 새로운 여정의
                시작점입니다. 즉, 전시는 단순히 4년의 마침표를 찍는 결과보고가
                아니라, 우리의 작품이라는 상자가 사람들에게 전달되어 새로운
                이야기가 시작되는 설레는 첫 만남입니다.
              </p>
              <p data-reveal data-reveal-delay="240">
                ‘HELLO WORLD’ marks our first greeting to the world, as four
                years of ideas and experiences leave the training ground of
                school and are finally delivered to society. Our time together
                has been a long journey, carefully packed with our own values.
                This exhibition is both its destination and a new starting
                point, where we open the box and step into a wider world. More
                than the end of four years, it is our first encounter with the
                world—the moment our work is delivered and a new story begins.
              </p>
            </div>
            <a
              className="about-instagram"
              href="https://www.instagram.com/2027kkuvcd"
              target="_blank"
              rel="noreferrer"
              data-reveal
              data-reveal-delay="320"
            >
              @2027kkuvcd
            </a>
          </div>
        </section>

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
            <p>2026.10.30-11.02</p>
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
              <div>
                <h2>
                  2027 건국대학교 디자인대학
                  <br />
                  시각영상디자인학과 시각트랙
                  <br />
                  졸업전시회
                </h2>
                <p>
                  2027 Konkuk University
                  <br />
                  Visual Communication &amp; Media Design
                  <br />
                  (Track VCD) Graduation Exhibition
                </p>
              </div>
              <div>
                <strong>
                  Fri–Sun 10:00–18:00
                  <br />
                  Mon 10:00–17:00
                </strong>
                <strong>
                  서울특별시 종로구 대학로 57
                  <br />
                  홍익대학교 대학로 아트센터
                  <br />
                  B2 제3전시장
                </strong>
                <p>
                  7, Daehak-ro, Jongno-gu,
                  <br />
                  Seoul, Republic of Korea,
                  <br />
                  B2 Exhibition Hall 3
                </p>
              </div>
            </div>
          </div>
        </section>

        <PhotoStrip />

        <section className="about-contributors">
          <h2 data-reveal>CONTRIBUTORS</h2>
          <div className="about-contributors-content">
            <h3 data-reveal>졸업준비위원회</h3>
            <div className="about-contributor-columns">
              <dl>
                <div data-reveal><dt>위원장</dt><dd>이청경</dd></div>
                <div data-reveal data-reveal-delay="60"><dt>부위원장</dt><dd>김서영</dd></div>
                <div data-reveal data-reveal-delay="120"><dt>총무</dt><dd>이승민</dd></div>
                <div data-reveal data-reveal-delay="180"><dt>기획</dt><dd>고서연 최예은</dd></div>
              </dl>
              <dl>
                <div data-reveal><dt>디자인</dt><dd>김현준 이은빈</dd></div>
                <div data-reveal data-reveal-delay="60"><dt>도록</dt><dd>이청경</dd></div>
                <div data-reveal data-reveal-delay="120"><dt>웹</dt><dd>이승민 이청경</dd></div>
                <div data-reveal data-reveal-delay="180"><dt>홍보</dt><dd>김서영</dd></div>
              </dl>
            </div>
          </div>
          <img
            className="about-contributor-box"
            src={contributorBox}
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
            src={facultyGraphic}
            alt=""
            data-reveal
            data-reveal-direction="from-left"
          />
          <div className="about-faculty-content">
            <h2 data-reveal>작품지도 교수님</h2>
            <div className="about-faculty-tracks">
              <FacultyTrack
                title="시각트랙"
                courses={[
                  ["프로모션디자인", "박지은 교수님"],
                  ["전공연구프로젝트(시각)", "김주연 교수님"],
                  ["정보디자인프로젝트", "박지은 교수님"],
                  ["실험디자인", "김주경 교수님"],
                ]}
              />
              <FacultyTrack
                title="영상·디지털트랙"
                courses={[
                  ["UIUX캡스톤디자인", "정혜경 교수님"],
                  ["전공연구프로젝트(영상)", "박상권 교수님"],
                  ["전공연구프로젝트(디지털)", "강일 교수님"],
                  ["뉴미디어영상", "고이관 교수님"],
                ]}
              />
            </div>
          </div>
        </section>

        <div className="about-divider about-divider-two" aria-hidden="true">
          <img src={lineImage} alt="" data-reveal />
        </div>

        <section className="about-supports">
          <h2 data-reveal>SUPPORTS</h2>
          <div>
            <img src={support1} alt="" data-reveal />
            <img src={support2} alt="" data-reveal data-reveal-delay="80" />
            <img src={support3} alt="" data-reveal data-reveal-delay="160" />
          </div>
        </section>
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
        {courses.map(([course, professor], index) => (
          <div
            key={course}
            data-reveal
            data-reveal-delay={index * 60}
          >
            <dt>{course}</dt>
            <dd>{professor}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export default AboutPage;
