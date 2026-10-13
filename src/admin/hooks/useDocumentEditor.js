import { useCallback, useEffect, useRef, useState } from "react";
import { getDocument, saveDocument } from "../services/documents";
import { collectMediaKeys, deleteImages } from "../services/media";

const difference = (keys, excluded) =>
  [...keys].filter((key) => !excluded.has(key));

/*
 * Firestore 문서 하나를 불러와 고치고 저장한다.
 * 이미지는 고르는 즉시 R2에 올라가므로, 저장되지 않은 업로드와 저장으로
 * 빠진 이미지를 추적해 지운다. 저장 전까지 기존 파일은 지우지 않는다.
 * validate(draft)가 문자열을 돌려주면 그 메시지를 보여 주고 저장하지 않는다.
 */
function useDocumentEditor(path, normalize, { validate } = {}) {
  const [saved, setSaved] = useState(null);
  const [draft, setDraft] = useState(null);
  const [exists, setExists] = useState(false);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [pendingUploads, setPendingUploads] = useState(0);
  const sessionUploads = useRef(new Set());
  const savedRef = useRef(null);
  const isUnmounted = useRef(false);

  useEffect(() => {
    let isActive = true;

    getDocument(path)
      .then((data) => {
        if (!isActive) return;
        const content = normalize(data);
        savedRef.current = content;
        setSaved(content);
        setDraft(content);
        setExists(data !== null);
        setStatus("ready");
      })
      .catch((loadError) => {
        if (!isActive) return;
        setError(loadError.message);
        setStatus("error");
      });

    return () => {
      isActive = false;
    };
  }, [path, normalize]);

  useEffect(() => {
    const uploads = sessionUploads.current;
    isUnmounted.current = false;
    return () => {
      isUnmounted.current = true;
      const unsaved = difference(uploads, collectMediaKeys(savedRef.current));
      if (unsaved.length > 0) void deleteImages(unsaved);
    };
  }, []);

  const isDirty =
    draft !== null && JSON.stringify(draft) !== JSON.stringify(saved);

  useEffect(() => {
    if (!isDirty) return undefined;
    const warn = (event) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);

  const updateField = useCallback((name, value) => {
    setDraft((current) => ({ ...current, [name]: value }));
  }, []);

  /*
   * 업로드가 끝나기 전에 저장하면 새 이미지가 저장에서 빠지므로 끝날 때까지 저장을 막는다.
   * upload는 올라간 이미지 배열로 끝나는 Promise다.
   */
  const trackUpload = useCallback((upload) => {
    setPendingUploads((count) => count + 1);
    upload
      .then((images) => {
        const keys = images.map((image) => image.key);
        if (isUnmounted.current) void deleteImages(keys);
        else keys.forEach((key) => sessionUploads.current.add(key));
      })
      .finally(() => setPendingUploads((count) => count - 1));
  }, []);

  const save = useCallback(async () => {
    const validationError = validate?.(draft);
    if (validationError) {
      setError(validationError);
      return;
    }

    setStatus("saving");
    setError(null);

    try {
      await saveDocument(path, draft);
      const keptKeys = collectMediaKeys(draft);
      const candidates = new Set([
        ...collectMediaKeys(savedRef.current),
        ...sessionUploads.current,
      ]);
      const removed = difference(candidates, keptKeys);

      sessionUploads.current.clear();
      savedRef.current = draft;
      setSaved(draft);
      setExists(true);
      setStatus("ready");
      if (removed.length > 0) await deleteImages(removed);
    } catch (saveError) {
      setError(saveError.message);
      setStatus("ready");
    }
  }, [draft, path, validate]);

  const revert = useCallback(() => {
    const unsaved = difference(
      sessionUploads.current,
      collectMediaKeys(savedRef.current),
    );
    sessionUploads.current.clear();
    setDraft(savedRef.current);
    setError(null);
    if (unsaved.length > 0) void deleteImages(unsaved);
  }, []);

  return {
    draft,
    error,
    exists,
    isDirty,
    isUploading: pendingUploads > 0,
    revert,
    save,
    status,
    trackUpload,
    updateField,
  };
}

export default useDocumentEditor;
