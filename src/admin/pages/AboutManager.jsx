import {
  ABOUT_DOCUMENT_PATH,
  normalizeAboutContent,
} from "../../content/aboutContent";
import { workWorlds } from "../../data/works";
import EditorHeader from "../components/EditorHeader";
import { BilingualField, EditorSection, TextField } from "../components/Fields";
import { ImageField, ImageListField } from "../components/ImageFields";
import RowListField from "../components/RowListField";
import useDocumentEditor from "../hooks/useDocumentEditor";

const MEDIA_FOLDER = "about";
const worlds = workWorlds.slice(1);

function FacultyEditor({ onChange, value }) {
  const updateTrack = (id, changes) =>
    onChange(
      value.map((track) =>
        track.id === id ? { ...track, ...changes } : track,
      ),
    );

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
              onClick={() =>
                onChange(value.filter((item) => item.id !== track.id))
              }
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
          onChange([
            ...value,
            { id: crypto.randomUUID(), title: "", courses: [] },
          ])
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
    return (
      <p className="admin-screen-message admin-error">
        불러오지 못했습니다: {error}
      </p>
    );
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
      <EditorHeader editor={editor} previewUrl="/about" title="ABOUT" />
      {error ? <p className="admin-error admin-page__error">{error}</p> : null}

      <div className="admin-page__body">
        <EditorSection title="배경 이미지 슬라이드">
          <ImageListField
            label="배경 이미지"
            showRule={false}
            {...imageField("backgrounds")}
          />
        </EditorSection>

        <EditorSection title="소개">
          <ImageField label="메인 이미지" {...imageField("introImage")} />
          <BilingualField label="전시명" multiline {...field("subtitle")} />
          <BilingualField
            label="소개글"
            multiline
            rows={8}
            {...field("body")}
          />
          <div className="admin-field-row">
            <TextField
              label="인스타그램 아이디"
              onChange={(label) =>
                updateField("instagram", { ...draft.instagram, label })
              }
              value={draft.instagram.label}
            />
            <TextField
              label="인스타그램 링크"
              onChange={(url) =>
                updateField("instagram", { ...draft.instagram, url })
              }
              type="url"
              value={draft.instagram.url}
            />
          </div>
        </EditorSection>

        <EditorSection title="전시 정보">
          <TextField
            label="전시 기간"
            placeholder="2026.10.30-11.02"
            {...field("date")}
          />
          <BilingualField
            label="전시명"
            multiline
            {...field("exhibitionTitle")}
          />
          <TextField label="일시" multiline rows={2} {...field("hours")} />
          <BilingualField label="장소" multiline {...field("venue")} />
        </EditorSection>

        <EditorSection title="슬라이드 갤러리">
          <ImageListField
            label="사진"
            showRule={false}
            {...imageField("gallery")}
          />
        </EditorSection>

        <EditorSection title="졸업준비위원회">
          <ImageField label="이미지" {...imageField("contributorImage")} />
          <RowListField
            addLabel="위원 추가"
            columns={[
              { name: "role", label: "직책" },
              {
                name: "name",
                label: "이름",
                placeholder: "이름이 여러 명이면 띄어쓰기로 구분",
              },
            ]}
            {...field("committee")}
          />
        </EditorSection>

        <EditorSection title="작품지도 교수님">
          <ImageField label="이미지" {...imageField("facultyImage")} />
          <FacultyEditor {...field("faculty")} />
        </EditorSection>

        <EditorSection title="후원">
          <ImageListField
            label="후원 로고"
            showRule={false}
            thumbShape="logo"
            {...imageField("supports")}
          />
        </EditorSection>

        <EditorSection title="이념">
          {worlds.map(({ id, label }) => (
            <BilingualField
              key={id}
              label={label}
              multiline
              onChange={(value) =>
                updateField("worldDescriptions", {
                  ...draft.worldDescriptions,
                  [id]: value,
                })
              }
              rows={4}
              value={draft.worldDescriptions[id]}
            />
          ))}
        </EditorSection>
      </div>
    </div>
  );
}

export default AboutManager;
