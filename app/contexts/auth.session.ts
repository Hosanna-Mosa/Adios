// One-shot guard so an expired session only triggers a single sign-out redirect,
// however many in-flight requests come back 401 at once. Lives in its own module
// because both authStore and auth.credentials reset it on a successful sign-in.

let sessionExpiryHandled = false;

export const isSessionExpiryHandled = () => sessionExpiryHandled;
export const markSessionExpiryHandled = () => {
  sessionExpiryHandled = true;
};
export const resetSessionExpiry = () => {
  sessionExpiryHandled = false;
};
