import { DESIGNERS_COLLECTION, normalizeDesigner } from "../../content/designersContent";
import { defaultDesigners } from "../../data/designers";
import useCollection from "./useCollection";

/*
 * DB 디자이너 목록. 아직 기본 디자이너를 불러오지 않았으면 사이트와 같은 기본 목록을 쓴다.
 * isDefault로 어느 쪽인지 알 수 있다.
 */
function useDesigners() {
  const collection = useCollection(DESIGNERS_COLLECTION, normalizeDesigner);
  const isDefault = collection.items?.length === 0;

  return {
    ...collection,
    designers: isDefault ? defaultDesigners : collection.items,
    isDefault,
  };
}

export default useDesigners;
