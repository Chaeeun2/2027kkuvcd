function FilterGroup({ items, label, onChange, selected }) {
  return (
    <div className="works-filter-group" aria-label={label} role="group">
      {items.map((item) => (
        <button
          className={selected === item.id ? "is-active" : ""}
          type="button"
          aria-pressed={selected === item.id}
          key={item.id}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
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
  return (
    <section
      className="works-filters"
      aria-label="작품 필터"
      {...(reveal ? { "data-work-reveal": true } : {})}
    >
      <FilterGroup
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
