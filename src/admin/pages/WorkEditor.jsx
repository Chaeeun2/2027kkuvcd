import { useParams } from "react-router-dom";
import { normalizeWork, WORKS_COLLECTION } from "../../content/worksContent";
import { categoryLabels, workWorlds } from "../../data/works";
import EditorHeader from "../components/EditorHeader";
import {
  BilingualField,
  ChoiceField,
  EditorSection,
  SwitchField,
  TextField,
} from "../components/Fields";
import GalleryRowsField from "../components/GalleryRowsField";
import { ImageField } from "../components/ImageFields";
import useDesigners from "../hooks/useDesigners";
import useDocumentEditor from "../hooks/useDocumentEditor";

const MEDIA_FOLDER = "works";

const categoryOptions = Object.entries(categoryLabels).map(([id, label]) => ({ id, label }));
const worldOptions = workWorlds.slice(1).map(({ id, label }) => ({ id, label }));

/* 공개하는 작품은 사이트에 빈칸이 보이지 않도록 필수 항목을 확인한다. */
function validateWork(work) {
  if (!work.published) return null;
  if (!work.title.trim()) return "공개하려면 작품명을 입력해 주세요.";
  if (work.designerIds.length === 0) return "공개하려면 디자이너를 한 명 이상 골라 주세요.";
  if (work.categoryIds.length === 0) return "공개하려면 카테고리를 하나 이상 골라 주세요.";
  if (!work.worldType) return "공개하려면 World를 골라 주세요.";
  return null;
}

function WorkEditor({ workId }) {
  const editor = useDocumentEditor(`${WORKS_COLLECTION}/${workId}`, normalizeWork, {
    validate: validateWork,
  });
  const { draft, error, exists, status, trackUpload, updateField } = editor;
  const { designers } = useDesigners();

  if (status === "loading") {
    return <p className="admin-screen-message">불러오는 중...</p>;
  }

  if (!draft) {
    return <p className="admin-screen-message admin-error">불러오지 못했습니다: {error}</p>;
  }

  const field = (name) => ({
    value: draft[name],
    onChange: (value) => updateField(name, value),
  });
  const mediaProps = { folder: MEDIA_FOLDER, trackUpload };

  return (
    <div className="admin-page">
      <EditorHeader
        back={{ to: "/admin/works", label: "작품 목록" }}
        editor={editor}
        previewUrl={exists && draft.published ? `/works/${workId}` : null}
        title={exists ? draft.title || "제목 없는 작품" : "새 작품"}
      />
      {error ? <p className="admin-error admin-page__error">{error}</p> : null}

      <div className="admin-page__body">
        <EditorSection title="공개">
          <SwitchField
            checked={draft.published}
            hint="켜고 저장하면 사이트 작품 목록에 보입니다. 공개한 작품이 하나도 없으면 사이트에는 임시 작품이 보입니다."
            label="사이트에 공개"
            {...field("published")}
          />
        </EditorSection>

        <EditorSection title="기본 정보" description="작품 목록 카드와 상세 페이지 제목 영역에 보입니다.">
          <TextField label="작품명" {...field("title")} />
          <ChoiceField
            hint="여러 명이 함께한 작품이면 모두 고릅니다. 고른 디자이너 페이지에 이 작품이 함께 보입니다."
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
          <ChoiceField label="World" options={worldOptions} {...field("worldType")} />
        </EditorSection>

        <EditorSection title="썸네일" description="작품 목록, 디자이너 페이지, 관련 작품에 쓰입니다.">
          <ImageField
            hint="권장 비율 3:2(가로형)"
            removable
            thumbShape="landscape"
            {...mediaProps}
            {...field("thumbnail")}
          />
        </EditorSection>

        <EditorSection title="작품 설명" description="PC에서는 국문·영문이 모두, 모바일에서는 선택한 언어만 보입니다.">
          <BilingualField label="설명" multiline rows={8} {...field("description")} />
        </EditorSection>

        <EditorSection
          title="상세 이미지"
          description="상세 페이지 오른쪽에 위에서부터 쌓입니다. 한 장은 845:562, 두 장은 각각 410:563 비율을 권장합니다."
        >
          <GalleryRowsField {...mediaProps} {...field("gallery")} />
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
