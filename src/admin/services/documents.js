import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "../lib/firebase";

/* path는 "pages/about", "works/{id}"처럼 문서 경로다. 없으면 null. */
export async function getDocument(path) {
  const snapshot = await getDoc(doc(db, path));
  return snapshot.exists() ? snapshot.data() : null;
}

export async function saveDocument(path, content) {
  await setDoc(doc(db, path), {
    ...content,
    updatedAt: serverTimestamp(),
  });
}

export function deleteDocument(path) {
  return deleteDoc(doc(db, path));
}

/* 저장 전에 주소에 쓸 id가 필요해 Firestore 자동 id를 미리 받는다. */
export function createDocumentId(collectionId) {
  return doc(collection(db, collectionId)).id;
}

export async function listCollection(collectionId) {
  const snapshot = await getDocs(collection(db, collectionId));
  return snapshot.docs.map((item) => ({ id: item.id, data: item.data() }));
}

export async function saveOrder(collectionId, ids) {
  const batch = writeBatch(db);
  ids.forEach((id, order) => {
    batch.update(doc(db, collectionId, id), { order });
  });
  await batch.commit();
}

/* items는 { id, ...필드 } 배열이다. 한 번에 500개까지 쓸 수 있다. */
export async function createDocuments(collectionId, items) {
  const batch = writeBatch(db);
  items.forEach(({ id, ...data }) => {
    batch.set(doc(db, collectionId, id), { ...data, updatedAt: serverTimestamp() });
  });
  await batch.commit();
}
