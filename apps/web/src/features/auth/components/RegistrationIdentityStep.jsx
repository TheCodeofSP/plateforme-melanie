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
  isMinor,
  onChange,
  values,
}) {
  return (
    <fieldset className="registration-step">
      <legend>{content.title}</legend>
      <p className="registration-step__intro">{content.introduction}</p>

      <div className="registration-form__grid">
        <label className="form-field">
          <span>Prénom</span>
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
          <span>Nom</span>
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
        <span>Pseudonyme</span>
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

      <label className="form-field">
        <span>Date de naissance</span>
        <input
          className="form-input"
          type="date"
          name="dateOfBirth"
          value={values.dateOfBirth}
          onChange={onChange}
          autoComplete="bday"
          aria-invalid={Boolean(errors.dateOfBirth)}
          aria-describedby={
            errors.dateOfBirth ? "dateOfBirth-error" : "dateOfBirth-help"
          }
        />
        <small className="form-help" id="dateOfBirth-help">
          L’inscription est accessible à partir de 15 ans.
        </small>
        <FieldError id="dateOfBirth-error" message={errors.dateOfBirth} />
      </label>

      {isMinor && (
        <label className="form-field registration-step__guardian">
          <span>Email du responsable légal</span>
          <input
            className="form-input"
            type="email"
            name="guardianEmail"
            value={values.guardianEmail}
            onChange={onChange}
            autoComplete="email"
            aria-invalid={Boolean(errors.guardianEmail)}
            aria-describedby={
              errors.guardianEmail
                ? "guardianEmail-error"
                : "guardianEmail-help"
            }
          />
          <small className="form-help" id="guardianEmail-help">
            Une demande d’autorisation lui sera envoyée.
          </small>
          <FieldError id="guardianEmail-error" message={errors.guardianEmail} />
        </label>
      )}
    </fieldset>
  );
}
