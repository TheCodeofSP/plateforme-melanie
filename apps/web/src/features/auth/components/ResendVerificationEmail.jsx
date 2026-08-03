import { useState } from "react";

import FormErrorSummary from "../../../components/feedback/FormErrorSummary.jsx";
import { resendEmailVerification } from "../api/auth.service.js";

export default function ResendVerificationEmail({ initialEmail = "" }) {
  const [email, setEmail] = useState(initialEmail);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setMessage("");
    setIsSubmitting(true);
    try {
      const result = await resendEmailVerification(email);
      setMessage(result.message);
    } catch (apiError) {
      setError(apiError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="resend-form" onSubmit={handleSubmit}>
      <label className="form-field">
        <span>Adresse email du compte</span>
        <input className="form-input" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" />
      </label>
      {error && <FormErrorSummary error={error} />}
      {message && <p className="registration-notice registration-notice--success" role="status">{message}</p>}
      <button className="btn btn-secondary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Envoi…" : "Renvoyer l’email"}
      </button>
    </form>
  );
}
