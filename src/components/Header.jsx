import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import logoUrl from "../assets/logo.png";

function Header({ reveal = false }) {
  const [isHidden, setIsHidden] = useState(false);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
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

  return (
    <header className={`site-header${isHidden ? " is-hidden" : ""}`}>
      <Link
        className="site-logo"
        to="/"
        aria-label="Hello World 홈"
        {...revealProps}
      >
        <img src={logoUrl} alt="" />
      </Link>

      <nav
        className="site-navigation"
        aria-label="주요 메뉴"
        {...revealProps}
        data-reveal-delay={reveal ? "80" : undefined}
      >
        <NavLink to="/about">ABOUT</NavLink>
        <NavLink to="/designers">DESIGNERS</NavLink>
        <NavLink to="/works">WORKS</NavLink>
      </nav>
    </header>
  );
}

export default Header;
