import { assetUrl } from "../content/assetUrl";

const logoUrl = assetUrl("logo.png");

function LoadingScreen({
  duration,
  fadeDuration,
  isLeaving,
  onFadeComplete,
  progress,
}) {
  const isTracking = typeof progress === "number";

  return (
    <div
      className={`loading-screen${isLeaving ? " is-leaving" : ""}`}
      onAnimationEnd={(event) => {
        if (
          isLeaving &&
          event.currentTarget === event.target &&
          event.animationName === "loading-screen-fade-out"
        ) {
          onFadeComplete();
        }
      }}
      role="status"
      aria-label="페이지 로딩 중"
      style={{
        "--loading-duration": `${duration}ms`,
        "--loading-fade-duration": `${fadeDuration}ms`,
      }}
    >
      <div className="loading-content">
        <img className="loading-logo" src={logoUrl} alt="" />

        <div
          className="loading-track"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={isTracking ? Math.round(progress * 100) : undefined}
        >
          <span
            className={`loading-progress${isTracking ? " is-tracking" : ""}`}
            style={isTracking ? { transform: `scaleX(${progress})` } : undefined}
          />
        </div>
      </div>
    </div>
  );
}

export default LoadingScreen;
