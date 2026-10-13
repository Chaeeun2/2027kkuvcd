import { isFirebaseConfigured } from "../config/firebase";

/*
 * 한 번 불러온 콘텐츠는 페이지를 옮겨 다녀도 다시 받지 않는다.
 * 불러오기에 실패하면 기본 콘텐츠를 보여 주되 캐시하지 않아 다음 방문 때 다시 시도한다.
 */
function createCachedLoader(fetchContent, fallback) {
  let cachedContent = isFirebaseConfigured ? null : fallback;
  let pendingRequest = null;

  const getCached = () => cachedContent;

  const load = () => {
    if (cachedContent) return Promise.resolve(cachedContent);

    pendingRequest ??= fetchContent()
      .then((content) => {
        cachedContent = content;
        return content;
      })
      .catch(() => fallback)
      .finally(() => {
        pendingRequest = null;
      });

    return pendingRequest;
  };

  return { getCached, load };
}

export default createCachedLoader;
