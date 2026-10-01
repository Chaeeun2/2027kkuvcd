import logoUrl from "../assets/logo.png";

function LoadingScreen({ duration, isLeaving }) {
  return (
    <div
      className={`loading-screen${isLeaving ? " is-leaving" : ""}`}
      role="status"
      aria-label="3D 모델 로딩 중"
      style={{ "--loading-duration": `${duration}ms` }}
    >
      <div className="loading-content">
        <img className="loading-logo" src={logoUrl} alt="" />

        <div
          className="loading-track"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <span className="loading-progress" />
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
