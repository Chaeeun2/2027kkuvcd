import { useParams } from "react-router-dom";
import { normalizeWork, WORKS_COLLECTION } from "../../content/worksContent";
import { PRIMARY_WORK_CATEGORY_IDS } from "../../data/workCategoryLabels";
import { workWorlds } from "../../data/works";
import useWorkCategoryLabelMap from "../hooks/useWorkCategoryLabelMap";
import EditorHeader from "../components/EditorHeader";
import {
  BilingualField,
  ChoiceField,
  EditorSection,
  SwitchField,
  TextField,
} from "../components/Fields";
import { ImageField, ImageListField } from "../components/ImageFields";
import useDesigners from "../hooks/useDesigners";
import useDocumentEditor from "../hooks/useDocumentEditor";

const MEDIA_FOLDER = "works";

const worldOptions = workWorlds
  .slice(1)
  .map(({ id, label }) => ({ id, label }));

/* 공개하는 작품은 사이트에 빈칸이 보이지 않도록 필수 항목을 확인한다. */
function validateWork(work) {
  if (!work.published) return null;
  if (!work.title.trim()) return "공개하려면 작품명을 입력해 주세요.";
  if (work.designerIds.length === 0)
    return "공개하려면 디자이너를 한 명 이상 골라 주세요.";
  if (work.categoryIds.length === 0)
    return "공개하려면 카테고리를 하나 이상 골라 주세요.";
  if (!work.worldType) return "공개하려면 이념을 골라 주세요.";
  return null;
}

function WorkEditor({ workId }) {
  const editor = useDocumentEditor(
    `${WORKS_COLLECTION}/${workId}`,
    normalizeWork,
    {
      validate: validateWork,
    },
  );
  const { draft, error, exists, status, trackUpload, updateField } = editor;
  const { designers, error: designersError } = useDesigners();
  const { labelMap } = useWorkCategoryLabelMap();
  const categoryOptions = PRIMARY_WORK_CATEGORY_IDS.map((id) => ({
    id,
    label: `${labelMap[id].ko} (${labelMap[id].en})`,
  }));
  const loadError = status === "error" ? error : designersError;

  if (loadError) {
    return (
      <p className="admin-screen-message admin-error">
        불러오지 못했습니다: {loadError}
      </p>
    );
  }

  if (status === "loading" || !designers) {
    return <p className="admin-screen-message">불러오는 중...</p>;
  }

  const field = (name) => ({
    value: draft[name],
    onChange: (value) => updateField(name, value),
  });
  const mediaProps = { folder: MEDIA_FOLDER, trackUpload };

  return (
    <div className="admin-page">
      <EditorHeader
        back={{ to: "/admin/works", label: "WORKS" }}
        editor={editor}
        previewUrl={exists && draft.published ? `/works/${workId}` : null}
        title={exists ? draft.title || "제목 없는 작품" : "새 작품"}
      />
      {error ? <p className="admin-error admin-page__error">{error}</p> : null}

      <div className="admin-page__body">
        <EditorSection title="공개">
          <SwitchField
            checked={draft.published}
            label="사이트에 공개"
            {...field("published")}
          />
        </EditorSection>

        <EditorSection title="기본 정보">
          <TextField label="작품명" {...field("title")} />
          <ChoiceField
            label="디자이너"
            multiple
            options={designers.map((designer) => ({
              id: designer.id,
              label: designer.koreanName,
            }))}
            {...field("designerIds")}
          />
          <ChoiceField
            label="카테고리"
            multiple
            options={categoryOptions}
            {...field("categoryIds")}
          />
          <ChoiceField
            label="이념"
            options={worldOptions}
            {...field("worldType")}
          />
        </EditorSection>

        <EditorSection title="썸네일">
          <ImageField
            removable
            thumbShape="landscape"
            {...mediaProps}
            {...field("thumbnail")}
          />
        </EditorSection>

        <EditorSection title="작품 설명">
          <BilingualField
            label="설명"
            multiline
            rows={8}
            {...field("description")}
          />
        </EditorSection>

        <EditorSection title="상세 이미지">
          <ImageListField
            label="이미지"
            showRule={false}
            thumbShape="landscape"
            {...mediaProps}
            {...field("gallery")}
          />
        </EditorSection>
      </div>
    </div>
  );
}

/* 다른 작품으로 옮기면 업로드 추적까지 새로 시작하도록 id마다 새로 만든다. */
function WorkEditorPage() {
  const { workId } = useParams();
  return <WorkEditor key={workId} workId={workId} />;
}

export default WorkEditorPage;
