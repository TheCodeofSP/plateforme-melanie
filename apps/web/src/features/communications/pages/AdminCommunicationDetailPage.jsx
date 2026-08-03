import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import ErrorState from "../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { getCommunication, previewCommunication, previewRecipients, runCommunicationAction, scheduleCommunication, sendCommunication, testCommunication } from "../api/communication-admin.service.js";

export default function AdminCommunicationDetailPage() {
  const { communicationId } = useParams();
  const [data, setData] = useState(null);
  const [preview, setPreview] = useState(null);
  const [recipients, setRecipients] = useState(null);
  const [schedule, setSchedule] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [error, setError] = useState(null);
  const load = () => getCommunication(communicationId).then(setData).catch(setError);
  useEffect(load, [communicationId]);
  if (!data && !error) return <PageLoader />;
  if (error) return <ErrorState title="Cette communication est indisponible" description={error.message} />;
  const item = data.communication;
  async function action(callback) { await callback(); load(); }
  return (
    <main className="admin-dashboard">
      <SEO title="Détail communication" noIndex />
      <header><div><p className="section-eyebrow">{item.channel} · {item.status}</p><h1>{item.internalTitle}</h1><p>{item.subject || item.notificationTitle}</p></div>{item.status === "DRAFT" && <Link className="btn btn-secondary" to={`/administration/communications/${communicationId}/modifier`}>Modifier</Link>}</header>
      <div className="admin-detail-grid">
        <section><h2>Vérifications</h2><div className="admin-actions"><button className="btn btn-secondary" onClick={() => previewCommunication(communicationId).then(setPreview)}>Prévisualiser</button><button className="btn btn-secondary" onClick={() => previewRecipients(communicationId).then(setRecipients)}>Voir les destinataires</button></div>{preview && <pre className="admin-preview">{JSON.stringify(preview, null, 2)}</pre>}{recipients && <p>{recipients.pagination?.total ?? recipients.total ?? 0} destinataire(s) correspondant au ciblage.</p>}</section>
        <section><h2>Test et programmation</h2><label><span>Email de test facultatif</span><input type="email" value={testEmail} onChange={(event) => setTestEmail(event.target.value)} /></label><button className="btn btn-secondary" onClick={() => testCommunication(communicationId, testEmail || undefined)}>Envoyer un test</button><label><span>Date d’envoi</span><input type="datetime-local" value={schedule} onChange={(event) => setSchedule(event.target.value)} /></label><div className="admin-actions"><button className="btn btn-secondary" disabled={!schedule} onClick={() => action(() => scheduleCommunication(communicationId, new Date(schedule).toISOString()))}>Programmer</button><button className="btn btn-primary" onClick={() => action(() => sendCommunication(communicationId))}>Envoyer maintenant</button></div></section>
      </div>
      <div className="admin-actions">{item.status === "SCHEDULED" && <button className="btn btn-secondary" onClick={() => action(() => runCommunicationAction(communicationId, "cancel"))}>Annuler la programmation</button>}<button className="btn btn-secondary" onClick={() => action(() => runCommunicationAction(communicationId, "duplicate"))}>Dupliquer</button></div>
    </main>
  );
}
