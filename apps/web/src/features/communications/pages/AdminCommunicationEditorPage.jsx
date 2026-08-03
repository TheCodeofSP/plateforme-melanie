import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import FormErrorSummary from "../../../components/feedback/FormErrorSummary.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { createCommunication, getCommunication, updateCommunication } from "../api/communication-admin.service.js";

const emptyForm = {
  internalTitle: "",
  type: "PLATFORM_NEWS",
  channel: "EMAIL",
  subject: "",
  preheader: "",
  notificationTitle: "",
  notificationMessage: "",
  notificationPath: "/",
  senderName: "Mélanie",
  preferenceCategory: "PLATFORM_NEWS",
  administrativeReason: "",
  body: "",
  targeting: {
    roles: [],
    spmProfiles: [],
    includeQuizContacts: false,
    webinarStatuses: [],
    manualUsers: [],
    manualQuizParticipants: [],
    manualCrmContacts: [],
  },
};

export default function AdminCommunicationEditorPage() {
  const { communicationId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!communicationId) return;
    getCommunication(communicationId).then(({ communication }) => {
      setForm({
        ...emptyForm,
        ...communication,
        body: communication.blocks?.find((block) => block.type === "TEXT")?.text || "",
      });
    });
  }, [communicationId]);

  async function submit(event) {
    event.preventDefault();
    try {
      const isEmail = form.channel === "EMAIL";
      const isAdministrative = form.type === "ADMINISTRATIVE";
      const payload = {
        internalTitle: form.internalTitle,
        type: form.type,
        channel: form.channel,
        subject: isEmail ? form.subject : null,
        preheader: isEmail ? form.preheader || null : null,
        notificationTitle: isEmail ? null : form.notificationTitle,
        notificationMessage: isEmail ? null : form.notificationMessage,
        notificationPath: isEmail ? null : form.notificationPath,
        blocks: isEmail ? [{ type: "TEXT", text: form.body }] : [],
        senderName: form.senderName,
        preferenceCategory: isAdministrative ? null : form.preferenceCategory,
        administrativeReason: isAdministrative ? form.administrativeReason : null,
        targeting: form.targeting,
        timezone: "Europe/Paris",
      };
      const communication = communicationId
        ? await updateCommunication(communicationId, payload)
        : await createCommunication(payload);
      navigate(`/administration/communications/${communication._id}`);
    } catch (apiError) {
      setError(apiError);
    }
  }

  return (
    <main className="admin-dashboard">
      <SEO title={communicationId ? "Modifier une communication" : "Nouvelle communication"} noIndex />
      <header><div><p className="section-eyebrow">Communications</p><h1>{communicationId ? "Modifier le brouillon" : "Préparer une communication"}</h1></div></header>
      {error && <FormErrorSummary error={error} />}
      <form className="admin-form" onSubmit={submit}>
        <section>
          <h2>Cadre</h2>
          <label><span>Nom interne</span><input value={form.internalTitle} onChange={(event) => setForm({ ...form, internalTitle: event.target.value })} required /></label>
          <label><span>Canal</span><select value={form.channel} onChange={(event) => setForm({ ...form, channel: event.target.value })}><option value="EMAIL">Email</option><option value="IN_APP">Notification dans la plateforme</option></select></label>
          <label><span>Nature</span><select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}><option value="EDITORIAL_NEWSLETTER">Newsletter éditoriale</option><option value="PLATFORM_NEWS">Actualité de la plateforme</option><option value="RESOURCE_ANNOUNCEMENT">Ressource</option><option value="WEBINAR_ANNOUNCEMENT">Webinaire</option><option value="ADMINISTRATIVE">Administrative</option></select></label>
        </section>
        <section>
          <h2>Message</h2>
          {form.channel === "EMAIL" ? <><label><span>Objet</span><input value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} required /></label><label><span>Pré-en-tête</span><input value={form.preheader} onChange={(event) => setForm({ ...form, preheader: event.target.value })} /></label><label><span>Contenu</span><textarea rows="10" value={form.body} onChange={(event) => setForm({ ...form, body: event.target.value })} required /></label></> : <><label><span>Titre</span><input value={form.notificationTitle} onChange={(event) => setForm({ ...form, notificationTitle: event.target.value })} required /></label><label><span>Message</span><textarea rows="5" value={form.notificationMessage} onChange={(event) => setForm({ ...form, notificationMessage: event.target.value })} required /></label><label><span>Page à ouvrir</span><input value={form.notificationPath} onChange={(event) => setForm({ ...form, notificationPath: event.target.value })} required /></label></>}
        </section>
        {form.type === "ADMINISTRATIVE" && <label><span>Justification administrative</span><textarea value={form.administrativeReason} onChange={(event) => setForm({ ...form, administrativeReason: event.target.value })} required /></label>}
        <button className="btn btn-primary">Enregistrer le brouillon</button>
      </form>
    </main>
  );
}
