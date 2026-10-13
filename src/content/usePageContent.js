import { useLayoutEffect, useState } from "react";
import { holdPageContent } from "../utils/pageContent";

/*
 * 캐시된 콘텐츠가 있으면 바로 쓰고, 없으면 불러오는 동안 로딩 화면을 붙잡는다.
 * 로딩 화면보다 먼저 실행되도록 layout effect에서 잡는다.
 */
function usePageContent(getCached, load) {
  const [content, setContent] = useState(getCached);

  useLayoutEffect(() => {
    if (content) return undefined;

    const release = holdPageContent();
    let isActive = true;

    load().then((nextContent) => {
      if (isActive) setContent(nextContent);
    });

    return () => {
      isActive = false;
      release();
    };
  }, [content, load]);

  return content;
}

export default usePageContent;
