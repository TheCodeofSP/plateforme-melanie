import { useState } from "react";
import { Link, Navigate } from "react-router-dom";

import FormErrorSummary from "../../../components/feedback/FormErrorSummary.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { roleHome, routes } from "../../../config/routes.config.js";
import { authContent } from "../../../content/auth.content.js";
import useAuth from "../../../hooks/useAuth.js";
import { login as requestLoginLink } from "../api/auth.service.js";

import "../../../styles/pages/login.scss";

export default function LoginPage() {
  const { isAuthenticated, status, user } = useAuth();
  const [form, setForm] = useState({ email: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const content = authContent.login;

  if (status !== "checking" && isAuthenticated) {
    return <Navigate to={roleHome(user.role)} replace />;
  }

  function updateField(event) {
    const { name, type, checked, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await requestLoginLink(form);
      setMessage(result.message);
    } catch (apiError) {
      setError(apiError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <SEO
        title="Connexion"
        description="Connecte-toi à ton espace sur la plateforme de Mélanie Dizet."
        noIndex
      />

      <main className="login-page">
        <section className="login-card" aria-labelledby="login-title">
          <p className="section-eyebrow">{content.eyebrow}</p>
          <h1 id="login-title">{content.title}</h1>
          <p className="login-card__description">{content.description}</p>
          <aside
            className="login-card__how"
            aria-label="Comment fonctionne la connexion sans mot de passe"
          >
            <strong>Comment ça fonctionne ?</strong>
            <ol>
              {content.steps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </aside>

          {error && <FormErrorSummary error={error} />}
          {message && (
            <p className="registration-notice" role="status">
              {message}
            </p>
          )}

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="form-field">
              <span>{content.fields.email.label}</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={updateField}
                placeholder={content.fields.email.placeholder}
                autoComplete="email"
                required
              />
            </label>

            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? "Envoi…" : "Recevoir mon lien de connexion"}
            </button>
          </form>

          <p className="login-card__registration">
            {content.registrationPrompt}{" "}
            <Link to={routes.registration}>{content.registrationLink}</Link>
          </p>
          <div className="login-card__back-wrapper">
            <Link className="login-card__back btn btn-secondary" to={routes.home}>
              Revenir à l’accueil
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
