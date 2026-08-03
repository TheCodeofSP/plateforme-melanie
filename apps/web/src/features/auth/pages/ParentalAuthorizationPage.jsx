import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import FormErrorSummary from "../../../components/feedback/FormErrorSummary.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { routes } from "../../../config/routes.config.js";
import { parentalAuthorizationContent } from "../../../content/parental-authorization.content.js";
import {
  getParentalAuthorization,
  respondToParentalAuthorization,
} from "../api/auth.service.js";

import "../../../styles/pages/registration.scss";

export default function ParentalAuthorizationPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [details, setDetails] = useState(null);
  const [error, setError] = useState(token ? null : { message: "Ce lien d’autorisation est incomplet." });
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;
    let active = true;
    getParentalAuthorization(token)
      .then((data) => { if (active) setDetails(data); })
      .catch((apiError) => { if (active) setError(apiError); });
    return () => { active = false; };
  }, [token]);

  async function decide(decision) {
    setError(null);
    setIsSubmitting(true);
    try {
      setResult(await respondToParentalAuthorization(token, decision));
    } catch (apiError) {
      setError(apiError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <SEO title="Autorisation parentale" description="Autorisation d’ouverture d’un compte." noIndex />
      <main className="registration-page">
        <section className="registration-card registration-result">
          <p className="section-eyebrow">{parentalAuthorizationContent.eyebrow}</p>
          <h1>{parentalAuthorizationContent.title}</h1>
          {error && <FormErrorSummary error={error} />}
          {!details && !error && <PageLoader label="Chargement de la demande…" />}
          {details && !result && (
            <>
              <p>{parentalAuthorizationContent.description}</p>
              <div className="parental-summary">
                <span>Compte concerné</span>
                <strong>{details.minorFirstName}</strong>
                {details.expiresAt && <small>Lien valable jusqu’au {new Intl.DateTimeFormat("fr-FR", { dateStyle: "long" }).format(new Date(details.expiresAt))}</small>}
              </div>
              <p>{parentalAuthorizationContent.explanation}</p>
              <div className="registration-form__actions">
                <button className="btn btn-secondary" type="button" onClick={() => decide("DECLINE")} disabled={isSubmitting}>Refuser</button>
                <button className="btn btn-primary" type="button" onClick={() => decide("APPROVE")} disabled={isSubmitting}>Autoriser</button>
              </div>
            </>
          )}
          {result && (
            <>
              <span className="registration-result__icon" aria-hidden="true">{result.authorizationStatus === "APPROVED" ? "✓" : "–"}</span>
              <h2>Réponse enregistrée</h2>
              <p>{result.message}</p>
              <Link to={routes.home}>Revenir au site</Link>
            </>
          )}
        </section>
      </main>
    </>
  );
}
