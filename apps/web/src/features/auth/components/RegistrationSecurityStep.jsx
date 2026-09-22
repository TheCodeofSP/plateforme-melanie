export default function RegistrationSecurityStep({
  content,
  errors,
  onChange,
  values,
}) {
  return (
    <fieldset className="registration-step">
      <legend>{content.title}</legend>
      <p className="registration-step__intro">{content.introduction}</p>
      <label className="form-field">
        <span>
          Adresse email <span aria-hidden="true">*</span>
        </span>
        <input
          className="form-input"
          type="email"
          name="email"
          value={values.email}
          onChange={onChange}
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email && <small className="form-error">{errors.email}</small>}
      </label>
      <p className="registration-notice">
        Aucun mot de passe à retenir : après l’activation, tu recevras par email
        un lien personnel et temporaire pour chacune de tes connexions. Chaque
        lien ne pourra être utilisé qu’une seule fois et expirera après 15
        minutes.
      </p>
    </fieldset>
  );
}
