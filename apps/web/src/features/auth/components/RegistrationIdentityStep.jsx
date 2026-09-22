function FieldError({ id, message }) {
  return message ? (
    <small className="form-error" id={id}>
      {message}
    </small>
  ) : null;
}

export default function RegistrationIdentityStep({
  content,
  errors,
  onChange,
  values,
}) {
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
          aria-describedby={
            errors.pseudonym ? "pseudonym-error" : "pseudonym-help"
          }
        />
        <small className="form-help" id="pseudonym-help">
          C’est le nom qui sera visible dans le forum de La Clairière.
        </small>
        <FieldError id="pseudonym-error" message={errors.pseudonym} />
      </label>

      <fieldset className="registration-choice">
        <legend>Nom visible dans le forum</legend>
        <p className="form-help">
          Ton nom reste privé. Tu choisis si ton prénom accompagne ton
          pseudonyme.
        </p>
        <label className="registration-check">
          <input
            type="radio"
            name="profileVisibility"
            value="PSEUDONYM_ONLY"
            checked={values.profileVisibility === "PSEUDONYM_ONLY"}
            onChange={onChange}
          />
          <span>Mon pseudonyme</span>
        </label>
        <label className="registration-check">
          <input
            type="radio"
            name="profileVisibility"
            value="FIRST_NAME"
            checked={values.profileVisibility === "FIRST_NAME"}
            onChange={onChange}
          />
          <span>Mon prénom</span>
        </label>
      </fieldset>

      <div>
        <label className="registration-check">
          <input
            type="checkbox"
            name="isAdultConfirmed"
            checked={values.isAdultConfirmed}
            onChange={onChange}
          />
          <span>
            Je confirme avoir 18 ans ou plus.{" "}
            <strong aria-hidden="true">*</strong>
          </span>
        </label>
        <FieldError
          id="isAdultConfirmed-error"
          message={errors.isAdultConfirmed}
        />
      </div>
    </fieldset>
  );
}
