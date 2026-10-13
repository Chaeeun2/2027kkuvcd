import SortableList from "./SortableList";

/*
 * 같은 형태의 짧은 입력 줄(예: 직책·이름)을 추가·삭제·정렬한다.
 * columns는 [{ name, label, placeholder }] 형태다.
 */
function RowListField({ addLabel = "줄 추가", columns, label, onChange, value }) {
  const updateRow = (id, name, text) =>
    onChange(value.map((row) => (row.id === id ? { ...row, [name]: text } : row)));

  const addRow = () =>
    onChange([
      ...value,
      {
        id: crypto.randomUUID(),
        ...Object.fromEntries(columns.map((column) => [column.name, ""])),
      },
    ]);

  return (
    <div className="admin-field">
      {label ? <span className="admin-field__label">{label}</span> : null}
      <div
        className="admin-row-list"
        style={{ "--admin-row-columns": columns.length }}
      >
        <div className="admin-row admin-row--head" aria-hidden="true">
          <span />
          {columns.map((column) => (
            <span key={column.name}>{column.label}</span>
          ))}
          <span />
        </div>
        <SortableList
          className="admin-row-list"
          items={value}
          onChange={onChange}
          renderItem={(row, index, handle) => (
            <div className="admin-row">
              {handle}
              {columns.map((column) => (
                <input
                  aria-label={`${index + 1}번째 ${column.label}`}
                  className="admin-input"
                  key={column.name}
                  onChange={(event) =>
                    updateRow(row.id, column.name, event.target.value)
                  }
                  placeholder={column.placeholder}
                  value={row[column.name]}
                />
              ))}
              <button
                className="admin-button admin-button--danger admin-button--small"
                onClick={() => onChange(value.filter((item) => item.id !== row.id))}
                type="button"
              >
                삭제
              </button>
            </div>
          )}
        />
      </div>
      <button className="admin-button admin-button--small" onClick={addRow} type="button">
        + {addLabel}
      </button>
    </div>
  );
}

export default RowListField;
