import { GALLERY_LAYOUTS } from "../../data/works";
import { toVideoEmbedUrl } from "../../utils/videoEmbed";
import { TextField } from "./Fields";
import { ImageField } from "./ImageFields";
import SortableList from "./SortableList";

const imageShapes = { wide: "wide", split: "tall" };

function createRow(layout) {
  return {
    id: crypto.randomUUID(),
    layout,
    images: Array(GALLERY_LAYOUTS[layout].imageCount).fill(null),
    videoUrl: "",
  };
}

/* 작품 상세 오른쪽에 위에서부터 쌓이는 이미지·영상 줄 */
function GalleryRowsField({ folder, onChange, trackUpload, value }) {
  const updateRow = (id, changes) =>
    onChange(value.map((row) => (row.id === id ? { ...row, ...changes } : row)));

  return (
    <div className="admin-stack">
      {value.length === 0 ? (
        <p className="admin-empty">추가된 줄이 없습니다.</p>
      ) : (
        <SortableList
          className="admin-row-list"
          items={value}
          onChange={onChange}
          renderItem={(row, index, handle) => (
            <div className="admin-subsection">
              <div className="admin-subsection__bar">
                {handle}
                <span className="admin-subsection__title">
                  {index + 1}. {GALLERY_LAYOUTS[row.layout].label}
                </span>
                <button
                  className="admin-button admin-button--danger admin-button--small"
                  onClick={() => onChange(value.filter((item) => item.id !== row.id))}
                  type="button"
                >
                  줄 삭제
                </button>
              </div>

              {row.layout === "video" ? (
                <TextField
                  hint={
                    row.videoUrl && !toVideoEmbedUrl(row.videoUrl)
                      ? "유튜브나 비메오 주소만 넣을 수 있습니다."
                      : "유튜브 또는 비메오 주소"
                  }
                  label="영상 주소"
                  onChange={(videoUrl) => updateRow(row.id, { videoUrl })}
                  placeholder="https://www.youtube.com/watch?v=..."
                  type="url"
                  value={row.videoUrl}
                />
              ) : (
                <div className="admin-gallery-images">
                  {row.images.map((image, imageIndex) => (
                    <ImageField
                      folder={folder}
                      key={imageIndex}
                      onChange={(nextImage) =>
                        updateRow(row.id, {
                          images: row.images.map((item, itemIndex) =>
                            itemIndex === imageIndex ? nextImage : item,
                          ),
                        })
                      }
                      trackUpload={trackUpload}
                      removable
                      thumbShape={imageShapes[row.layout]}
                      value={image}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        />
      )}

      <div className="admin-button-group">
        {Object.entries(GALLERY_LAYOUTS).map(([layout, { label }]) => (
          <button
            className="admin-button admin-button--small"
            key={layout}
            onClick={() => onChange([...value, createRow(layout)])}
            type="button"
          >
            + {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default GalleryRowsField;
