import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DESIGNERS_COLLECTION } from "../../content/designersContent";
import { resolveImageSrc } from "../../content/defaultAssets";
import { normalizeWork, WORKS_COLLECTION } from "../../content/worksContent";
import { defaultDesigners } from "../../data/designers";
import PageHeader from "../components/PageHeader";
import SortableList from "../components/SortableList";
import useCollection from "../hooks/useCollection";
import useDesigners from "../hooks/useDesigners";
import {
  createDocuments,
  deleteDocument,
  saveOrder,
} from "../services/documents";
import { collectMediaKeys, deleteImages } from "../services/media";

const TABLE_COLUMNS = "28px 60px minmax(0, 1fr) minmax(0, 1.4fr) 72px 128px";

function DesignerRow({ designer, handle, onDelete, workCount }) {
  return (
    <div className="admin-table__row">
      {handle ?? <span />}
      {designer.profileImage ? (
        <img
          className="admin-table__thumb admin-table__thumb--portrait"
          src={resolveImageSrc(designer.profileImage.src)}
          alt=""
        />
      ) : (
        <span className="admin-table__thumb admin-table__thumb--portrait admin-thumb--empty" />
      )}
      <Link
        className="admin-table__title"
        to={`/admin/designers/${designer.id}`}
      >
        {designer.koreanName || "이름 없음"}
      </Link>
      <span className="admin-table__muted">{designer.englishName || "-"}</span>
      <span className="admin-table__muted">{workCount}개</span>
      <div className="admin-table__actions">
        <Link
          className="admin-button admin-button--small"
          to={`/admin/designers/${designer.id}`}
        >
          수정
        </Link>
        <button
          className="admin-button admin-button--danger admin-button--small"
          onClick={() => onDelete(designer)}
          type="button"
        >
          삭제
        </button>
      </div>
    </div>
  );
}

/* 아직 DB에 디자이너가 없으면 코드에 있던 기본 목록을 한 번에 넣는다. */
function SeedNotice({ onSeeded }) {
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  const seed = async () => {
    setStatus("saving");
    setError(null);
    try {
      await createDocuments(DESIGNERS_COLLECTION, defaultDesigners);
      await onSeeded();
    } catch (seedError) {
      setError(seedError.message);
      setStatus("idle");
    }
  };

  return (
    <div className="admin-notice">
      <p>
        DB에 등록된 디자이너가 없어 사이트에는 기본 디자이너{" "}
        {defaultDesigners.length}명이 보이고 있습니다. 먼저 기본 목록을 불러온
        뒤 수정해 주세요. 작품과의 연결은 그대로 유지됩니다.
      </p>
      <button
        className="admin-button admin-button--primary"
        disabled={status === "saving"}
        onClick={seed}
        type="button"
      >
        {status === "saving"
          ? "불러오는 중..."
          : `기본 디자이너 ${defaultDesigners.length}명 불러오기`}
      </button>
      {error ? <p className="admin-error">{error}</p> : null}
    </div>
  );
}

function DesignersManager() {
  const {
    error: loadError,
    isDefault,
    items,
    reload,
    setItems,
  } = useDesigners();
  const works = useCollection(WORKS_COLLECTION, normalizeWork);
  const [actionError, setActionError] = useState(null);
  const [search, setSearch] = useState("");
  const error = actionError ?? loadError;

  const workCounts = useMemo(() => {
    const counts = new Map();
    works.items?.forEach((work) =>
      work.designerIds.forEach((id) =>
        counts.set(id, (counts.get(id) ?? 0) + 1),
      ),
    );
    return counts;
  }, [works.items]);

  const keyword = search.trim().toLowerCase();
  const visibleDesigners = (items ?? []).filter(
    (designer) =>
      !keyword ||
      designer.koreanName.includes(keyword) ||
      designer.englishName.toLowerCase().includes(keyword),
  );

  const handleReorder = async (nextDesigners) => {
    setItems(nextDesigners);
    setActionError(null);
    try {
      await saveOrder(
        DESIGNERS_COLLECTION,
        nextDesigners.map((designer) => designer.id),
      );
    } catch (orderError) {
      setActionError(`순서를 저장하지 못했습니다: ${orderError.message}`);
      void reload();
    }
  };

  const handleDelete = async (designer) => {
    const workCount = workCounts.get(designer.id) ?? 0;
    const message =
      workCount > 0
        ? `'${designer.koreanName}' 디자이너를 삭제할까요? 연결된 작품 ${workCount}개에서도 이름이 빠집니다.`
        : `'${designer.koreanName}' 디자이너를 삭제할까요? 되돌릴 수 없습니다.`;
    if (!window.confirm(message)) return;

    setActionError(null);
    try {
      await deleteDocument(`${DESIGNERS_COLLECTION}/${designer.id}`);
      setItems((current) => current.filter((item) => item.id !== designer.id));
      await deleteImages([...collectMediaKeys(designer)]);
    } catch (deleteError) {
      setActionError(`삭제하지 못했습니다: ${deleteError.message}`);
    }
  };

  return (
    <div className="admin-page">
      <PageHeader
        status={items ? `전체 ${items.length}명` : "불러오는 중..."}
        title="DESIGNERS"
      >
        <a
          className="admin-button"
          href="/designers"
          target="_blank"
          rel="noreferrer"
        >
          페이지 보기
        </a>
        {isDefault ? null : (
          <Link
            className="admin-button admin-button--primary"
            to="/admin/designers/new"
          >
            + 디자이너 추가
          </Link>
        )}
      </PageHeader>
      {error ? <p className="admin-error admin-page__error">{error}</p> : null}

      <div className="admin-page__body">
        {isDefault ? <SeedNotice onSeeded={reload} /> : null}

        {items && !isDefault ? (
          <section className="admin-section">
            <div className="admin-toolbar">
              <input
                aria-label="디자이너 검색"
                className="admin-input admin-toolbar__search"
                onChange={(event) => setSearch(event.target.value)}
                placeholder="국문 또는 영문 이름으로 검색"
                type="search"
                value={search}
              />
            </div>

            {visibleDesigners.length === 0 ? (
              <p className="admin-empty">조건에 맞는 디자이너가 없습니다.</p>
            ) : (
              <div
                className="admin-table"
                style={{ "--admin-table-columns": TABLE_COLUMNS }}
              >
                <div
                  className="admin-table__row admin-table__row--head"
                  aria-hidden="true"
                >
                  <span />
                  <span>프로필</span>
                  <span>이름</span>
                  <span>영문 이름</span>
                  <span>작품</span>
                  <span />
                </div>
                {keyword ? (
                  visibleDesigners.map((designer) => (
                    <DesignerRow
                      designer={designer}
                      key={designer.id}
                      onDelete={handleDelete}
                      workCount={workCounts.get(designer.id) ?? 0}
                    />
                  ))
                ) : (
                  <SortableList
                    className="admin-table__body"
                    items={items}
                    onChange={handleReorder}
                    renderItem={(designer, index, handle) => (
                      <DesignerRow
                        designer={designer}
                        handle={handle}
                        onDelete={handleDelete}
                        workCount={workCounts.get(designer.id) ?? 0}
                      />
                    )}
                  />
                )}
              </div>
            )}
          </section>
        ) : null}
      </div>
    </div>
  );
}

export default DesignersManager;
