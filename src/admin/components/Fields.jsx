import { useId } from "react";

export function EditorSection({ children, description, title }) {
  return (
    <section className="admin-section">
      <header className="admin-section__header">
        <h2 className="admin-section__title">{title}</h2>
        {description ? (
          <p className="admin-section__description">{description}</p>
        ) : null}
      </header>
      <div className="admin-section__body">{children}</div>
    </section>
  );
}

export function TextField({
  hint,
  label,
  multiline = false,
  onChange,
  placeholder,
  rows = 3,
  type = "text",
  value,
}) {
  const id = useId();
  const Control = multiline ? "textarea" : "input";

  return (
    <div className="admin-field">
      <label className="admin-field__label" htmlFor={id}>
        {label}
      </label>
      <Control
        className="admin-input"
        id={id}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={multiline ? rows : undefined}
        type={multiline ? undefined : type}
        value={value}
      />
      {hint ? <p className="admin-field__hint">{hint}</p> : null}
    </div>
  );
}

/*
 * 버튼 모양 선택지. multiple이면 value는 id 배열, 아니면 id 하나다.
 * 하나만 고르는 경우에도 다시 누르면 선택이 풀린다.
 */
export function ChoiceField({ hint, label, multiple = false, onChange, options, value }) {
  const isSelected = (id) => (multiple ? value.includes(id) : value === id);
  const toggle = (id) => {
    if (!multiple) {
      onChange(value === id ? "" : id);
      return;
    }
    onChange(
      value.includes(id)
        ? value.filter((item) => item !== id)
        : options.map((option) => option.id).filter((item) => item === id || value.includes(item)),
    );
  };

  return (
    <div className="admin-field">
      <span className="admin-field__label">{label}</span>
      <div className="admin-choices" role="group" aria-label={label}>
        {options.map((option) => (
          <button
            aria-pressed={isSelected(option.id)}
            className="admin-choice"
            key={option.id}
            onClick={() => toggle(option.id)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
      {hint ? <p className="admin-field__hint">{hint}</p> : null}
    </div>
  );
}

export function SwitchField({ checked, hint, label, onChange }) {
  return (
    <div className="admin-field">
      <label className="admin-switch">
        <input
          checked={checked}
          onChange={(event) => onChange(event.target.checked)}
          type="checkbox"
        />
        <span className="admin-switch__track" aria-hidden="true" />
        <span className="admin-field__label">{label}</span>
      </label>
      {hint ? <p className="admin-field__hint">{hint}</p> : null}
    </div>
  );
}

/* 국문·영문을 나란히 입력한다. value는 { ko, en } 형태다. */
export function BilingualField({ hint, label, multiline, onChange, rows, value }) {
  return (
    <div className="admin-field-row">
      {[
        ["ko", "국문"],
        ["en", "영문"],
      ].map(([language, languageLabel]) => (
        <TextField
          hint={hint}
          key={language}
          label={`${label} (${languageLabel})`}
          multiline={multiline}
          onChange={(text) => onChange({ ...value, [language]: text })}
          rows={rows}
          value={value[language]}
        />
      ))}
    </div>
  );
}
