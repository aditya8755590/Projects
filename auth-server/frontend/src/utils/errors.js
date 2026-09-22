// =========================================================
//  src/utils/errors.js
//  ONE way to turn an axios error into a user-facing message.
//
//  Every page used to hand-write the same fallback dance:
//
//      const msg = err.response?.data?.error || "Something failed.";
//
//  That line was copy-pasted across Login, Register, Profile and
//  Admin. getErrorMessage() owns the pattern: prefer the message
//  the SERVER sent (a validation message, "Invalid credentials.",
//  "Forbidden: ADMIN role required."...), otherwise fall back to
//  a sensible default so the user always sees something readable.
// =========================================================

export function getErrorMessage(error, fallback = "Something went wrong.") {
  return error?.response?.data?.error || fallback;
}