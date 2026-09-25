import { useState } from "react";

import { register } from "../api/auth.service.js";
import { validateRegistrationStep } from "../validations/registration.validation.js";

const initialValues = {
  firstName: "",
  lastName: "",
  pseudonym: "",
  isAdultConfirmed: false,
  email: "",
  hasAcceptedTerms: false,
  hasAcknowledgedPrivacyPolicy: false,
  newsletterConsent: true,
  commercialEmailConsent: false,
};

export default function useRegistrationForm(prefill = {}) {
  const [values, setValues] = useState(() => ({
    ...initialValues,
    ...prefill,
  }));
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const [validationMessage, setValidationMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(event) {
    const { name, checked, type, value } = event.target;
    setValues((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setApiError(null);
    setValidationMessage("");
  }

  function goNext() {
    const nextErrors = validateRegistrationStep(step, values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      setValidationMessage(
        "Merci de remplir tous les champs obligatoires pour continuer l’inscription.",
      );
      return false;
    }
    setValidationMessage("");
    setStep((current) => Math.min(current + 1, 2));
    return true;
  }

  function goPrevious() {
    setErrors({});
    setApiError(null);
    setValidationMessage("");
    setStep((current) => Math.max(current - 1, 0));
  }

  async function submit() {
    const errorsByStep = [0, 1, 2].map((currentStep) =>
      validateRegistrationStep(currentStep, values),
    );
    const nextErrors = Object.assign({}, ...errorsByStep);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const firstInvalidStep = errorsByStep.findIndex(
        (stepErrors) => Object.keys(stepErrors).length > 0,
      );
      setStep(firstInvalidStep);
      setValidationMessage(
        "Merci de remplir tous les champs obligatoires pour continuer l’inscription.",
      );
      return null;
    }

    setApiError(null);
    setIsSubmitting(true);
    const payload = {
      email: values.email.trim(),
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      pseudonym: values.pseudonym.trim(),
      isAdultConfirmed: values.isAdultConfirmed,
      hasAcceptedTerms: values.hasAcceptedTerms,
      hasAcknowledgedPrivacyPolicy: values.hasAcknowledgedPrivacyPolicy,
      newsletterConsent: values.newsletterConsent,
      commercialEmailConsent: values.commercialEmailConsent,
    };

    try {
      return await register(payload);
    } catch (error) {
      setApiError(error);
      return null;
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    apiError,
    errors,
    goNext,
    goPrevious,
    isSubmitting,
    setStep,
    step,
    submit,
    updateField,
    values,
    validationMessage,
  };
}
