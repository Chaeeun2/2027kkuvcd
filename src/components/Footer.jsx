import logoBlackUrl from "../assets/logo-black.png";

function Footer({ reveal = false }) {
  const revealProps = reveal ? { "data-reveal": true } : {};

  return (
    <footer className="site-footer">
      <p {...revealProps}>
        KONKUK VISUAL COMMUNICATION &amp; MEDIA DESIGN 2027 GRADUATION
        EXHIBITION ‘HELLO WORLD’
        <br />© 2027 Konkuk University. All Rights Reserved.
      </p>
      <img
        src={logoBlackUrl}
        alt=""
        {...revealProps}
        data-reveal-delay={reveal ? "80" : undefined}
      />
    </footer>
  );
}

export default Footer;
