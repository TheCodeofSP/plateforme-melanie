import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import ErrorState from "../../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../../components/feedback/PageLoader.jsx";
import SEO from "../../../../components/seo/SEO.jsx";
import { getAdminWebinar, getSessionQuestions, setQuestionStatus } from "../../api/webinar-admin.service.js";
import { formatWebinarDate } from "../../config/webinar.config.js";

export default function AdminWebinarQuestionsPage() {
  const { webinarId } = useParams(); const [webinar, setWebinar] = useState(null); const [sessionId, setSessionId] = useState(""); const [items, setItems] = useState([]); const [error, setError] = useState(null);
  useEffect(() => { getAdminWebinar(webinarId).then((result) => { setWebinar(result); if (result.sessions[0]) setSessionId(result.sessions[0]._id); }).catch(setError); }, [webinarId]);
  useEffect(() => { if (sessionId) getSessionQuestions(sessionId).then(setItems).catch(setError); }, [sessionId]);
  if (!webinar && !error) return <PageLoader />;
  async function change(id, status) { await setQuestionStatus(id, status); setItems(await getSessionQuestions(sessionId)); }
  return <main className="webinar-admin"><SEO title="Questions du webinaire" noIndex /><header><p className="section-eyebrow">Préparer les échanges</p><h1>Questions reçues</h1></header>{error && <ErrorState title="Les questions sont indisponibles" description={error.message} />}<label><span>Session</span><select value={sessionId} onChange={(event) => setSessionId(event.target.value)}>{webinar?.sessions.map((session) => <option key={session._id} value={session._id}>{formatWebinarDate(session.startsAt)}</option>)}</select></label><div className="webinar-admin-list">{items.map((item) => <article key={item._id}><span>{item.status}</span><h2>{item.author?.pseudonym || `${item.author?.firstName || ""} ${item.author?.lastName || ""}`}</h2><p>{item.content}</p><div className="webinar-actions"><button onClick={() => change(item._id, "ANSWERED")}>Marquer traitée</button><button onClick={() => change(item._id, "ARCHIVED")}>Archiver</button><button onClick={() => change(item._id, "DELETED")}>Supprimer</button></div></article>)}</div></main>;
}
