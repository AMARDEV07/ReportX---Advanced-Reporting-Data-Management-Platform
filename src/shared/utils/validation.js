/**
 * Email validation using regex
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email && emailRegex.test(email.trim());
};

/**
 * Password validation (min 6 characters)
 * @param {string} password
 * @returns {boolean}
 */
export const isValidPassword = (password) => {
    return password && password.length >= 6;
};

/**
 * Validate Login Form
 * @param {Object} formData - { userRef (email or username), password }
 * @returns {Object} - Object with field-specific errors
 */
export const validateLoginForm = (formData) => {
    const errors = {};
    const { userRef, password } = formData;

    if (!userRef || userRef.trim() === "") {
        errors.userRef = "Email or Username is required";
    } else if (userRef.includes('@') && !isValidEmail(userRef)) {
        errors.userRef = "Enter a valid email address";
    }

    if (!password || password.trim() === "") {
        errors.password = "Password is required";
    } else if (!isValidPassword(password)) {
        errors.password = "Password must be at least 6 characters";
    }

    return errors;
};


export const validateRoleForm = (formData) => {
    const errors = {};
    const { roleName, shortCode } = formData;

    if (!roleName || roleName.trim() === "") {
        errors.roleName = "Role Name is required";
    } else if (roleName.trim().length < 3) {
        errors.roleName = "Role Name must be at least 3 characters";
    }

    if (!shortCode || shortCode.trim() === "") {
        errors.shortCode = "Short Code is required";
    } else if (shortCode.trim().length < 2) {
        errors.shortCode = "Short Code must be at least 2 characters";
    }

    return errors;
};

export const validateUserForm = (formData) => {
    const errors = {};
    const { fullName, mobileNo, email, username, password } = formData;

    if (!fullName || fullName.trim() === "") {
        errors.fullName = "Full Name is required";
    }

    if (!mobileNo || mobileNo.trim() === "") {
        errors.mobileNo = "Mobile No is required";
    } else if (!/^\d{10}$/.test(mobileNo.trim())) {
        errors.mobileNo = "Mobile No must be 10 digits";
    }

    if (!email || email.trim() === "") {
        errors.email = "Email is required";
    } else if (!isValidEmail(email)) {
        errors.email = "Enter a valid email address";
    }

    if (!username || username.trim() === "") {
        errors.username = "Username is required";
    }

    if (!password || password.trim() === "") {
        errors.password = "Password is required";
    } else if (!isValidPassword(password)) {
        errors.password = "Password must be at least 6 characters";
    }

    return errors;
};
