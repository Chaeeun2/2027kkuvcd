/* 관리 화면 맨 위에 붙어 있는 제목 줄. children은 오른쪽 버튼들이다. */
function PageHeader({ before, children, status, title }) {
  return (
    <header className="admin-page__header">
      <div>
        {before}
        <h1 className="admin-page__title">{title}</h1>
        <p className="admin-page__status">{status}</p>
      </div>
      <div className="admin-page__actions">{children}</div>
    </header>
  );
}

export default PageHeader;
