import React from 'react';

function DeleteConfirmModal({
  isOpen,
  itemName = 'this item',
  onClose,
  onConfirm,
  deleting = false,
  error = '',
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(28,32,29,0.55)', backdropFilter: 'blur(3px)' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget && !deleting) {
          onClose();
        }
      }}
    >
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-[#E7E3DA] p-6 sm:p-7">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6" />
            <path d="M14 11v6" />
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          </svg>
        </div>

        <h2 id="delete-modal-title" className="text-lg font-bold text-[#1B382B] text-center mb-2">
          Delete This Report?
        </h2>
        <p className="text-sm text-[#5C645E] text-center leading-relaxed mb-1">
          Are you sure you want to delete <strong className="text-[#1C201D]">"{itemName}"</strong>?
        </p>
        <p className="text-xs text-[#5C645E] text-center mb-5">
          This action cannot be undone. All related claims will also be removed.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4 shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            id="delete-cancel-btn"
            onClick={onClose}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 text-sm font-semibold border border-[#E7E3DA] bg-white hover:bg-[#F4F1EA] text-[#1C201D] rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            id="delete-confirm-btn"
            disabled={deleting}
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 text-sm font-semibold bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {deleting ? 'Deleting...' : 'Yes, Delete Report'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteConfirmModal;
