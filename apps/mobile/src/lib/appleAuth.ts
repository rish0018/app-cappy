/**
 * Shared helper for the native Apple Sign-In flow (docs/BACKEND_SSO_SETUP.md
 * §5c). `expo-apple-authentication` rejects with `ERR_REQUEST_CANCELED` when
 * the user dismisses the sign-in sheet themselves   that's not a failure
 * worth surfacing an error message for, unlike a real auth failure.
 */
export function isAppleCancellation(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: unknown }).code === "ERR_REQUEST_CANCELED"
  );
}
