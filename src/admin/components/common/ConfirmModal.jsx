import React from 'react';

const ConfirmModal = ({ show, title, message, onConfirm, onCancel, loading, confirmText = 'Delete', confirmColor = 'btn-primary' }) => {
    if (!show) return null;

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content border-0 shadow-lg">
                    <div className="modal-header border-bottom-0 pb-0">
                        <div className="d-flex align-items-center">
                            <div className="avatar avatar-sm me-2">
                                <span className="avatar-initial rounded-circle bg-label-warning">
                                    <i className="ri-error-warning-line"></i>
                                </span>
                            </div>
                            <h5 className="modal-title fw-bold mb-0">{title || 'Confirm Action'}</h5>
                        </div>
                        <button type="button" className="btn-close" onClick={onCancel} disabled={loading}></button>
                    </div>
                    <div className="modal-body py-4">
                        <p className="mb-0">{message || 'Are you sure you want to proceed? This action cannot be undone.'}</p>
                    </div>
                    <div className="modal-footer border-top-0 pt-0">
                        <button
                            type="button"
                            className="btn btn-label-secondary px-4"
                            onClick={onCancel}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            className={`btn ${confirmColor} px-4 d-flex align-items-center`}
                            onClick={onConfirm}
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                            ) : (
                                <i className={`${confirmText.toLowerCase() === 'delete' || confirmText.toLowerCase() === 'remove' ? 'ri-delete-bin-line' : 'ri-check-line'} me-1`}></i>
                            )}
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
