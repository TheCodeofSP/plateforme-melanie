import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ErrorState from "../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { anonymizeContact, createNote, createTask, getContact, sendInvitation, updateContact } from "../api/crm.service.js";
import { crmPriorities, crmStatuses } from "../config/crm.config.js";

export default function AdminContactDetailPage() {
  const { contactId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [note, setNote] = useState("");
  const [task, setTask] = useState({ title: "", dueAt: "", priority: "NORMAL" });
  const load = () => getContact(contactId).then(setData).catch(setError);
  useEffect(load, [contactId]);
  if (!data && !error) return <PageLoader />;
  if (error) return <ErrorState title="Cette fiche est indisponible" description={error.message} />;
  const { contact } = data;

  async function update(field, value) { await updateContact(contactId, { [field]: value }); load(); }
  async function addNote(event) { event.preventDefault(); await createNote(contactId, { text: note, pinned: false }); setNote(""); load(); }
  async function addTask(event) { event.preventDefault(); await createTask(contactId, { ...task, dueAt: new Date(task.dueAt).toISOString(), note: null }); setTask({ title: "", dueAt: "", priority: "NORMAL" }); load(); }
  async function anonymize() { if (!window.confirm("Anonymiser définitivement ce contact ?")) return; await anonymizeContact(contactId); navigate("/administration/crm/contacts"); }

  return (
    <main className="admin-dashboard">
      <SEO title="Fiche CRM" noIndex />
      <header><div><p className="section-eyebrow">{contact.kind}</p><h1>{contact.firstName} {contact.lastName}</h1><p>{contact.primaryEmail}</p></div><button className="btn btn-secondary" onClick={() => sendInvitation(contactId)}>Envoyer une invitation</button></header>
      <div className="admin-detail-grid">
        <section><h2>Suivi</h2><label><span>Statut</span><select value={contact.status} onChange={(event) => update("status", event.target.value)}>{Object.entries(crmStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label><span>Priorité</span><select value={contact.priority} onChange={(event) => update("priority", event.target.value)}>{Object.entries(crmPriorities).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></section>
        <section><h2>Repères</h2><dl><div><dt>Profil SPM</dt><dd>{contact.currentSpmProfile || "Non défini"}</dd></div><div><dt>Consentement marketing</dt><dd>{contact.marketingConsent?.granted ? "Accordé" : "Non accordé"}</dd></div></dl><button className="btn btn-danger" onClick={anonymize}>Anonymiser</button></section>
      </div>
      <div className="admin-detail-grid">
        <section><h2>Notes privées</h2><form onSubmit={addNote}><label><span>Nouvelle note</span><textarea rows="4" value={note} onChange={(event) => setNote(event.target.value)} required /></label><button className="btn btn-primary">Ajouter</button></form><ul>{data.notes?.map((item) => <li key={item._id}>{item.text}</li>)}</ul></section>
        <section><h2>Prochaine action</h2><form onSubmit={addTask}><label><span>Intitulé</span><input value={task.title} onChange={(event) => setTask({ ...task, title: event.target.value })} required /></label><label><span>Échéance</span><input type="datetime-local" value={task.dueAt} onChange={(event) => setTask({ ...task, dueAt: event.target.value })} required /></label><button className="btn btn-primary">Planifier</button></form><ul>{data.tasks?.map((item) => <li key={item._id}>{item.title} · {new Date(item.dueAt).toLocaleString("fr-FR")}</li>)}</ul></section>
      </div>
    </main>
  );
}
