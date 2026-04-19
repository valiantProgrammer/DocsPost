/**
 * Utility functions for authentication data management
 */

export function syncAuthDataFromCookies() {
    /**
     * Syncs authentication data from cookies to localStorage
     * Useful after OAuth callbacks like Google Sign-In
     */
    const cookiePairs = document.cookie.split("; ");

    const authDataMap = {
        "docspost-auth": "docspost-auth",
        "docspost-username": "docspost-username",
        "docspost-email": "docspost-email",
    };

    for (const [cookieName, localStorageKey] of Object.entries(authDataMap)) {
        const cookieValue = cookiePairs
            .find(row => row.startsWith(`${cookieName}=`))
            ?.split("=")[1];

        if (cookieValue) {
            try {
                const decodedValue = decodeURIComponent(cookieValue);
                localStorage.setItem(localStorageKey, decodedValue);
            } catch (e) {
                console.error(`Error syncing ${cookieName} from cookie:`, e);
            }
        }
    }
}

export function getAuthUserData() {
    /**
     * Retrieves all auth user data from localStorage
     * Returns an object with username, email, and auth status
     */
    return {
        isSignedIn: localStorage.getItem("docspost-auth") === "signed-in",
        username: localStorage.getItem("docspost-username") || "",
        email: localStorage.getItem("docspost-email") || "",
        location: localStorage.getItem("docspost-location") || "",
        bio: localStorage.getItem("docspost-bio") || "",
    };
}

export function clearAuthData() {
    /**
     * Clears all authentication data from localStorage
     * Call this on logout
     */
    const authKeys = [
        "docspost-auth",
        "docspost-username",
        "docspost-email",
        "docspost-location",
        "docspost-bio",
        "docspost-joinDate",
    ];

    authKeys.forEach(key => localStorage.removeItem(key));
}
