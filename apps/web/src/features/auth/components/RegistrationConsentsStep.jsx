import { Link } from "react-router-dom";

import { routes } from "../../../config/routes.config.js";

function Consent({ children, error, name, onChange, value }) {
  return (
    <div>
      <label className="registration-check">
        <input type="checkbox" name={name} checked={value} onChange={onChange} />
        <span>{children}</span>
      </label>
      {error && <small className="form-error">{error}</small>}
    </div>
  );
}

export default function RegistrationConsentsStep({ content, errors, onChange, values }) {
  return (
    <fieldset className="registration-step">
      <legend>{content.title}</legend>
      <p className="registration-step__intro">{content.introduction}</p>
      <div className="registration-consents">
        <Consent name="hasAcceptedTerms" value={values.hasAcceptedTerms} onChange={onChange} error={errors.hasAcceptedTerms}>
          J’accepte les <Link to={routes.terms} target="_blank">conditions générales d’utilisation</Link>. <strong>Obligatoire</strong>
        </Consent>
        <Consent name="hasAcknowledgedPrivacyPolicy" value={values.hasAcknowledgedPrivacyPolicy} onChange={onChange} error={errors.hasAcknowledgedPrivacyPolicy}>
          Je confirme avoir lu la <Link to={routes.privacyPolicy} target="_blank">politique de confidentialité</Link>. <strong>Obligatoire</strong>
        </Consent>
        <Consent name="newsletterConsent" value={values.newsletterConsent} onChange={onChange}>
          Je souhaite recevoir la newsletter de Mélanie.
        </Consent>
        <Consent name="commercialEmailConsent" value={values.commercialEmailConsent} onChange={onChange}>
          J’accepte de recevoir des informations sur les accompagnements et les événements proposés par Mélanie.
        </Consent>
      </div>
    </fieldset>
  );
}
