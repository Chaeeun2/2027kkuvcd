import { MEDIA_API_URL } from "../config/firebase";
import manifest from "./assetManifest.json";

/* src/assets 파일명으로 R2 주소를 만든다. 목록은 npm run upload-assets가 갱신한다. */
export function assetUrl(fileName) {
  const key = manifest[fileName];
  if (!key) throw new Error(`R2에 올라가지 않은 파일입니다: ${fileName}`);
  return `${MEDIA_API_URL}/media/${key}`;
}
