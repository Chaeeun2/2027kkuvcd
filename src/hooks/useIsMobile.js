import { useEffect, useState } from "react";

/*
 * 모바일 시안은 PC와 DOM 구조 자체가 다른 화면이 있어서(디자이너 목록의 세로
 * 사진, 상세 상단의 아이디카드) CSS만으로는 갈라낼 수 없다. 이 값은 styles.css의
 * 모바일 미디어 쿼리와 같은 경계를 써야 한다.
 */
const MOBILE_QUERY = "(max-width: 767px)";

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => window.matchMedia(MOBILE_QUERY).matches,
  );

  useEffect(() => {
    const query = window.matchMedia(MOBILE_QUERY);
    const update = (event) => setIsMobile(event.matches);

    setIsMobile(query.matches);
    query.addEventListener("change", update);

    return () => query.removeEventListener("change", update);
  }, []);

  return isMobile;
}

export default useIsMobile;
