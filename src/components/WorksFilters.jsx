import { useLayoutEffect, useRef } from "react";
import { MOBILE_QUERY } from "../hooks/useIsMobile";

function toIds(selected) {
  return Array.isArray(selected) ? selected : [selected];
}

function FilterGroup({ groupRef, items, label, onChange, selected }) {
  const selectedIds = toIds(selected);

  return (
    <div
      className="works-filter-group"
      aria-label={label}
      role="group"
      ref={groupRef}
    >
      {items.map((item) => {
        const isSelected = selectedIds.includes(item.id);

        return (
          <button
            className={isSelected ? "is-active" : ""}
            type="button"
            aria-pressed={isSelected}
            key={item.id}
            onClick={() => onChange(item.id)}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function WorksFilters({
  categories,
  category,
  onCategoryChange,
  onWorldChange,
  reveal = false,
  world,
  worlds,
}) {
  const filtersRef = useRef(null);
  const categoryGroupRef = useRef(null);
  const activeCategoryId = toIds(category)[0];

  /* 하위 카테고리 박스를 선택된 상위 카테고리의 왼쪽 끝에 맞춘다. */
  useLayoutEffect(() => {
    const filters = filtersRef.current;
    const group = categoryGroupRef.current;
    if (!filters || !group) return undefined;

    const alignWorldFilter = () => {
      const index = categories.findIndex(
        (item) => item.id === activeCategoryId,
      );
      const button = group.children[index];
      const worldFilter = filters.querySelector(".works-world-filter");
      const filtersBounds = filters.getBoundingClientRect();
      const buttonOffset = button
        ? button.getBoundingClientRect().left - filtersBounds.left
        : 0;
      // 오른쪽 끝을 넘어가지 않도록 콘텐츠 폭 안에서 멈춘다.
      const maxOffset = Math.max(
        0,
        filtersBounds.width - (worldFilter?.offsetWidth ?? 0),
      );
      const offset = Math.min(buttonOffset, maxOffset);
      filters.style.setProperty("--world-filter-offset", `${offset}px`);

      // 모바일에서 마지막 카테고리까지 왼쪽 끝으로 스크롤될 만큼 뒤에 여백을 둔다.
      const lastButton = group.lastElementChild;
      const scrollEnd = Math.max(
        0,
        group.clientWidth - (lastButton?.offsetWidth ?? 0),
      );
      group.style.setProperty("--category-scroll-end", `${scrollEnd}px`);
    };

    alignWorldFilter();

    // 폰트가 늦게 적용되면 박스 폭이 바뀌므로 크기가 바뀔 때마다 다시 잰다.
    const resizeObserver = new ResizeObserver(alignWorldFilter);
    resizeObserver.observe(filters);
    resizeObserver.observe(group);
    const worldFilter = filters.querySelector(".works-world-filter");
    if (worldFilter) resizeObserver.observe(worldFilter);

    return () => resizeObserver.disconnect();
  }, [activeCategoryId, categories]);

  /* 모바일에서는 선택된 상위 카테고리를 가로 스크롤 영역의 왼쪽 끝으로 옮긴다. */
  const hasScrolledRef = useRef(false);

  useLayoutEffect(() => {
    const group = categoryGroupRef.current;
    if (!group || !window.matchMedia(MOBILE_QUERY).matches) return;

    const index = categories.findIndex((item) => item.id === activeCategoryId);
    const button = group.children[index];
    if (!button) return;

    const left =
      group.scrollLeft +
      button.getBoundingClientRect().left -
      group.getBoundingClientRect().left;
    const shouldAnimate =
      hasScrolledRef.current &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    group.scrollTo({ left, behavior: shouldAnimate ? "smooth" : "auto" });
    hasScrolledRef.current = true;
  }, [activeCategoryId, categories]);

  return (
    <section
      className="works-filters"
      aria-label="작품 필터"
      ref={filtersRef}
      {...(reveal ? { "data-work-reveal": true } : {})}
    >
      <FilterGroup
        groupRef={categoryGroupRef}
        items={categories}
        label="상위 카테고리"
        onChange={onCategoryChange}
        selected={category}
      />
      <div className="works-world-filter">
        <FilterGroup
          items={worlds}
          label="하위 카테고리"
          onChange={onWorldChange}
          selected={world}
        />
      </div>
    </section>
  );
}

export default WorksFilters;
