import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import logoUrl from "../assets/logo.png";

function Header({ reveal = false }) {
  const [isHidden, setIsHidden] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const location = useLocation();
  const revealProps = reveal ? { "data-reveal": true } : {};

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const updateHeader = () => {
      const currentScrollY = Math.max(window.scrollY, 0);

      if (currentScrollY <= 10) {
        setIsHidden(false);
      } else if (
        currentScrollY > lastScrollY.current &&
        currentScrollY > 134
      ) {
        setIsHidden(true);
      } else if (currentScrollY < lastScrollY.current) {
        setIsHidden(false);
      }

      lastScrollY.current = currentScrollY;
      ticking.current = false;
    };

    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      window.requestAnimationFrame(updateHeader);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!isMenuOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <header
      className={`site-header${isHidden && !isMenuOpen ? " is-hidden" : ""}`}
    >
      <Link
        className="site-logo"
        to="/"
        aria-label="Hello World 홈"
        {...revealProps}
      >
        <img src={logoUrl} alt="" />
      </Link>

      <button
        className="site-menu-toggle"
        type="button"
        aria-controls="site-menu"
        aria-expanded={isMenuOpen}
        aria-label="메뉴 열기"
        onClick={() => setIsMenuOpen(true)}
        {...revealProps}
      >
        <span />
        <span />
        <span />
      </button>

      {isMenuOpen ? (
        <div
          className="site-menu-backdrop"
          onClick={() => setIsMenuOpen(false)}
        />
      ) : null}

      <nav
        className={`site-navigation${isMenuOpen ? " is-open" : ""}`}
        id="site-menu"
        aria-label="주요 메뉴"
        {...revealProps}
        data-reveal-delay={reveal ? "80" : undefined}
      >
        <button
          className="site-menu-close"
          type="button"
          aria-label="메뉴 닫기"
          onClick={() => setIsMenuOpen(false)}
        />

        <NavLink to="/about">ABOUT</NavLink>
        <NavLink to="/designers">DESIGNERS</NavLink>
        <NavLink to="/works">WORKS</NavLink>
      </nav>
    </header>
  );
}

export default Header;
