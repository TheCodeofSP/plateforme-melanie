import { useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import FormErrorSummary from "../../../components/feedback/FormErrorSummary.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { routes } from "../../../config/routes.config.js";
import { registrationContent } from "../../../content/registration.content.js";
import RegistrationConsentsStep from "../components/RegistrationConsentsStep.jsx";
import RegistrationIdentityStep from "../components/RegistrationIdentityStep.jsx";
import RegistrationProgress from "../components/RegistrationProgress.jsx";
import RegistrationSecurityStep from "../components/RegistrationSecurityStep.jsx";
import useRegistrationForm from "../hooks/useRegistrationForm.js";

import "../../../styles/pages/registration.scss";

export default function RegistrationPage() {
  const location = useLocation();
  const comesFromQuiz = location.state?.source === "quiz";
  const form = useRegistrationForm(
    comesFromQuiz ? { email: location.state.quizEmail || "" } : {},
  );
  const navigate = useNavigate();
  const headingRef = useRef(null);
  const currentContent = registrationContent.steps[form.step];

  useEffect(() => {
    if (form.step > 0) headingRef.current?.focus();
  }, [form.step]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (form.step < 2) {
      form.goNext();
      return;
    }
    const result = await form.submit();
    if (result) {
      navigate(routes.registrationConfirmation, {
        state: {
          email: form.values.email,
          emailsAccepted: result.emailsAccepted,
          requiresParentalAuthorization: result.requiresParentalAuthorization,
        },
      });
    }
  }

  return (
    <>
      <SEO title="Créer mon compte" description="Crée ton espace personnel sur la plateforme de Mélanie Dizet." noIndex />
      <main className="registration-page">
        <section className="registration-card" aria-labelledby="registration-title">
          <header className="registration-card__header">
            <p className="section-eyebrow">{registrationContent.eyebrow}</p>
            <h1 id="registration-title">{registrationContent.title}</h1>
            <p>{registrationContent.description}</p>
          </header>
          <RegistrationProgress currentStep={form.step} steps={registrationContent.steps} />
          {comesFromQuiz && (
            <p className="registration-notice registration-notice--quiz">
              Utilise la même adresse email que pour le Quiz SPM afin de rattacher
              ton résultat à ton espace.
            </p>
          )}
          <h2 className="sr-only" ref={headingRef} tabIndex="-1">{currentContent.title}</h2>
          {form.apiError && <FormErrorSummary error={form.apiError} />}
          <form className="registration-form" onSubmit={handleSubmit} noValidate>
            {form.step === 0 && <RegistrationIdentityStep content={{ ...currentContent, ...registrationContent.identity }} {...form} onChange={form.updateField} />}
            {form.step === 1 && <RegistrationSecurityStep content={{ ...currentContent, ...registrationContent.security }} {...form} onChange={form.updateField} />}
            {form.step === 2 && <RegistrationConsentsStep content={{ ...currentContent, ...registrationContent.consents }} {...form} onChange={form.updateField} />}
            <div className="registration-form__actions">
              {form.step > 0 && <button className="btn btn-secondary" type="button" onClick={form.goPrevious}>Retour</button>}
              <button className="btn btn-primary" type="submit" disabled={form.isSubmitting}>
                {form.isSubmitting ? "Création…" : form.step === 2 ? "Créer mon compte" : "Continuer"}
              </button>
            </div>
          </form>
          <p className="registration-card__login">Tu as déjà un compte ? <Link to={routes.login}>Te connecter</Link></p>
        </section>
      </main>
    </>
  );
}
