import { Navigate } from "react-router-dom";
import { createDocumentId } from "../services/documents";

/* 새 문서는 주소에 쓸 id를 먼저 정한 뒤 편집 화면으로 보낸다. 저장해야 DB에 생긴다. */
function NewDocumentRedirect({ basePath, collectionId }) {
  return <Navigate to={`${basePath}/${createDocumentId(collectionId)}`} replace />;
}

export default NewDocumentRedirect;
