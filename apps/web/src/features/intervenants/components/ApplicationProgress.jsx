import { applicationSteps } from "../config/intervenant.config.js";

export default function ApplicationProgress({ current }) {
  return <nav className="application-progress" aria-label="Progression de la candidature"><p>Étape {current + 1} sur {applicationSteps.length}</p><ol>{applicationSteps.map((label, index) => <li key={label} className={index === current ? "is-current" : index < current ? "is-complete" : ""} aria-current={index === current ? "step" : undefined}>{label}</li>)}</ol></nav>;
}
