// Sanitize user object - remove sensitive data
export function sanitizeUser(user) {
    if (!user) return null;

    const { password, refreshToken, otpCode, otpExpiresAt, ...safeUser } = user;
    return safeUser;
}

// Generate OTP (6-digit code)
export function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Validate email format
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate password strength
export function isStrongPassword(password) {
    // At least 8 characters, with uppercase, lowercase, number, and special character
    const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongRegex.test(password);
}
