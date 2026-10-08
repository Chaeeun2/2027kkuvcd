function LanguageToggle({ language, onToggle }) {
  return (
    <button
      className="language-toggle"
      type="button"
      onClick={onToggle}
    >
      {language === "ko" ? "ENG" : "KOR"}
    </button>
  );
}

export default LanguageToggle;
