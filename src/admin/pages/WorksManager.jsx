import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { resolveImageSrc } from "../../content/defaultAssets";
import { normalizeWork, WORKS_COLLECTION } from "../../content/worksContent";
import { PRIMARY_WORK_CATEGORY_IDS } from "../../data/workCategoryLabels";
import { workWorlds } from "../../data/works";
import PageHeader from "../components/PageHeader";
import WorkCategoryLabelsModal from "../components/WorkCategoryLabelsEditor";
import useWorkCategoryLabelMap from "../hooks/useWorkCategoryLabelMap";
import SortableList from "../components/SortableList";
import useCollection from "../hooks/useCollection";
import useDesigners from "../hooks/useDesigners";
import { deleteDocument, saveOrder } from "../services/documents";
import { collectMediaKeys, deleteImages } from "../services/media";

const worldLabels = Object.fromEntries(
  workWorlds.map(({ id, label }) => [id, label]),
);

const visibilityFilters = [
  { id: "all", label: "전체" },
  { id: "published", label: "공개" },
  { id: "draft", label: "비공개" },
];

function WorkRow({ categoryLabels, handle, onDelete, work }) {
  return (
    <div className="admin-table__row">
      {handle ?? <span />}
      {work.thumbnail ? (
        <img
          className="admin-table__thumb"
          src={resolveImageSrc(work.thumbnail.src)}
          alt=""
        />
      ) : (
        <span className="admin-table__thumb admin-thumb--empty" />
      )}
      <Link className="admin-table__title" to={`/admin/works/${work.id}`}>
        {work.title || "제목 없음"}
      </Link>
      <span className="admin-table__muted">
        {work.designerNames.join(", ") || "-"}
      </span>
      <span className="admin-table__muted">
        {work.categoryIds.map((id) => categoryLabels[id]).join(", ") || "-"}
      </span>
      <span className="admin-table__muted">
        {worldLabels[work.worldType] ?? "-"}
      </span>
      <span className={`admin-badge${work.published ? " is-on" : ""}`}>
        {work.published ? "공개" : "비공개"}
      </span>
      <div className="admin-table__actions">
        <Link
          className="admin-button admin-button--small"
          to={`/admin/works/${work.id}`}
        >
          수정
        </Link>
        <button
          className="admin-button admin-button--danger admin-button--small"
          onClick={() => onDelete(work)}
          type="button"
        >
          삭제
        </button>
      </div>
    </div>
  );
}

function WorksManager() {
  const { labelMap, reload: reloadCategoryLabels } = useWorkCategoryLabelMap();
  const categoryLabels = useMemo(
    () =>
      Object.fromEntries(
        PRIMARY_WORK_CATEGORY_IDS.map((id) => [id, labelMap[id].ko]),
      ),
    [labelMap],
  );
  const categoryFilterOptions = useMemo(
    () =>
      Object.fromEntries(
        PRIMARY_WORK_CATEGORY_IDS.map((id) => [id, labelMap[id].en]),
      ),
    [labelMap],
  );
  const collection = useCollection(WORKS_COLLECTION, normalizeWork);
  const { reload, setItems } = collection;
  const { designers, error: designersError } = useDesigners();
  const [actionError, setActionError] = useState(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [visibility, setVisibility] = useState("all");
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const error = actionError ?? collection.error ?? designersError;

  const works = useMemo(() => {
    if (!collection.items || !designers) return null;
    const names = new Map(
      designers.map((designer) => [designer.id, designer.koreanName]),
    );
    return collection.items.map((work) => ({
      ...work,
      designerNames: work.designerIds
        .map((id) => names.get(id))
        .filter(Boolean),
    }));
  }, [collection.items, designers]);

  const isFiltered =
    Boolean(search.trim()) || category !== "all" || visibility !== "all";

  const visibleWorks = useMemo(() => {
    if (!works) return [];
    const keyword = search.trim().toLowerCase();

    return works.filter(
      (work) =>
        (!keyword ||
          work.title.toLowerCase().includes(keyword) ||
          work.designerNames.some((name) => name.includes(keyword))) &&
        (category === "all" || work.categoryIds.includes(category)) &&
        (visibility === "all" ||
          work.published === (visibility === "published")),
    );
  }, [category, search, visibility, works]);

  const handleReorder = async (nextWorks) => {
    setItems(nextWorks);
    setActionError(null);
    try {
      await saveOrder(
        WORKS_COLLECTION,
        nextWorks.map((work) => work.id),
      );
    } catch (orderError) {
      setActionError(`순서를 저장하지 못했습니다: ${orderError.message}`);
      void reload();
    }
  };

  const handleDelete = async (work) => {
    if (
      !window.confirm(
        `'${work.title || "제목 없음"}' 작품을 삭제할까요? 되돌릴 수 없습니다.`,
      )
    ) {
      return;
    }

    setActionError(null);
    try {
      await deleteDocument(`${WORKS_COLLECTION}/${work.id}`);
      setItems((current) => current.filter((item) => item.id !== work.id));
      await deleteImages([...collectMediaKeys(work)]);
    } catch (deleteError) {
      setActionError(`삭제하지 못했습니다: ${deleteError.message}`);
    }
  };

  const publishedCount = works?.filter((work) => work.published).length ?? 0;

  return (
    <div className="admin-page">
      <PageHeader
        status={
          works
            ? `전체 ${works.length}개 · 공개 ${publishedCount}개`
            : "불러오는 중..."
        }
        title="WORKS"
      >
        <button
          className="admin-button"
          onClick={() => setCategoryModalOpen(true)}
          type="button"
        >
          작품 분류 관리
        </button>
        <a
          className="admin-button"
          href="/works"
          target="_blank"
          rel="noreferrer"
        >
          페이지 보기
        </a>
        <Link
          className="admin-button admin-button--primary"
          to="/admin/works/new"
        >
          + 작품 추가
        </Link>
      </PageHeader>
      {error ? <p className="admin-error admin-page__error">{error}</p> : null}

      {isCategoryModalOpen ? (
        <WorkCategoryLabelsModal
          onClose={() => setCategoryModalOpen(false)}
          onSaved={reloadCategoryLabels}
        />
      ) : null}

      <div className="admin-page__body">
        <section className="admin-section">
          <div className="admin-toolbar">
            <input
              aria-label="작품 검색"
              className="admin-input admin-toolbar__search"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="작품명 또는 디자이너 이름으로 검색"
              type="search"
              value={search}
            />
            <select
              aria-label="분류"
              className="admin-input admin-toolbar__select"
              onChange={(event) => setCategory(event.target.value)}
              value={category}
            >
              <option value="all">모든 분류</option>
              {Object.entries(categoryFilterOptions).map(([id, label]) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
            <select
              aria-label="공개 상태"
              className="admin-input admin-toolbar__select"
              onChange={(event) => setVisibility(event.target.value)}
              value={visibility}
            >
              {visibilityFilters.map(({ id, label }) => (
                <option key={id} value={id}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {!works ? (
            <p className="admin-empty">불러오는 중...</p>
          ) : visibleWorks.length === 0 ? (
            <p className="admin-empty">
              {works.length === 0
                ? "등록된 작품이 없습니다. 작품을 추가해 주세요."
                : "조건에 맞는 작품이 없습니다."}
            </p>
          ) : (
            <div
              className="admin-table"
              style={{
                "--admin-table-columns":
                  "28px 96px minmax(0, 2fr) minmax(0, 1.4fr) minmax(0, 1fr) 90px 64px 128px",
              }}
            >
              <div
                className="admin-table__row admin-table__row--head"
                aria-hidden="true"
              >
                <span />
                <span>썸네일</span>
                <span>작품명</span>
                <span>디자이너</span>
                <span>분류</span>
                <span>이념</span>
                <span>상태</span>
                <span />
              </div>
              {isFiltered ? (
                visibleWorks.map((work) => (
                  <WorkRow
                    categoryLabels={categoryLabels}
                    key={work.id}
                    onDelete={handleDelete}
                    work={work}
                  />
                ))
              ) : (
                <SortableList
                  className="admin-table__body"
                  items={works}
                  onChange={handleReorder}
                  renderItem={(work, index, handle) => (
                    <WorkRow
                      categoryLabels={categoryLabels}
                      handle={handle}
                      onDelete={handleDelete}
                      work={work}
                    />
                  )}
                />
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default WorksManager;
