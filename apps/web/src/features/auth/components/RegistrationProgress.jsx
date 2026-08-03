export default function RegistrationProgress({ currentStep, steps }) {
  return (
    <nav className="registration-progress" aria-label="Progression de l’inscription">
      <ol>
        {steps.map((step, index) => (
          <li
            key={step.short}
            className={index === currentStep ? "is-current" : index < currentStep ? "is-done" : ""}
            aria-current={index === currentStep ? "step" : undefined}
          >
            <span>{index < currentStep ? "✓" : index + 1}</span>
            <small>{step.short}</small>
          </li>
        ))}
      </ol>
    </nav>
  );
}
