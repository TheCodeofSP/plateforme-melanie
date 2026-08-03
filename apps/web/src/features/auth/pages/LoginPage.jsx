import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import FormErrorSummary from "../../../components/feedback/FormErrorSummary.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { roleHome, routes } from "../../../config/routes.config.js";
import { authContent } from "../../../content/auth.content.js";
import useAuth from "../../../hooks/useAuth.js";

import "../../../styles/pages/login.scss";

export default function LoginPage() {
  const { isAuthenticated, login, status, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
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
      const authenticatedUser = await login(form);
      navigate(location.state?.from || roleHome(authenticatedUser.role), {
        replace: true,
      });
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

          {error && <FormErrorSummary error={error} />}

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

            <label className="form-field">
              <span>{content.fields.password.label}</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={updateField}
                placeholder={content.fields.password.placeholder}
                autoComplete="current-password"
                required
              />
            </label>

            <label className="login-form__remember">
              <input
                type="checkbox"
                name="rememberMe"
                checked={form.rememberMe}
                onChange={updateField}
              />
              <span>{content.fields.rememberMe}</span>
            </label>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Connexion…" : content.submit}
            </button>
          </form>

          <p className="login-card__registration">
            {content.registrationPrompt}{" "}
            <Link to={routes.registration}>{content.registrationLink}</Link>
          </p>
          <p className="login-card__pending">{content.passwordResetPending}</p>
          <Link className="login-card__back" to={routes.home}>
            Revenir à l’accueil
          </Link>
        </section>
      </main>
    </>
  );
}
