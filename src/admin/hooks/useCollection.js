import { useCallback, useEffect, useState } from "react";
import { listCollection } from "../services/documents";

/* 컬렉션 문서를 normalize한 뒤 order 순으로 정렬해 { id, ...필드 } 배열로 들고 있는다. */
function useCollection(collectionId, normalize) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState(null);

  const reload = useCallback(
    () =>
      listCollection(collectionId)
        .then((documents) =>
          setItems(
            documents
              .map(({ id, data }) => ({ ...normalize(data), id }))
              .sort((a, b) => a.order - b.order),
          ),
        )
        .catch((loadError) => setError(loadError.message)),
    [collectionId, normalize],
  );

  useEffect(() => {
    void reload();
  }, [reload]);

  return { error, items, reload, setItems };
}

export default useCollection;
