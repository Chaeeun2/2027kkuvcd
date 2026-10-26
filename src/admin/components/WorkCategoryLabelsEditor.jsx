import { useCallback } from "react";
import { PRIMARY_WORK_CATEGORY_IDS } from "../../data/workCategoryLabels";
import {
  invalidateWorkCategoryFilters,
  normalizeWorkCategoriesDocument,
  WORK_CATEGORIES_DOCUMENT_PATH,
} from "../../content/workCategoriesContent";
import { invalidateWorks } from "../../content/worksContent";
import AdminModal from "./AdminModal";
import { TextField } from "./Fields";
import useDocumentEditor from "../hooks/useDocumentEditor";

function WorkCategoryLabelsModal({ onClose, onSaved }) {
  const editor = useDocumentEditor(
    WORK_CATEGORIES_DOCUMENT_PATH,
    normalizeWorkCategoriesDocument,
  );
  const { draft, error, isDirty, save, status, updateField } = editor;

  const tryClose = useCallback(() => {
    if (
      isDirty &&
      !window.confirm("저장하지 않은 변경이 있습니다. 닫을까요?")
    ) {
      return;
    }
    onClose();
  }, [isDirty, onClose]);

  const handleSave = async () => {
    const saved = await save();
    if (!saved) return;

    invalidateWorkCategoryFilters();
    invalidateWorks();
    onSaved?.();
    onClose();
  };

  const headerActions =
    status === "loading" || !draft ? null : (
      <>
        <button className="admin-button" onClick={tryClose} type="button">
          취소
        </button>
        <button
          className="admin-button admin-button--primary"
          disabled={!isDirty || status === "saving"}
          onClick={() => void handleSave()}
          type="button"
        >
          {status === "saving" ? "저장 중..." : "저장"}
        </button>
      </>
    );

  return (
    <AdminModal actions={headerActions} onClose={tryClose} title="작품 분류 관리">
      {status === "loading" || !draft ? (
        <p className="admin-empty">불러오는 중...</p>
      ) : (
        <>
          {error ? <p className="admin-error">{error}</p> : null}
          <div className="admin-stack">
            {PRIMARY_WORK_CATEGORY_IDS.map((id, index) => (
              <div className="admin-subsection" key={id}>
                <p className="admin-field__label">분류 {index + 1}</p>
                <div className="admin-field-row">
                  <TextField
                    label="국문"
                    onChange={(ko) =>
                      updateField("categories", {
                        ...draft.categories,
                        [id]: { ...draft.categories[id], ko },
                      })
                    }
                    value={draft.categories[id].ko}
                  />
                  <TextField
                    label="영문"
                    onChange={(en) =>
                      updateField("categories", {
                        ...draft.categories,
                        [id]: { ...draft.categories[id], en },
                      })
                    }
                    value={draft.categories[id].en}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </AdminModal>
  );
}

export default WorkCategoryLabelsModal;
