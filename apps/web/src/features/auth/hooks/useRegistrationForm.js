import { useMemo, useState } from "react";

import { register } from "../api/auth.service.js";
import { calculateAge } from "../utils/registration.utils.js";
import { validateRegistrationStep } from "../validations/registration.validation.js";

const initialValues = {
  firstName: "",
  lastName: "",
  pseudonym: "",
  dateOfBirth: "",
  guardianEmail: "",
  email: "",
  password: "",
  passwordConfirmation: "",
  hasAcceptedTerms: false,
  hasAcknowledgedPrivacyPolicy: false,
  newsletterConsent: false,
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const age = useMemo(() => calculateAge(values.dateOfBirth), [values.dateOfBirth]);
  const isMinor = age !== null && age >= 15 && age < 18;

  function updateField(event) {
    const { name, checked, type, value } = event.target;
    setValues((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErrors((current) => ({ ...current, [name]: undefined }));
    setApiError(null);
  }

  function goNext() {
    const nextErrors = validateRegistrationStep(step, values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return false;
    setStep((current) => Math.min(current + 1, 2));
    return true;
  }

  function goPrevious() {
    setErrors({});
    setApiError(null);
    setStep((current) => Math.max(current - 1, 0));
  }

  async function submit() {
    const nextErrors = validateRegistrationStep(2, values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return null;

    setApiError(null);
    setIsSubmitting(true);
    const payload = {
      email: values.email.trim(),
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      pseudonym: values.pseudonym.trim(),
      dateOfBirth: values.dateOfBirth,
      password: values.password,
      passwordConfirmation: values.passwordConfirmation,
      hasAcceptedTerms: values.hasAcceptedTerms,
      hasAcknowledgedPrivacyPolicy: values.hasAcknowledgedPrivacyPolicy,
      newsletterConsent: values.newsletterConsent,
      commercialEmailConsent: values.commercialEmailConsent,
      ...(isMinor ? { guardianEmail: values.guardianEmail.trim() } : {}),
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
    age,
    apiError,
    errors,
    goNext,
    goPrevious,
    isMinor,
    isSubmitting,
    setStep,
    step,
    submit,
    updateField,
    values,
  };
}
