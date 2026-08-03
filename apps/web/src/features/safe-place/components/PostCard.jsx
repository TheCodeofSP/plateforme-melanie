import { Link } from "react-router-dom";

export default function PostCard({ post }) {
  return <article className={`clearing-post-card ${post.isPinned ? "is-pinned" : ""}`}><div><span>{post.category?.name}</span>{post.isPinned && <span className="clearing-state">Repère épinglé</span>}{post.isClosed && <span className="clearing-state">Discussion fermée</span>}</div><h3><Link to={`/espace-communaute/discussions/${post._id}`}>{post.title}</Link></h3><p>{post.content?.slice(0, 180)}{post.content?.length > 180 ? "…" : ""}</p><footer><span>Par {post.author?.name || "Publication supprimée"}</span><span>{post.counters?.comments || 0} commentaire{post.counters?.comments > 1 ? "s" : ""}</span><time>{new Date(post.lastActivityAt || post.createdAt).toLocaleDateString("fr-FR")}</time></footer></article>;
}
