import {
  lazy,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import LoadingScreen from "./components/LoadingScreen";
import AboutPage from "./pages/AboutPage";
import DesignerDetailPage from "./pages/DesignerDetailPage";
import DesignersPage from "./pages/DesignersPage";
import EntryPage from "./pages/EntryPage";
import WorkDetailPage from "./pages/WorkDetailPage";
import WorksPage from "./pages/WorksPage";
import {
  holdReveal,
  LOADING_REVEAL_DELAY_MS,
  releaseReveal,
} from "./utils/loadingReveal";
import { isPageContentPending, onPageContentReady } from "./utils/pageContent";

/* 관리자 화면은 따로 묶어 방문자 화면 번들에 Firebase SDK가 실리지 않게 한다. */
const AdminApp = lazy(() => import("./admin/AdminApp"));

const LOADING_DURATION = 1000;
const INTRO_LOADING_DURATION = 2000;
const LOADING_FADE_TIME = 1500;
const PROGRESS_SETTLE_TIME = 300;
const MEDIA_WAIT_LIMIT = 20000;

function isMediaReady(element) {
  if (element instanceof HTMLVideoElement) {
    return (
      element.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA ||
      element.error !== null
    );
  }

  return element.complete;
}

function ScrollToTop() {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}

function TimedLoadingScreen({ duration }) {
  const [loadingPhase, setLoadingPhase] = useState("visible");

  useLayoutEffect(() => {
    holdReveal();
    const revealTimer = window.setTimeout(
      releaseReveal,
      LOADING_REVEAL_DELAY_MS,
    );
    const leavingTimer = window.setTimeout(() => {
      setLoadingPhase("leaving");
    }, duration);

    return () => {
      window.clearTimeout(revealTimer);
      window.clearTimeout(leavingTimer);
      releaseReveal();
    };
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

/*
 * 새 페이지의 이미지와 영상이 이미 다 받아져 있으면 로딩 화면을 띄우지 않고,
 * 남은 것이 있으면 모두 로드될 때까지 실제 진행률로 보여 준다.
 * 페이지가 원격 콘텐츠를 기다리는 중이면 콘텐츠가 그려진 뒤에 센다.
 */
function MediaLoadingScreen() {
  const [loadingPhase, setLoadingPhase] = useState("visible");
  const [progress, setProgress] = useState(0);

  useLayoutEffect(() => {
    const isWaitingForContent = isPageContentPending();
    let isCancelled = false;
    let stopTracking = () => {};

    const trackMedia = () => {
      const media = [...document.querySelectorAll("main img, main video")];
      const pending = media.filter((element) => !isMediaReady(element));

      if (pending.length === 0 && !isWaitingForContent) {
        setLoadingPhase("hidden");
        return () => {};
      }

      holdReveal();
      let remaining = pending.length;
      let isFinished = false;
      let leavingTimer;
      let limitTimer;

      const finish = () => {
        if (isFinished) return;
        isFinished = true;
        setProgress(1);
        leavingTimer = window.setTimeout(() => {
          releaseReveal();
          setLoadingPhase("leaving");
        }, PROGRESS_SETTLE_TIME);
      };

      const settled = new Set();
      const handleSettled = (event) => {
        const element = event.currentTarget;
        if (settled.has(element)) return;
        settled.add(element);
        remaining -= 1;
        setProgress((media.length - remaining) / media.length);
        if (remaining === 0) finish();
      };

      if (remaining === 0) {
        finish();
      } else {
        setProgress((media.length - remaining) / media.length);
        pending.forEach((element) => {
          const readyEvent =
            element instanceof HTMLVideoElement ? "loadeddata" : "load";
          element.addEventListener(readyEvent, handleSettled);
          element.addEventListener("error", handleSettled);
        });
        limitTimer = window.setTimeout(finish, MEDIA_WAIT_LIMIT);
      }

      return () => {
        pending.forEach((element) => {
          element.removeEventListener("loadeddata", handleSettled);
          element.removeEventListener("load", handleSettled);
          element.removeEventListener("error", handleSettled);
        });
        window.clearTimeout(limitTimer);
        window.clearTimeout(leavingTimer);
        releaseReveal();
      };
    };

    if (!isWaitingForContent) {
      stopTracking = trackMedia();
      return () => stopTracking();
    }

    holdReveal();
    /* 콘텐츠를 놓는 시점은 React 커밋 도중이라, 커밋이 끝난 뒤 DOM을 센다. */
    const stopWaiting = onPageContentReady(() => {
      queueMicrotask(() => {
        if (!isCancelled) stopTracking = trackMedia();
      });
    });

    return () => {
      isCancelled = true;
      stopWaiting();
      stopTracking();
      releaseReveal();
    };
  }, []);

  if (loadingPhase === "hidden") return null;

  return (
    <LoadingScreen
      fadeDuration={LOADING_FADE_TIME}
      isLeaving={loadingPhase === "leaving"}
      onFadeComplete={() => setLoadingPhase("hidden")}
      progress={progress}
    />
  );
}

function RouteLoadingScreen({ mode }) {
  const [initialMode] = useState(mode);

  if (initialMode === "intro") {
    return <TimedLoadingScreen duration={INTRO_LOADING_DURATION} />;
  }

  if (initialMode === "fromIntro") {
    return <TimedLoadingScreen duration={LOADING_DURATION} />;
  }

  return <MediaLoadingScreen />;
}

function App() {
  const { pathname } = useLocation();
  const previousPathnameRef = useRef(null);
  const previousPathname = previousPathnameRef.current;
  let loadingMode = "media";
  if (pathname === "/") loadingMode = "intro";
  else if (previousPathname === "/") loadingMode = "fromIntro";

  useEffect(() => {
    previousPathnameRef.current = pathname;
  }, [pathname]);

  if (pathname.startsWith("/admin")) {
    return (
      <Suspense fallback={null}>
        <AdminApp />
      </Suspense>
    );
  }

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

      <RouteLoadingScreen key={pathname} mode={loadingMode} />
    </>
  );
}

export default App;
