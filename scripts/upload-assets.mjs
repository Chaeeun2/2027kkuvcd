/*
 * src/assets 파일을 R2(kkuvcd-2027-media 버킷)의 static/ 아래로 올리고
 * src/content/assetManifest.json에 "파일명 → R2 키"를 기록한다.
 * 키에 내용 해시가 들어가므로 파일을 바꾸면 새 키로 올라가고, 바뀌지 않은 파일은 건너뛴다.
 *
 *   npm run upload-assets
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const ASSETS_DIR = join(ROOT, "src/assets");
const MANIFEST_PATH = join(ROOT, "src/content/assetManifest.json");
const WORKER_DIR = join(ROOT, "workers/media");
const BUCKET = "kkuvcd-2027-media";

const CONTENT_TYPES = {
  ".avif": "image/avif",
  ".gif": "image/gif",
  ".glb": "model/gltf-binary",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
};

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

const previous = existsSync(MANIFEST_PATH)
  ? JSON.parse(readFileSync(MANIFEST_PATH, "utf8"))
  : {};
const manifest = {};

const files = readdirSync(ASSETS_DIR)
  .filter((name) => !name.startsWith("."))
  .sort();

for (const name of files) {
  const extension = extname(name).toLowerCase();
  const contentType = CONTENT_TYPES[extension];
  if (!contentType) {
    console.warn(`건너뜀 (지원하지 않는 형식): ${name}`);
    continue;
  }

  const path = join(ASSETS_DIR, name);
  const hash = createHash("sha256").update(readFileSync(path)).digest("hex").slice(0, 8);
  const key = `static/${slugify(name.slice(0, -extension.length))}.${hash}${extension}`;
  manifest[name] = key;

  if (previous[name] === key) continue;

  console.log(`업로드: ${name} → ${key}`);
  execFileSync(
    "npx",
    [
      "wrangler",
      "r2",
      "object",
      "put",
      `${BUCKET}/${key}`,
      "--file",
      path,
      "--content-type",
      contentType,
      "--remote",
    ],
    { cwd: WORKER_DIR, stdio: ["ignore", "ignore", "inherit"] },
  );
}

writeFileSync(MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(`완료: ${Object.keys(manifest).length}개 파일, ${MANIFEST_PATH}`);
