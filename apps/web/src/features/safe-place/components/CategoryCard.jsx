import { Link } from "react-router-dom";

export default function CategoryCard({ category }) {
  return <article className="clearing-category"><span aria-hidden="true">⌁</span><div><h3><Link to={`/espace-communaute/categories/${category._id}`}>{category.name}</Link></h3><p>{category.description}</p><small>{category.counters?.posts || 0} discussion{category.counters?.posts > 1 ? "s" : ""}{category.adminOnly ? " · Annonces de Mélanie" : ""}</small></div></article>;
}
