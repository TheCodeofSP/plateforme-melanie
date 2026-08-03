import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import EmptyState from "../../../../components/feedback/EmptyState.jsx";
import ErrorState from "../../../../components/feedback/ErrorState.jsx";
import PageLoader from "../../../../components/feedback/PageLoader.jsx";
import SEO from "../../../../components/seo/SEO.jsx";
import { webinarsContent } from "../../../../content/webinars.content.js";
import { askQuestion, cancelRegistration, changeRegistrationSession, getMyWebinars } from "../../api/webinar.service.js";
import { formatWebinarDate, registrationStatuses } from "../../config/webinar.config.js";

export default function MyWebinarsPage() {
  const [items, setItems] = useState(null); const [error, setError] = useState(null);
  async function load() { try { setItems(await getMyWebinars()); } catch (apiError) { setError(apiError); } }
  useEffect(() => { getMyWebinars().then(setItems).catch(setError); }, []);
  if (!items && !error) return <PageLoader />;
  async function cancel(item) { if (!window.confirm("Libérer cette place ? Cette action ne pourra pas être annulée.")) return; try { await cancelRegistration(item._id); await load(); } catch (apiError) { setError(apiError); } }
  async function question(item) { const content = window.prompt("Quelle question souhaites-tu transmettre à Mélanie ?"); if (!content) return; try { await askQuestion(item.session._id, content); window.alert("Ta question a bien été transmise."); } catch (apiError) { setError(apiError); } }
  async function change(item) { const sessionId = window.prompt("Identifiant de la nouvelle session"); if (!sessionId) return; if (!window.confirm("Ta place actuelle sera libérée et la nouvelle session peut être complète. Continuer ?")) return; try { await changeRegistrationSession(item._id, sessionId); await load(); } catch (apiError) { setError(apiError); } }
  return <main className="webinars-page"><SEO title="Mes webinaires" noIndex /><div className="page-container webinars-content"><header><p className="section-eyebrow">Mes rendez-vous</p><h1>Mes webinaires</h1><p>Retrouve tes inscriptions, les informations de connexion et les replays disponibles.</p></header>{error && <ErrorState title="Tes webinaires sont indisponibles" description={error.message} />}{items?.length === 0 && <EmptyState title="Aucun rendez-vous réservé" description={webinarsContent.empty.account} />}<div className="my-webinars">{items?.map((item) => <article key={item._id}><span className="webinar-badge">{registrationStatuses[item.status]}</span><h2>{item.webinar?.title || "Webinaire"}</h2>{item.session && <><time>{formatWebinarDate(item.session.startsAt)}</time><p>{item.session.durationMinutes} minutes</p></>}{item.waitlistPosition && <p>Position sur la liste d’attente : {item.waitlistPosition}</p>}{item.confirmationExpiresAt && <Link className="btn btn-primary" to={`/webinaires/inscriptions/${item._id}/confirmer`}>Confirmer ma place</Link>}{item.session?.meetUrl && <a className="btn btn-primary" href={item.session.meetUrl} target="_blank" rel="noreferrer">Rejoindre le webinaire</a>}<div className="webinar-actions">{["REGISTERED", "WAITLISTED"].includes(item.status) && <><button type="button" onClick={() => cancel(item)}>Me désinscrire</button><button type="button" onClick={() => change(item)}>Changer de session</button></>}{item.status === "REGISTERED" && <button type="button" onClick={() => question(item)}>Poser une question</button>}{item.webinar?.replay?.available && <Link to={`/webinaires/${item.webinar._id}/replay`}>Voir le replay</Link>}{["PRESENT", "ABSENT"].includes(item.status) && <Link to={`/webinaires/${item.webinar?._id}/evaluation`} state={{ sessionId: item.session?._id }}>Donner mon avis</Link>}</div></article>)}</div></div></main>;
}
