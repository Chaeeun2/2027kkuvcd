import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import LoadingScreen from "./components/LoadingScreen";
import AboutPage from "./pages/AboutPage";
import DesignerDetailPage from "./pages/DesignerDetailPage";
import DesignersPage from "./pages/DesignersPage";
import EntryPage from "./pages/EntryPage";
import WorkDetailPage from "./pages/WorkDetailPage";
import WorksPage from "./pages/WorksPage";

const LOADING_DURATION = 1000;
const INTRO_LOADING_DURATION = 2000;
const LOADING_FADE_TIME = 1500;

function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

function RouteLoadingScreen({ duration }) {
  const [loadingPhase, setLoadingPhase] = useState("visible");

  useEffect(() => {
    const leavingTimer = window.setTimeout(() => {
      setLoadingPhase("leaving");
    }, duration);

    return () => window.clearTimeout(leavingTimer);
  }, [duration]);

  if (loadingPhase === "hidden") return null;

  return (
    <LoadingScreen
      duration={duration}
      fadeDuration={LOADING_FADE_TIME}
      isLeaving={loadingPhase === "leaving"}
      onFadeComplete={() => setLoadingPhase("hidden")}
    />
  );
}

function App() {
  const { pathname } = useLocation();
  const previousPathnameRef = useRef(null);
  const previousPathname = previousPathnameRef.current;
  const isDesignerDetail = /^\/designers\/[^/]+$/.test(pathname);
  const isWorkDetail = /^\/works\/[^/]+$/.test(pathname);
  const skipLoading =
    previousPathname !== null &&
    ((previousPathname === "/designers" && isDesignerDetail) ||
      isWorkDetail);

  useEffect(() => {
    previousPathnameRef.current = pathname;
  }, [pathname]);

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<EntryPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/designers" element={<DesignersPage />} />
        <Route path="/designers/:designerId" element={<DesignerDetailPage />} />
        <Route path="/works" element={<WorksPage />} />
        <Route path="/works/:workId" element={<WorkDetailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {!skipLoading && (
        <RouteLoadingScreen
          duration={
            pathname === "/" ? INTRO_LOADING_DURATION : LOADING_DURATION
          }
          key={pathname}
        />
      )}
    </>
  );
}

export default App;
