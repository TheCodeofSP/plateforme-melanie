import { Link, useLocation } from "react-router-dom";

import SEO from "../../../components/seo/SEO.jsx";
import { routes } from "../../../config/routes.config.js";
import { registrationContent } from "../../../content/registration.content.js";
import ResendVerificationEmail from "../components/ResendVerificationEmail.jsx";
import { maskEmail } from "../utils/registration.utils.js";

import "../../../styles/pages/registration.scss";

export default function RegistrationConfirmationPage() {
  const { state } = useLocation();
  const hasContext = Boolean(state?.email);

  return (
    <>
      <SEO title="Confirme ton inscription" description="Finalise la création de ton compte." noIndex />
      <main className="registration-page">
        <section className="registration-card registration-result">
          <span className="registration-result__icon" aria-hidden="true">✉</span>
          <p className="section-eyebrow">Vérifie ta messagerie</p>
          <h1>{registrationContent.confirmation.title}</h1>
          {hasContext ? (
            <>
              <p>{state.requiresParentalAuthorization ? registrationContent.confirmation.minor : registrationContent.confirmation.adult}</p>
              <p className="registration-result__email">Message envoyé à <strong>{maskEmail(state.email)}</strong></p>
              {!state.emailsAccepted && <p className="registration-notice">{registrationContent.confirmation.emailFailure}</p>}
              <ResendVerificationEmail initialEmail={state.email} />
            </>
          ) : (
            <>
              <p>Cette page s’affiche après la création d’un compte. Tu peux commencer ton inscription ou demander un nouveau lien si ton compte existe déjà.</p>
              <ResendVerificationEmail />
            </>
          )}
          <div className="registration-result__links">
            {!hasContext && <Link className="btn btn-primary" to={routes.registration}>Créer mon compte</Link>}
            <Link to={routes.login}>Revenir à la connexion</Link>
          </div>
        </section>
      </main>
    </>
  );
}
