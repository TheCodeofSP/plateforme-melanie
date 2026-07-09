import { useState } from "react";

import FormField from "../../ui/FormField";

import { contactContent } from "../../../content/contact.content.js";

import "../../../styles/components/pages/contact/contact-form.scss";

export default function ContactForm() {
  const { form } = contactContent;

  const [values, setValues] = useState({
    firstName: "",
    email: "",
    subject: "",
    message: "",
  });

  function handleChange(event) {
    setValues({
      ...values,
      [event.target.id]: event.target.value,
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    console.log(values);
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <h2>{form.title}</h2>

      <p>{form.description}</p>

      <FormField
        required
        id="firstName"
        label={form.fields.firstName.label}
        value={values.firstName}
        placeholder={form.fields.firstName.placeholder}
        onChange={handleChange}
      />

      <FormField
        required
        id="email"
        type="email"
        label={form.fields.email.label}
        value={values.email}
        placeholder={form.fields.email.placeholder}
        onChange={handleChange}
      />

      <FormField
        required
        id="subject"
        label={form.fields.subject.label}
        value={values.subject}
        placeholder={form.fields.subject.placeholder}
        onChange={handleChange}
      />

      <FormField
        required
        id="message"
        textarea
        label={form.fields.message.label}
        value={values.message}
        placeholder={form.fields.message.placeholder}
        onChange={handleChange}
      />

      <button className="btn btn-primary" type="submit">
        {form.submit}
      </button>
    </form>
  );
}
