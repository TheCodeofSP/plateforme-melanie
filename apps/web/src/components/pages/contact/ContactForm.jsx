import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import { appConfig } from "../../../config/app.config.js";
import { contactContent } from "../../../content/contact.content.js";
import { trackEvent } from "../../../utils/analytics.js";

import "../../../styles/components/pages/contact/contact-form.scss";

export default function ContactForm() {
  const [params] = useSearchParams();
  const [values, setValues] = useState({
    firstName: "",
    email: "",
    intention: params.get("intention") || "question",
    offer: params.get("offre") || "",
    message: "",
  });
  const [opened, setOpened] = useState(false);

  function change(event) {
    setValues((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  function submit(event) {
    event.preventDefault();
    const intention =
      values.intention === "accompagnement"
        ? "Demande concernant un accompagnement"
        : "Question sur La Clairière";
    const subject = values.offer ? `${intention} — ${values.offer}` : intention;
    const body = [
      `Bonjour Mélanie,`,
      "",
      values.message,
      "",
      `Prénom : ${values.firstName}`,
      `Email : ${values.email}`,
    ].join("\n");
    trackEvent("contact_form_submitted", {
      contact_intent: values.intention,
      offer: values.offer || "none",
    });
    setOpened(true);
    window.location.href = `mailto:${appConfig.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div>
        <p className="eyebrow">Un premier échange</p>
        <h2>{contactContent.form.title}</h2>
        <p>{contactContent.form.description}</p>
      </div>
      <label>
        <span>Pourquoi souhaites-tu nous écrire ?</span>
        <select name="intention" value={values.intention} onChange={change}>
          <option value="question">J’ai une question</option>
          <option value="accompagnement">
            Je souhaite parler d’un accompagnement
          </option>
        </select>
      </label>
      {values.intention === "accompagnement" && (
        <label>
          <span>Accompagnement envisagé</span>
          <select name="offer" value={values.offer} onChange={change}>
            <option value="">Je ne sais pas encore</option>
            <option value="seance-ponctuelle">Faire le point</option>
            <option value="aine">Áine — huit séances</option>
            <option value="symptothermie">Comprendre ma fertilité</option>
          </select>
        </label>
      )}
      <label>
        <span>Prénom</span>
        <input
          name="firstName"
          autoComplete="given-name"
          value={values.firstName}
          onChange={change}
          required
        />
      </label>
      <label>
        <span>Adresse email</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={change}
          required
        />
      </label>
      <label>
        <span>Ton message</span>
        <textarea
          name="message"
          rows="7"
          value={values.message}
          onChange={change}
          required
        />
      </label>
      <p className="contact-form__privacy">
        Ces informations servent uniquement à préparer notre échange. Aucun
        contenu du Quiz ou du forum n’est joint à ton message.
      </p>
      <button className="btn btn-primary" type="submit">
        Préparer mon email
      </button>
      {opened && (
        <p className="contact-form__status" role="status">
          Ton application email devrait s’ouvrir avec le message préparé.
          Vérifie-le avant de l’envoyer.
        </p>
      )}
      <p className="contact-form__fallback">
        Si rien ne s’ouvre, écris directement à{" "}
        <a href={`mailto:${appConfig.contactEmail}`}>
          {appConfig.contactEmail}
        </a>
        .
      </p>
    </form>
  );
}
