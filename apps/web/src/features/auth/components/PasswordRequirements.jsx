import { passwordChecks } from "../utils/registration.utils.js";

const labels = {
  length: "8 à 128 caractères",
  uppercase: "une lettre majuscule",
  lowercase: "une lettre minuscule",
  number: "un chiffre",
  special: "un caractère spécial",
};

export default function PasswordRequirements({ password }) {
  const checks = passwordChecks(password);

  return (
    <div className="password-requirements" aria-live="polite">
      <p>Ton mot de passe doit contenir :</p>
      <ul>
        {Object.entries(labels).map(([key, label]) => (
          <li key={key} className={checks[key] ? "is-valid" : ""}>
            <span aria-hidden="true">{checks[key] ? "✓" : "○"}</span>
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
