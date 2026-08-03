import { useState } from "react";

import PasswordRequirements from "./PasswordRequirements.jsx";

export default function RegistrationSecurityStep({ content, errors, onChange, values }) {
  const [showPasswords, setShowPasswords] = useState(false);

  return (
    <fieldset className="registration-step">
      <legend>{content.title}</legend>
      <p className="registration-step__intro">{content.introduction}</p>
      <label className="form-field">
        <span>Adresse email</span>
        <input className="form-input" type="email" name="email" value={values.email} onChange={onChange} autoComplete="email" aria-invalid={Boolean(errors.email)} />
        {errors.email && <small className="form-error">{errors.email}</small>}
      </label>
      <label className="form-field">
        <span>Mot de passe</span>
        <input className="form-input" type={showPasswords ? "text" : "password"} name="password" value={values.password} onChange={onChange} autoComplete="new-password" aria-invalid={Boolean(errors.password)} />
        {errors.password && <small className="form-error">{errors.password}</small>}
      </label>
      <PasswordRequirements password={values.password} />
      <label className="form-field">
        <span>Confirme ton mot de passe</span>
        <input className="form-input" type={showPasswords ? "text" : "password"} name="passwordConfirmation" value={values.passwordConfirmation} onChange={onChange} autoComplete="new-password" aria-invalid={Boolean(errors.passwordConfirmation)} />
        {errors.passwordConfirmation && <small className="form-error">{errors.passwordConfirmation}</small>}
      </label>
      <label className="registration-check registration-check--compact">
        <input type="checkbox" checked={showPasswords} onChange={(event) => setShowPasswords(event.target.checked)} />
        <span>Afficher les mots de passe</span>
      </label>
    </fieldset>
  );
}
