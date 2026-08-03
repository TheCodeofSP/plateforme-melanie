import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import ErrorState from "../../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../../components/feedback/PageLoader.jsx";
import SEO from "../../../../components/seo/SEO.jsx";
import { getAdminWebinar, getSessionParticipants, markAttendance } from "../../api/webinar-admin.service.js";
import { formatWebinarDate, registrationStatuses } from "../../config/webinar.config.js";

export default function AdminWebinarParticipantsPage() {
  const { webinarId } = useParams(); const [webinar, setWebinar] = useState(null); const [sessionId, setSessionId] = useState(""); const [items, setItems] = useState([]); const [error, setError] = useState(null);
  useEffect(() => { getAdminWebinar(webinarId).then((result) => { setWebinar(result); if (result.sessions[0]) setSessionId(result.sessions[0]._id); }).catch(setError); }, [webinarId]);
  useEffect(() => { if (sessionId) getSessionParticipants(sessionId).then(setItems).catch(setError); }, [sessionId]);
  if (!webinar && !error) return <PageLoader />;
  async function attendance(id, status) { try { await markAttendance(id, status); setItems(await getSessionParticipants(sessionId)); } catch (apiError) { setError(apiError); } }
  return <main className="webinar-admin"><SEO title="Participantes du webinaire" noIndex /><header><p className="section-eyebrow">Suivi des inscriptions</p><h1>Participantes</h1></header>{error && <ErrorState title="Les participantes sont indisponibles" description={error.message} />}<label><span>Session</span><select value={sessionId} onChange={(event) => setSessionId(event.target.value)}>{webinar?.sessions.map((session) => <option key={session._id} value={session._id}>{formatWebinarDate(session.startsAt)}</option>)}</select></label><div className="webinar-admin-list">{items.map((item) => <article key={item._id}><span>{registrationStatuses[item.status]}</span><h2>{item.user?.firstName} {item.user?.lastName}</h2><p>{item.user?.email} · {item.user?.pseudonym}</p>{["REGISTERED", "PRESENT", "ABSENT"].includes(item.status) && <div className="webinar-actions"><button type="button" onClick={() => attendance(item._id, "PRESENT")}>Présente</button><button type="button" onClick={() => attendance(item._id, "ABSENT")}>Absente</button></div>}</article>)}</div></main>;
}
