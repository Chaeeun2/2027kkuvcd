import { firebaseConfig } from "../config/firebase";

/*
 * 방문자 화면은 문서 몇 개만 읽으면 되므로 Firebase SDK 대신 REST로 읽어
 * 번들에 SDK가 실리지 않게 한다.
 */
function decodeValue(value) {
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("timestampValue" in value) return value.timestampValue;
  if ("mapValue" in value) return decodeFields(value.mapValue.fields ?? {});
  if ("arrayValue" in value) {
    return (value.arrayValue.values ?? []).map(decodeValue);
  }
  return null;
}

function decodeFields(fields) {
  return Object.fromEntries(
    Object.entries(fields).map(([name, value]) => [name, decodeValue(value)]),
  );
}

function documentsUrl(path) {
  const url = new URL(
    `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/(default)/documents${path}`,
  );
  url.searchParams.set("key", firebaseConfig.apiKey);
  return url;
}

export async function fetchFirestoreDocument(path, { timeout = 8000 } = {}) {
  const response = await fetch(documentsUrl(`/${path}`), {
    signal: AbortSignal.timeout(timeout),
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Firestore ${response.status}`);

  const document = await response.json();
  return decodeFields(document.fields ?? {});
}

/*
 * 컬렉션 문서를 { id, ...필드 } 배열로 돌려준다.
 * where를 주면 불리언 field가 value인 문서만 고른다.
 */
export async function queryFirestoreCollection(
  collectionId,
  { where, timeout = 8000 } = {},
) {
  const structuredQuery = { from: [{ collectionId }] };
  if (where) {
    structuredQuery.where = {
      fieldFilter: {
        field: { fieldPath: where.field },
        op: "EQUAL",
        value: { booleanValue: where.value },
      },
    };
  }

  const response = await fetch(documentsUrl(":runQuery"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ structuredQuery }),
    signal: AbortSignal.timeout(timeout),
  });
  if (!response.ok) throw new Error(`Firestore ${response.status}`);

  const results = await response.json();
  return results
    .filter((result) => result.document)
    .map(({ document }) => ({
      id: document.name.split("/").pop(),
      ...decodeFields(document.fields ?? {}),
    }));
}
