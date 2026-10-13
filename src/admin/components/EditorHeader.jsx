import { Link } from "react-router-dom";
import PageHeader from "./PageHeader";

/*
 * 편집 화면 제목 줄. 저장 상태와 되돌리기·저장 버튼을 단다.
 * back({ to, label })을 주면 저장하지 않은 변경사항을 확인한 뒤 목록으로 돌아가는 링크를 단다.
 */
function EditorHeader({ back, editor, previewUrl, title }) {
  const { isDirty, isUploading, revert, save, status } = editor;
  const isSaving = status === "saving";
  const isLocked = !isDirty || isSaving || isUploading;
  const statusText = isUploading
    ? "이미지를 올리는 중입니다. 끝나면 저장할 수 있습니다."
    : isDirty
      ? "저장하지 않은 변경사항이 있습니다."
      : "모든 변경사항이 저장되었습니다.";

  const confirmLeave = (event) => {
    if (isDirty && !window.confirm("저장하지 않은 변경사항이 사라집니다. 목록으로 갈까요?")) {
      event.preventDefault();
    }
  };

  return (
    <PageHeader
      before={
        back ? (
          <Link className="admin-back-link" onClick={confirmLeave} to={back.to}>
            ← {back.label}
          </Link>
        ) : null
      }
      status={statusText}
      title={title}
    >
      {previewUrl ? (
        <a className="admin-button" href={previewUrl} target="_blank" rel="noreferrer">
          페이지 보기
        </a>
      ) : null}
      <button
        className="admin-button"
        disabled={isLocked}
        onClick={revert}
        type="button"
      >
        되돌리기
      </button>
      <button
        className="admin-button admin-button--primary"
        disabled={isLocked}
        onClick={save}
        type="button"
      >
        {isSaving ? "저장 중..." : "저장"}
      </button>
    </PageHeader>
  );
}

export default EditorHeader;
