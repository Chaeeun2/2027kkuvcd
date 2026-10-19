import { useRef, useState } from "react";
import { resolveImageSrc } from "../../content/defaultAssets";
import {
  IMAGE_RULE_LABEL,
  IMAGE_TYPES,
  uploadImage,
  validateImageFile,
} from "../services/media";
import SortableList from "./SortableList";

const fulfilledValues = (results) =>
  results.filter((result) => result.status === "fulfilled").map((result) => result.value);

/*
 * 파일을 받으면 바로 업로드하고, 끝난 이미지들을 onUploaded로 넘긴다.
 * 진행 중인 업로드는 trackUpload로 편집기에 알려 그동안 저장을 막는다.
 */
function useImageUpload({ folder, onUploaded, trackUpload }) {
  const inputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const upload = async (files) => {
    if (files.length === 0 || isUploading) return;

    setError(null);
    try {
      files.forEach(validateImageFile);
    } catch (validationError) {
      setError(validationError.message);
      return;
    }

    setIsUploading(true);
    const uploading = Promise.allSettled(files.map((file) => uploadImage(file, folder)));
    trackUpload(uploading.then(fulfilledValues));
    const results = await uploading;
    setIsUploading(false);

    const images = fulfilledValues(results);
    const failure = results.find((result) => result.status === "rejected");

    if (images.length > 0) onUploaded(images);
    if (failure) setError(failure.reason.message);
  };

  const input = (multiple) => (
    <input
      accept={IMAGE_TYPES.join(",")}
      hidden
      multiple={multiple}
      onChange={(event) => {
        const files = [...event.target.files];
        event.target.value = "";
        void upload(files);
      }}
      ref={inputRef}
      type="file"
    />
  );

  return {
    error,
    input,
    isUploading,
    openPicker: () => inputRef.current.click(),
    upload,
  };
}

function UploadButton({ children, variant, ...options }) {
  const { error, input, isUploading, openPicker } = useImageUpload(options);

  return (
    <div className="admin-upload">
      <button
        className={`admin-button${variant ? ` admin-button--${variant}` : ""}`}
        disabled={isUploading}
        onClick={openPicker}
        type="button"
      >
        {isUploading ? "업로드 중..." : children}
      </button>
      {input(false)}
      {error ? <p className="admin-error">{error}</p> : null}
    </div>
  );
}

/* 클릭해서 고르거나 파일을 끌어 놓아 여러 장을 한 번에 올린다. */
function UploadDropzone({ showRule, ...options }) {
  const { error, input, isUploading, openPicker, upload } = useImageUpload(options);
  const [isOver, setIsOver] = useState(false);

  const handleDrop = (event) => {
    event.preventDefault();
    setIsOver(false);
    void upload([...event.dataTransfer.files]);
  };

  return (
    <div className="admin-upload admin-upload--block">
      <button
        className={`admin-dropzone${isOver ? " is-over" : ""}`}
        disabled={isUploading}
        onClick={openPicker}
        onDragLeave={() => setIsOver(false)}
        onDragOver={(event) => {
          event.preventDefault();
          setIsOver(true);
        }}
        onDrop={handleDrop}
        type="button"
      >
        <span className="admin-dropzone__title">
          {isUploading ? "업로드 중..." : "클릭하거나 파일을 끌어 업로드"}
        </span>
        {showRule ? <span className="admin-dropzone__rule">{IMAGE_RULE_LABEL}</span> : null}
      </button>
      {input(true)}
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

/* 여러 장을 올리고, 타일을 끌어서 순서를 바꾼다. */
export function ImageListField({
  folder,
  hint,
  label,
  onChange,
  showRule = true,
  thumbShape = "portrait",
  trackUpload,
  value,
}) {
  return (
    <div className="admin-field">
      <span className="admin-field__label">
        {label} <span className="admin-count">{value.length}개</span>
      </span>
      {hint ? <p className="admin-field__hint">{hint}</p> : null}

      <UploadDropzone
        folder={folder}
        onUploaded={(images) => onChange([...value, ...images])}
        showRule={showRule}
        trackUpload={trackUpload}
      />

      {value.length > 0 ? (
        <SortableList
          className="admin-image-grid"
          items={value}
          layout="grid"
          onChange={onChange}
          renderItem={(image, index) => (
            <figure className="admin-image-tile">
              <Thumb shape={thumbShape} src={image.src} />
              <button
                aria-label={`${index + 1}번째 이미지 삭제`}
                className="admin-image-tile__remove"
                onClick={() => onChange(value.filter((item) => item.id !== image.id))}
                onPointerDown={(event) => event.stopPropagation()}
                type="button"
              >
                ×
              </button>
            </figure>
          )}
          wholeItem
        />
      ) : null}
    </div>
  );
}
