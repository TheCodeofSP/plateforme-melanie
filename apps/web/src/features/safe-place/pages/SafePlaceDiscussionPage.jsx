import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import FormErrorSummary from "../../../components/feedback/FormErrorSummary.jsx";
import PageLoader from "../../../components/feedback/PageLoader.jsx";
import SEO from "../../../components/seo/SEO.jsx";
import { routes } from "../../../config/routes.config.js";
import { safePlaceContent } from "../../../content/safe-place.content.js";
import useAuth from "../../../hooks/useAuth.js";
import {
  createComment,
  createReport,
  deleteComment,
  deletePost,
  getComments,
  getPost,
  replyToComment,
  updateComment,
} from "../api/safe-place.service.js";
import ReactionBar from "../components/ReactionBar.jsx";
import PublicationSignatureChoice from "../components/PublicationSignatureChoice.jsx";
import SafePlaceImage from "../components/SafePlaceImage.jsx";
import SafePlaceShell from "../components/SafePlaceShell.jsx";
import { reportReasons } from "../config/safe-place.config.js";

export default function SafePlaceDiscussionPage() {
  const { postId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [signatureType, setSignatureType] = useState("PSEUDONYM");
  const [replyTo, setReplyTo] = useState(null);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  async function loadComments() {
    setComments(await getComments(postId));
  }
  useEffect(() => {
    getPost(postId).then(setPost).catch(setError);
    getComments(postId).then(setComments).catch(setError);
  }, [postId]);
  if (!post && !error) return <PageLoader />;
  const ownsPost = post?.isOwner;
  async function submit(event) {
    event.preventDefault();
    if (!content.trim()) return;
    setBusy(true);
    try {
      if (editing) await updateComment(editing, content.trim());
      else if (replyTo) await replyToComment(replyTo, content.trim(), signatureType);
      else await createComment(postId, content.trim(), signatureType);
      setContent("");
      setSignatureType("PSEUDONYM");
      setReplyTo(null);
      setEditing(null);
      await loadComments();
    } catch (apiError) {
      setError(apiError);
    } finally {
      setBusy(false);
    }
  }
  async function report(targetType, targetId) {
    const answer = window.prompt(
      `Motif : ${reportReasons.map((item) => `${item.value} (${item.label})`).join(", ")}`,
      "OTHER",
    );
    if (!answer) return;
    const reason = reportReasons.some((item) => item.value === answer) ? answer : "OTHER";
    const details =
      reason === "OTHER" ? window.prompt("Précision facultative") || undefined : undefined;
    try {
      await createReport({ targetType, targetId, reason, details });
    } catch (apiError) {
      setError(apiError);
    }
  }
  return (
    <SafePlaceShell>
      <SEO title={post?.title || "Discussion"} noIndex />
      {error && <FormErrorSummary error={error} />}
      {post && (
        <>
          <article className="clearing-discussion">
            <Link to={`/espace-communaute/categories/${post.category?._id}`}>
              ← {post.category?.name}
            </Link>
            <header>
              <div>
                {post.isPinned && <span className="clearing-state">Repère épinglé</span>}
                {post.isClosed && <span className="clearing-state">Discussion fermée</span>}
              </div>
              <h1>{post.title}</h1>
              <p>
                Déposée par <strong>{post.author?.name || "Autrice retirée"}</strong> le{" "}
                {new Date(post.createdAt).toLocaleDateString("fr-FR")}
                {post.editedAt ? " · Modifiée" : ""}
              </p>
            </header>
            {post.adminWarning?.text && (
              <aside className="clearing-warning">
                <strong>Repère de Mélanie</strong>
                <p>{post.adminWarning.text}</p>
              </aside>
            )}
            <div className="clearing-discussion__content">
              {post.content.split("\n").map((line, index) => (
                <p key={index}>{line || "\u00A0"}</p>
              ))}
            </div>
            {post.images?.length > 0 && (
              <div className="clearing-gallery">
                {post.images.map((image) => (
                  <SafePlaceImage key={image.media?._id || image.media} image={image} />
                ))}
              </div>
            )}
            {post.links?.length > 0 && (
              <ul>
                {post.links.map((link) => (
                  <li key={link.url}>
                    <a href={link.url} target="_blank" rel="noreferrer">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <ReactionBar
              target="POST"
              id={post._id}
              currentReaction={post.currentReaction}
              counters={post.counters}
              disabled={!post.allowReactions || post.isClosed}
            />
            <div className="clearing-actions">
              {ownsPost && !post.isClosed && (
                <Link to={`/espace-communaute/discussions/${post._id}/modifier`}>Modifier</Link>
              )}
              {ownsPost && (
                <button
                  onClick={async () => {
                    if (window.confirm("Supprimer cette discussion ?")) {
                      await deletePost(post._id);
                      navigate(routes.community);
                    }
                  }}
                >
                  Supprimer
                </button>
              )}
              <button onClick={() => report("POST", post._id)}>Signaler</button>
            </div>
          </article>
          <section className="clearing-comments">
            <h2>Poursuivre l’échange</h2>
            {post.isClosed || !post.allowComments ? (
              <p>Cette discussion est fermée aux nouvelles réponses.</p>
            ) : (
              <form onSubmit={submit}>
                <label>
                  <span>
                    {editing
                      ? "Modifier ton commentaire"
                      : replyTo
                        ? "Ta réponse"
                        : "Déposer un commentaire"}
                  </span>
                  <textarea
                    value={content}
                    maxLength="5000"
                    onChange={(event) => setContent(event.target.value)}
                    required
                  />
                </label>
                <small>
                  {content.length}/5000 · {safePlaceContent.composer.mention}
                </small>
                {!editing && (
                  <PublicationSignatureChoice
                    firstName={user?.firstName}
                    pseudonym={user?.pseudonym}
                    value={signatureType}
                    onChange={(event) => setSignatureType(event.target.value)}
                  />
                )}
                <div>
                  {(replyTo || editing) && (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setReplyTo(null);
                        setEditing(null);
                        setContent("");
                      }}
                    >
                      Annuler
                    </button>
                  )}
                  <button className="btn btn-primary" disabled={busy}>
                    Déposer
                  </button>
                </div>
              </form>
            )}
            {comments.length === 0 && <p>{safePlaceContent.empty.comments}</p>}
            <div>
              {comments.map((comment) => (
                <Comment
                  key={comment._id}
                  comment={comment}
                  closed={post.isClosed}
                  onReply={(id) => {
                    setReplyTo(id);
                    setEditing(null);
                    setContent("");
                  }}
                  onEdit={(item) => {
                    setEditing(item._id);
                    setReplyTo(null);
                    setContent(item.content);
                  }}
                  onDelete={async (id) => {
                    if (window.confirm("Supprimer ce commentaire ?")) {
                      await deleteComment(id);
                      await loadComments();
                    }
                  }}
                  onReport={(id) => report("COMMENT", id)}
                />
              ))}
            </div>
          </section>
        </>
      )}
    </SafePlaceShell>
  );
}

function Comment({ comment, closed, onReply, onEdit, onDelete, onReport }) {
  const owns = comment.isOwner;
  return (
    <article className="clearing-comment">
      <header>
        <strong>{comment.author?.name || "Commentaire supprimé"}</strong>
        <time>
          {new Date(comment.createdAt).toLocaleDateString("fr-FR")}
          {comment.editedAt ? " · Modifié" : ""}
        </time>
      </header>
      <p>{comment.content}</p>
      {comment.status === "VISIBLE" && (
        <>
          <ReactionBar
            target="COMMENT"
            id={comment._id}
            currentReaction={comment.currentReaction}
            counters={comment.counters}
            disabled={closed}
          />
          <div className="clearing-actions">
            {!closed && <button onClick={() => onReply(comment._id)}>Poursuivre l’échange</button>}
            {owns && !closed && <button onClick={() => onEdit(comment)}>Modifier</button>}
            {owns && <button onClick={() => onDelete(comment._id)}>Supprimer</button>}
            <button onClick={() => onReport(comment._id)}>Signaler</button>
          </div>
        </>
      )}
      {comment.replies?.map((reply) => (
        <Comment
          key={reply._id}
          comment={reply}
          closed={closed}
          onReply={() => onReply(comment._id)}
          onEdit={onEdit}
          onDelete={onDelete}
          onReport={onReport}
        />
      ))}
    </article>
  );
}
