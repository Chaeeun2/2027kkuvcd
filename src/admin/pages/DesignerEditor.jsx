import { Link, useParams } from "react-router-dom";
import { DESIGNERS_COLLECTION, normalizeDesigner } from "../../content/designersContent";
import { normalizeWork, WORKS_COLLECTION } from "../../content/worksContent";
import EditorHeader from "../components/EditorHeader";
import { EditorSection, TextField } from "../components/Fields";
import { ImageField } from "../components/ImageFields";
import useCollection from "../hooks/useCollection";
import useDocumentEditor from "../hooks/useDocumentEditor";

const MEDIA_FOLDER = "designers";

function validateDesigner(designer) {
  if (!designer.koreanName.trim()) return "국문 이름을 입력해 주세요.";
  if (!designer.englishName.trim()) return "영문 이름을 입력해 주세요.";
  return null;
}

/* 작품 연결은 작품 편집 화면에서 디자이너를 고르는 방식으로 한다. */
function LinkedWorks({ designerId }) {
  const { items } = useCollection(WORKS_COLLECTION, normalizeWork);
  const linkedWorks = items?.filter((work) => work.designerIds.includes(designerId));

  if (!linkedWorks) return <p className="admin-empty">불러오는 중...</p>;
  if (linkedWorks.length === 0) {
    return <p className="admin-empty">연결된 작품이 없습니다.</p>;
  }

  return (
    <ul className="admin-link-list">
      {linkedWorks.map((work) => (
        <li key={work.id}>
          <Link to={`/admin/works/${work.id}`}>{work.title || "제목 없음"}</Link>
          <span className={`admin-badge${work.published ? " is-on" : ""}`}>
            {work.published ? "공개" : "비공개"}
          </span>
        </li>
      ))}
    </ul>
  );
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
        back={{ to: "/admin/designers", label: "디자이너 목록" }}
        editor={editor}
        previewUrl={exists ? `/designers/${designerId}` : null}
        title={exists ? draft.koreanName || "이름 없는 디자이너" : "새 디자이너"}
      />
      {error ? <p className="admin-error admin-page__error">{error}</p> : null}

      <div className="admin-page__body">
        <EditorSection title="기본 정보" description="디자이너 목록 카드와 상세 페이지에 보입니다.">
          <div className="admin-field-row">
            <TextField label="국문 이름" {...field("koreanName")} />
            <TextField
              hint="대문자로 입력합니다. 카드에는 그대로, 상세 페이지에는 'Seungmin Lee'처럼 보입니다."
              label="영문 이름"
              placeholder="SEUNGMIN LEE"
              {...field("englishName")}
              onChange={(value) => updateField("englishName", value.toUpperCase())}
            />
          </div>
        </EditorSection>

        <EditorSection title="이미지">
          <ImageField
            hint="권장 비율 3:4. PC 상세 페이지와 모바일 디자이너 목록에 쓰입니다."
            label="프로필 사진"
            thumbShape="portrait"
            {...imageField("profileImage")}
          />
          <ImageField
            hint="배경이 투명한 PNG를 권장합니다. PC 상세 페이지에만 보입니다."
            label="서명"
            thumbShape="signature"
            {...imageField("signatureImage")}
          />
          <ImageField
            hint="권장 크기 1233×774. 배경색과 서명이 들어간 카드 이미지를 올리면 PC 목록에서 그 위에 이름이 얹힙니다. 비우면 목록 순서대로 기본 파랑·회색 카드가 쓰입니다."
            label="아이디카드 앞면"
            thumbShape="card"
            {...imageField("cardFront")}
          />
          <ImageField
            hint="권장 크기 1233×774. PC 목록에서 카드를 뒤집으면 보이고, 모바일 상세 페이지 맨 위에 쓰입니다. 비우면 기본 뒷면이 쓰입니다."
            label="아이디카드 뒷면"
            thumbShape="card"
            {...imageField("cardBack")}
          />
        </EditorSection>

        <EditorSection title="연락처" description="비워 두면 상세 페이지에 '준비 중'으로 보입니다.">
          <div className="admin-field-row">
            <TextField label="이메일" type="email" {...field("email")} />
            <TextField label="인스타그램" placeholder="@account" {...field("instagram")} />
          </div>
        </EditorSection>

        <EditorSection title="소개">
          <TextField
            hint="입력한 줄바꿈이 화면에서도 그대로 줄바꿈됩니다."
            label="Statement"
            multiline
            rows={8}
            {...field("statement")}
          />
        </EditorSection>

        <EditorSection
          title="작품"
          description="작품 편집 화면에서 이 디자이너를 고르면 여기와 사이트 디자이너 페이지에 나타납니다."
        >
          <LinkedWorks designerId={designerId} />
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
