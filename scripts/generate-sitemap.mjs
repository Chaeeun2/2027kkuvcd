/*
 * 빌드 뒤 dist/sitemap.xml을 만든다. 디자이너와 공개 작품 상세 주소는 Firestore에서 읽는다.
 * DB를 읽지 못하면 고정 페이지만 넣고 빌드는 계속한다.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const SITE_URL = "https://www.2027kkuvcd.com";
const PROJECT_ID = "kkuvcd-2027-web";
const OUTPUT_PATH = fileURLToPath(new URL("../dist/sitemap.xml", import.meta.url));
const STATIC_PATHS = ["/", "/about", "/designers", "/works"];

async function queryIds(collectionId, where) {
  const structuredQuery = { from: [{ collectionId }], select: { fields: [] } };
  if (where) {
    structuredQuery.where = {
      fieldFilter: {
        field: { fieldPath: where.field },
        op: "EQUAL",
        value: { booleanValue: where.value },
      },
    };
  }

  const response = await fetch(
    `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ structuredQuery }),
      signal: AbortSignal.timeout(10000),
    },
  );
  if (!response.ok) throw new Error(`Firestore ${response.status}`);

  const results = await response.json();
  return results
    .filter((result) => result.document)
    .map(({ document }) => document.name.split("/").pop());
}

let dynamicPaths = [];
try {
  const [designerIds, workIds] = await Promise.all([
    queryIds("designers"),
    queryIds("works", { field: "published", value: true }),
  ]);
  dynamicPaths = [
    ...designerIds.map((id) => `/designers/${encodeURIComponent(id)}`),
    ...workIds.map((id) => `/works/${encodeURIComponent(id)}`),
  ];
} catch (error) {
  console.warn(`사이트맵: DB를 읽지 못해 고정 페이지만 넣습니다 (${error.message})`);
}

const today = new Date().toISOString().slice(0, 10);
const urls = [...STATIC_PATHS, ...dynamicPaths]
  .map((path) => `  <url>\n    <loc>${SITE_URL}${path}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`)
  .join("\n");

writeFileSync(
  OUTPUT_PATH,
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
);
console.log(`사이트맵: ${STATIC_PATHS.length + dynamicPaths.length}개 주소`);
