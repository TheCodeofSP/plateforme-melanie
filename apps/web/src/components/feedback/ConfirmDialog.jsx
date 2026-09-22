export default function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = "Confirmer",
  confirmClassName = "btn btn-primary",
  cancelLabel = "Annuler",
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="confirm-dialog" role="presentation" onMouseDown={onCancel}>
      <section
        className="confirm-dialog__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-dialog-title">{title}</h2>
        {description && <p>{description}</p>}
        <div className="confirm-dialog__actions">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className={confirmClassName}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}
