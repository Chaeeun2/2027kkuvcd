import { useEffect, useId } from "react";
import { createPortal } from "react-dom";

function AdminModal({ actions, children, onClose, title }) {
  const titleId = useId();

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div className="admin-modal" onClick={onClose} role="presentation">
      <div
        aria-labelledby={titleId}
        aria-modal="true"
        className="admin-modal__dialog"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
      >
        <header className="admin-modal__header">
          <h2 className="admin-modal__title" id={titleId}>
            {title}
          </h2>
          {actions ? (
            <div className="admin-modal__header-actions">{actions}</div>
          ) : null}
        </header>
        <div className="admin-modal__body">{children}</div>
      </div>
    </div>,
    document.querySelector(".admin-root") ?? document.body,
  );
}

export default AdminModal;
