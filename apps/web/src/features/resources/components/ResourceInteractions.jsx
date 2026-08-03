import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import FormErrorSummary from "../../../components/feedback/FormErrorSummary.jsx";
import { routes } from "../../../config/routes.config.js";
import useAuth from "../../../hooks/useAuth.js";
import {
  addComment, addReply, getComments, likeResource, removeComment,
  reportContent, unlikeResource,
} from "../api/resource-interaction.service.js";
import { reportReasons } from "../config/resource.config.js";

export default function ResourceInteractions({ resource }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [liked, setLiked] = useState(Boolean(resource.liked));
  const [likes, setLikes] = useState(resource.counters?.likes || 0);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState(null);

  useEffect(() => {
    let active = true;
    getComments(resource._id).then((items) => active && setComments(items)).catch(setError);
    return () => { active = false; };
  }, [resource._id]);

  async function toggleLike() {
    if (!isAuthenticated) return;
    setBusy(true);
    try {
      const result = liked ? await unlikeResource(resource._id) : await likeResource(resource._id);
      setLiked(result.liked);
      setLikes((value) => Math.max(0, value + (result.liked ? 1 : -1)));
    } catch (apiError) { setError(apiError); } finally { setBusy(false); }
  }

  async function submitComment(event) {
    event.preventDefault();
    if (!content.trim()) return;
    setBusy(true);
    try {
      if (replyTo) await addReply(resource._id, replyTo, content.trim());
      else await addComment(resource._id, content.trim());
      setContent(""); setReplyTo(null);
      setComments(await getComments(resource._id));
    } catch (apiError) { setError(apiError); } finally { setBusy(false); }
  }

  async function remove(commentId) {
    if (!window.confirm("Supprimer ce commentaire ?")) return;
    try { await removeComment(resource._id, commentId); setComments(await getComments(resource._id)); } catch (apiError) { setError(apiError); }
  }

  async function submitReport(event) {
    event.preventDefault();
    setBusy(true);
    try {
      await reportContent({ targetType: report.type, resourceId: resource._id, commentId: report.commentId || null, reason: report.reason, details: report.details || null });
      setReport(null);
    } catch (apiError) { setError(apiError); } finally { setBusy(false); }
  }

  const loginLink = <Link className="btn btn-secondary" to={routes.login} state={{ from: location.pathname }}>Se connecter pour participer</Link>;
  return (
    <section className="resource-interactions">
      <div className="resource-interactions__like"><button className="btn btn-secondary" disabled={busy || !isAuthenticated} onClick={toggleLike} aria-pressed={liked}>{liked ? "♥ Ressource appréciée" : "♡ J’aime cette ressource"} · {likes}</button>{!isAuthenticated && loginLink}<button className="resource-report-link" onClick={() => isAuthenticated && setReport({ type: "RESOURCE", reason: "OTHER", details: "" })} disabled={!isAuthenticated}>Signaler la ressource</button></div>
      <h2>Commentaires</h2>
      {error && <FormErrorSummary error={error} />}
      {isAuthenticated ? <form className="resource-comment-form" onSubmit={submitComment}><label><span>{replyTo ? "Ta réponse" : "Ton commentaire"}</span><textarea value={content} maxLength="2000" onChange={(event) => setContent(event.target.value)} required /></label><small>{content.length}/2000</small><div>{replyTo && <button type="button" className="btn btn-secondary" onClick={() => setReplyTo(null)}>Annuler</button>}<button className="btn btn-primary" disabled={busy}>Publier</button></div></form> : loginLink}
      {!comments.length && <p>Soyez la première à ouvrir la discussion.</p>}
      <div className="resource-comments">{comments.map((comment) => <Comment key={comment._id} comment={comment} user={user} onReply={setReplyTo} onRemove={remove} onReport={(commentId) => setReport({ type: "COMMENT", commentId, reason: "OTHER", details: "" })} />)}</div>
      {report && <form className="resource-report-form" onSubmit={submitReport}><h3>Signaler ce contenu</h3><label><span>Motif</span><select value={report.reason} onChange={(event) => setReport({ ...report, reason: event.target.value })}>{reportReasons.map((reason) => <option key={reason.value} value={reason.value}>{reason.label}</option>)}</select></label><label><span>Précision facultative</span><textarea maxLength="2000" value={report.details} onChange={(event) => setReport({ ...report, details: event.target.value })} /></label><div><button type="button" className="btn btn-secondary" onClick={() => setReport(null)}>Annuler</button><button className="btn btn-primary" disabled={busy}>Transmettre</button></div></form>}
    </section>
  );
}

function Comment({ comment, user, onReply, onRemove, onReport }) {
  const publicName = user?.role === "ADMIN" ? "Mélanie" : user?.pseudonym;
  const owns = Boolean(publicName && comment.author?.name === publicName);
  return <article className="resource-comment"><header><strong>{comment.author?.name || "Commentaire supprimé"}</strong><time>{new Date(comment.createdAt).toLocaleDateString("fr-FR")}</time></header><p>{comment.content}</p>{!comment.deleted && <div><button onClick={() => onReply(comment._id)}>Répondre</button>{owns && <button onClick={() => onRemove(comment._id)}>Supprimer</button>}<button onClick={() => onReport(comment._id)}>Signaler</button></div>}{comment.replies?.map((reply) => { const ownsReply = Boolean(publicName && reply.author?.name === publicName); return <article className="resource-comment resource-comment--reply" key={reply._id}><strong>{reply.author?.name || "Commentaire supprimé"}</strong><p>{reply.content}</p><div>{ownsReply && <button onClick={() => onRemove(reply._id)}>Supprimer</button>}<button onClick={() => onReport(reply._id)}>Signaler</button></div></article>; })}</article>;
}
