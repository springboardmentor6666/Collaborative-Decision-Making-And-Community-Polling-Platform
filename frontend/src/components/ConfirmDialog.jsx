function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}) {
  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-[var(--app-border)] bg-[var(--app-card)] p-6 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmation-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/10 text-2xl text-red-500">
          !
        </div>

        <h2
          id="confirmation-title"
          className="text-xl font-bold text-[var(--app-text)]"
        >
          {title}
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--app-secondary-text)]">
          {message}
        </p>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[var(--app-border)] px-5 py-3 text-sm font-semibold text-[var(--app-text)] transition hover:bg-[var(--app-bg)]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
