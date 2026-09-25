function FieldError({ id, message }) {
  return message ? (
    <small className="form-error" id={id}>
      {message}
    </small>
  ) : null;
}

export default function RegistrationIdentityStep({ content, errors, onChange, values }) {
  return (
    <fieldset className="registration-step">
      <legend>{content.title}</legend>
      <p className="registration-step__intro">{content.introduction}</p>

      <div className="registration-form__grid">
        <label className="form-field">
          <span>
            Prénom <span aria-hidden="true">*</span>
          </span>
          <input
            className="form-input"
            name="firstName"
            value={values.firstName}
            onChange={onChange}
            autoComplete="given-name"
            aria-invalid={Boolean(errors.firstName)}
            aria-describedby={errors.firstName ? "firstName-error" : undefined}
          />
          <FieldError id="firstName-error" message={errors.firstName} />
        </label>
        <label className="form-field">
          <span>
            Nom <span aria-hidden="true">*</span>
          </span>
          <input
            className="form-input"
            name="lastName"
            value={values.lastName}
            onChange={onChange}
            autoComplete="family-name"
            aria-invalid={Boolean(errors.lastName)}
            aria-describedby={errors.lastName ? "lastName-error" : undefined}
          />
          <FieldError id="lastName-error" message={errors.lastName} />
        </label>
      </div>

      <label className="form-field">
        <span>
          Pseudonyme <span aria-hidden="true">*</span>
        </span>
        <input
          className="form-input"
          name="pseudonym"
          value={values.pseudonym}
          onChange={onChange}
          autoComplete="nickname"
          aria-invalid={Boolean(errors.pseudonym)}
          aria-describedby={errors.pseudonym ? "pseudonym-error" : "pseudonym-help"}
        />
        <small className="form-help" id="pseudonym-help">
          Il pourra être utilisé pour signer tes publications dans le forum. Tu choisiras, avant
          chaque publication, entre ton pseudonyme et ton prénom.
        </small>
        <FieldError id="pseudonym-error" message={errors.pseudonym} />
      </label>

      <div>
        <label className="registration-check">
          <input
            type="checkbox"
            name="isAdultConfirmed"
            checked={values.isAdultConfirmed}
            onChange={onChange}
          />
          <span>
            Je confirme avoir 18 ans ou plus. <strong aria-hidden="true">*</strong>
          </span>
        </label>
        <FieldError id="isAdultConfirmed-error" message={errors.isAdultConfirmed} />
      </div>
    </fieldset>
  );
}
