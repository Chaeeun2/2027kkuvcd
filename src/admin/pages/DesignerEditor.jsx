import { useParams } from "react-router-dom";
import { DESIGNERS_COLLECTION, normalizeDesigner } from "../../content/designersContent";
import EditorHeader from "../components/EditorHeader";
import { EditorSection, TextField } from "../components/Fields";
import { ImageField } from "../components/ImageFields";
import useDocumentEditor from "../hooks/useDocumentEditor";

const MEDIA_FOLDER = "designers";

function validateDesigner(designer) {
  if (!designer.koreanName.trim()) return "국문 이름을 입력해 주세요.";
  if (!designer.englishName.trim()) return "영문 이름을 입력해 주세요.";
  return null;
}

function DesignerEditor({ designerId }) {
  const editor = useDocumentEditor(`${DESIGNERS_COLLECTION}/${designerId}`, normalizeDesigner, {
    validate: validateDesigner,
  });
  const { draft, error, exists, status, trackUpload, updateField } = editor;

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
  const imageField = (name) => ({
    ...field(name),
    folder: MEDIA_FOLDER,
    trackUpload,
    removable: true,
  });

  return (
    <div className="admin-page">
      <EditorHeader
        back={{ to: "/admin/designers", label: "DESIGNERS" }}
        editor={editor}
        previewUrl={exists ? `/designers/${designerId}` : null}
        title={exists ? draft.koreanName || "이름 없는 디자이너" : "새 디자이너"}
      />
      {error ? <p className="admin-error admin-page__error">{error}</p> : null}

      <div className="admin-page__body">
        <EditorSection title="기본 정보">
          <div className="admin-field-row">
            <TextField label="국문 이름" {...field("koreanName")} />
            <TextField
              label="영문 이름"
              placeholder="SEUNGMIN LEE"
              {...field("englishName")}
              onChange={(value) => updateField("englishName", value.toUpperCase())}
            />
          </div>
        </EditorSection>

        <EditorSection title="이미지">
          <ImageField
            label="프로필 사진"
            thumbShape="portrait"
            {...imageField("profileImage")}
          />
          <ImageField
            label="서명"
            thumbShape="signature"
            {...imageField("signatureImage")}
          />
          <ImageField
            label="아이디카드 앞면"
            thumbShape="card"
            {...imageField("cardFront")}
          />
          <ImageField
            label="아이디카드 뒷면"
            thumbShape="card"
            {...imageField("cardBack")}
          />
        </EditorSection>

        <EditorSection title="연락처">
          <div className="admin-field-row">
            <TextField label="이메일" type="email" {...field("email")} />
            <TextField label="인스타그램" placeholder="@account" {...field("instagram")} />
          </div>
        </EditorSection>

        <EditorSection title="소개">
          <TextField
            label="Statement"
            multiline
            rows={8}
            {...field("statement")}
          />
        </EditorSection>
      </div>
    </div>
  );
}

/* 다른 디자이너로 옮기면 업로드 추적까지 새로 시작하도록 id마다 새로 만든다. */
function DesignerEditorPage() {
  const { designerId } = useParams();
  return <DesignerEditor designerId={designerId} key={designerId} />;
}

export default DesignerEditorPage;
