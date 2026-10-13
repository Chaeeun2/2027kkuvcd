import { useRef, useState } from "react";
import { resolveImageSrc } from "../../content/defaultAssets";
import { IMAGE_TYPES, uploadImage, validateImageFile } from "../services/media";
import SortableList from "./SortableList";

const fulfilledValues = (results) =>
  results.filter((result) => result.status === "fulfilled").map((result) => result.value);

/*
 * 파일을 고르면 바로 업로드하고, 끝난 이미지들을 onUploaded로 넘긴다.
 * 진행 중인 업로드는 trackUpload로 편집기에 알려 그동안 저장을 막는다.
 */
function UploadButton({
  children,
  folder,
  multiple = false,
  onUploaded,
  trackUpload,
  variant,
}) {
  const inputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = async (event) => {
    const files = [...event.target.files];
    event.target.value = "";
    if (files.length === 0) return;

    setError(null);
    try {
      files.forEach(validateImageFile);
    } catch (validationError) {
      setError(validationError.message);
      return;
    }

    setIsUploading(true);
    const upload = Promise.allSettled(files.map((file) => uploadImage(file, folder)));
    trackUpload(upload.then(fulfilledValues));
    const results = await upload;
    setIsUploading(false);

    const images = fulfilledValues(results);
    const failure = results.find((result) => result.status === "rejected");

    if (images.length > 0) onUploaded(images);
    if (failure) setError(failure.reason.message);
  };

  return (
    <div className="admin-upload">
      <button
        className={`admin-button${variant ? ` admin-button--${variant}` : ""}`}
        disabled={isUploading}
        onClick={() => inputRef.current.click()}
        type="button"
      >
        {isUploading ? "업로드 중..." : children}
      </button>
      <input
        accept={IMAGE_TYPES.join(",")}
        hidden
        multiple={multiple}
        onChange={handleChange}
        ref={inputRef}
        type="file"
      />
      {error ? <p className="admin-error">{error}</p> : null}
    </div>
  );
}

function Thumb({ shape, src }) {
  const className = `admin-thumb${shape ? ` admin-thumb--${shape}` : ""}`;
  return src ? (
    <img className={className} src={resolveImageSrc(src)} alt="" />
  ) : (
    <span className={`${className} admin-thumb--empty`}>이미지 없음</span>
  );
}

/* removable이면 이미지를 비울 수 있고, value는 이미지 또는 null이다. */
export function ImageField({
  folder,
  hint,
  label,
  onChange,
  removable = false,
  thumbShape,
  trackUpload,
  value,
}) {
  return (
    <div className="admin-field">
      {label ? <span className="admin-field__label">{label}</span> : null}
      <div className="admin-image-field">
        <Thumb shape={thumbShape} src={value?.src} />
        <div className="admin-image-field__actions">
          <UploadButton
            folder={folder}
            onUploaded={([image]) => onChange(image)}
            trackUpload={trackUpload}
            variant="small"
          >
            {value ? "이미지 교체" : "이미지 선택"}
          </UploadButton>
          {removable && value ? (
            <button
              className="admin-button admin-button--small"
              onClick={() => onChange(null)}
              type="button"
            >
              비우기
            </button>
          ) : null}
        </div>
      </div>
      {hint ? <p className="admin-field__hint">{hint}</p> : null}
    </div>
  );
}

export function ImageListField({
  folder,
  hint,
  label,
  onChange,
  thumbShape = "portrait",
  trackUpload,
  value,
}) {
  return (
    <div className="admin-field">
      <div className="admin-field__header">
        <span className="admin-field__label">
          {label} <span className="admin-count">{value.length}개</span>
        </span>
        <UploadButton
          folder={folder}
          multiple
          onUploaded={(images) => onChange([...value, ...images])}
          trackUpload={trackUpload}
          variant="primary"
        >
          이미지 추가
        </UploadButton>
      </div>
      {hint ? <p className="admin-field__hint">{hint}</p> : null}

      {value.length === 0 ? (
        <p className="admin-empty">등록된 이미지가 없습니다.</p>
      ) : (
        <SortableList
          className="admin-image-grid"
          items={value}
          layout="grid"
          onChange={onChange}
          renderItem={(image, index, handle) => (
            <figure className="admin-image-tile">
              <Thumb shape={thumbShape} src={image.src} />
              <figcaption className="admin-image-tile__bar">
                {handle}
                <span className="admin-image-tile__index">{index + 1}</span>
                <button
                  className="admin-button admin-button--danger admin-button--small"
                  onClick={() =>
                    onChange(value.filter((item) => item.id !== image.id))
                  }
                  type="button"
                >
                  삭제
                </button>
              </figcaption>
            </figure>
          )}
        />
      )}
    </div>
  );
}
