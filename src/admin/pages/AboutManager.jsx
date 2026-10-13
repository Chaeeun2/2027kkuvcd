import { ABOUT_DOCUMENT_PATH, normalizeAboutContent } from "../../content/aboutContent";
import EditorHeader from "../components/EditorHeader";
import { BilingualField, EditorSection, TextField } from "../components/Fields";
import { ImageField, ImageListField } from "../components/ImageFields";
import RowListField from "../components/RowListField";
import useDocumentEditor from "../hooks/useDocumentEditor";

const MEDIA_FOLDER = "about";

function FacultyEditor({ onChange, value }) {
  const updateTrack = (id, changes) =>
    onChange(value.map((track) => (track.id === id ? { ...track, ...changes } : track)));

  return (
    <div className="admin-stack">
      {value.map((track) => (
        <div className="admin-subsection" key={track.id}>
          <div className="admin-subsection__header">
            <TextField
              label="트랙 이름"
              onChange={(title) => updateTrack(track.id, { title })}
              value={track.title}
            />
            <button
              className="admin-button admin-button--danger admin-button--small"
              onClick={() => onChange(value.filter((item) => item.id !== track.id))}
              type="button"
            >
              트랙 삭제
            </button>
          </div>
          <RowListField
            addLabel="과목 추가"
            columns={[
              { name: "course", label: "과목" },
              { name: "professor", label: "교수님", placeholder: "OOO 교수님" },
            ]}
            onChange={(courses) => updateTrack(track.id, { courses })}
            value={track.courses}
          />
        </div>
      ))}
      <button
        className="admin-button"
        onClick={() =>
          onChange([...value, { id: crypto.randomUUID(), title: "", courses: [] }])
        }
        type="button"
      >
        + 트랙 추가
      </button>
    </div>
  );
}

function AboutManager() {
  const editor = useDocumentEditor(ABOUT_DOCUMENT_PATH, normalizeAboutContent);
  const { draft, error, status, trackUpload, updateField } = editor;

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
  });

  return (
    <div className="admin-page">
      <EditorHeader editor={editor} previewUrl="/about" title="전시소개" />
      {error ? <p className="admin-error admin-page__error">{error}</p> : null}

      <div className="admin-page__body">
        <EditorSection title="소개" description="페이지 첫 화면의 이미지와 소개 문구입니다.">
          <ImageField
            hint="권장 비율 370:523(세로형)"
            label="메인 이미지"
            {...imageField("introImage")}
          />
          <BilingualField
            hint="입력한 줄바꿈이 화면에서도 그대로 줄바꿈됩니다. PC에서는 영문만, 모바일에서는 선택한 언어로 보입니다."
            label="전시명"
            multiline
            {...field("subtitle")}
          />
          <BilingualField label="소개글" multiline rows={8} {...field("body")} />
          <div className="admin-field-row">
            <TextField
              label="인스타그램 표시 이름"
              onChange={(label) => updateField("instagram", { ...draft.instagram, label })}
              value={draft.instagram.label}
            />
            <TextField
              label="인스타그램 링크"
              onChange={(url) => updateField("instagram", { ...draft.instagram, url })}
              type="url"
              value={draft.instagram.url}
            />
          </div>
        </EditorSection>

        <EditorSection title="전시 정보" description="날짜 띠와 전시 정보 카드에 들어가는 내용입니다.">
          <TextField label="전시 기간" placeholder="2026.10.30-11.02" {...field("date")} />
          <BilingualField
            hint="PC 정보 카드에만 보입니다."
            label="정보 카드 전시명"
            multiline
            {...field("exhibitionTitle")}
          />
          <TextField label="관람 시간" multiline rows={2} {...field("hours")} />
          <BilingualField
            hint="PC 정보 카드에는 국문·영문이 모두, 모바일에는 선택한 언어만 보입니다."
            label="장소"
            multiline
            {...field("venue")}
          />
        </EditorSection>

        <EditorSection
          title="전시 준비 사진"
          description="PC에서는 전체 사진이 옆으로 흐르고, 모바일에서는 앞의 3장만 보입니다."
        >
          <ImageListField
            hint="권장 비율 3:4. 드래그해서 순서를 바꿀 수 있습니다."
            label="사진"
            {...imageField("gallery")}
          />
        </EditorSection>

        <EditorSection
          title="졸업준비위원회"
          description="입력한 순서대로 앞의 절반은 왼쪽 열, 나머지는 오른쪽 열에 보입니다."
        >
          <RowListField
            addLabel="위원 추가"
            columns={[
              { name: "role", label: "직책" },
              { name: "name", label: "이름", placeholder: "이름이 여러 명이면 띄어쓰기로 구분" },
            ]}
            {...field("committee")}
          />
        </EditorSection>

        <EditorSection title="작품지도 교수님">
          <FacultyEditor {...field("faculty")} />
        </EditorSection>

        <EditorSection title="후원">
          <ImageListField
            hint="로고는 높이를 맞춰 보여 주므로 위아래 여백 없이 자른 PNG나 SVG를 권장합니다."
            label="후원 로고"
            thumbShape="logo"
            {...imageField("supports")}
          />
        </EditorSection>
      </div>
    </div>
  );
}

export default AboutManager;
