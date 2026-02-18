import hotToast from "react-hot-toast";

const normalizeOptions = (options = {}) => {
    const {
        position = "top-center",
        autoClose = 2500,
        duration,
    } = options;

    return {
        duration: duration ?? autoClose,
        position,
    };
};

/**
 * Object style toast (standard in portal)
 */
export const toast = {
    success: (msg, options = {}) =>
        hotToast.success(msg, normalizeOptions(options)),

    error: (msg, options = {}) =>
        hotToast.error(msg, normalizeOptions(options)),

    info: (msg, options = {}) =>
        hotToast(msg, normalizeOptions(options)),

    warning: (msg, options = {}) =>
        hotToast(msg, normalizeOptions(options)),
};

/**
 * Functional style toast (standard in admin)
 */
export const showToast = (type, message, options = {}) => {
    switch (type) {
        case 'success':
            toast.success(message, options);
            break;
        case 'error':
            toast.error(message, options);
            break;
        default:
            toast.info(message, options);
    }
};
