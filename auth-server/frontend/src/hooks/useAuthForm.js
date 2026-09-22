// =========================================================
//  src/hooks/useAuthForm.js
//  Shared state + submit wrapper for the two auth forms.
//
//  Login and Register both followed the exact same shape:
//    email/password state, an error message, a try/catch around
//    the axios call, and on failure "the message from the server,
//    or a fallback, shown as error."
//
//  This hook owns all of it. A page supplies a `request(fields)`
//  function (e.g. `(f) => api.post("/auth/login", f)`) plus a
//  fallback error string, and gets back:
//    fields, handleFieldChange, error, isSubmitting, submit.
//
//  `submit` preventDefaults, clears errors, calls request, and on
//  rejection converts the server error into a user-facing message.
//  It resolves to { response } (full axios response) on success or
//  { error } (the user-facing message) on failure, so the page can
//  log its own success/failure lines and hand data to App.
// =========================================================

import { useState } from "react";
import { getErrorMessage } from "../utils/errors";

export function useAuthForm(initialFields, request, fallbackError) {
  const [fields, setFields] = useState(initialFields);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (name) => (e) => {
    setFields((prev) => ({ ...prev, [name]: e.target.value }));
  };

  const submit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setIsSubmitting(true);
      return { response: await request(fields) };
    } catch (err) {
      const msg = getErrorMessage(err, fallbackError);
      setError(msg);
      return { error: msg };
    } finally {
      setIsSubmitting(false);
    }
  };

  return { fields, handleFieldChange, error, isSubmitting, submit, setFields };
}