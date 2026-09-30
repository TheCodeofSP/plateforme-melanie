import "../../../styles/components/resource-access.scss";

export default function ResourceAccessBadge({ isPrivate = false }) {
  return (
    <span className={`resource-access${isPrivate ? " resource-access--private" : ""}`}>
      {isPrivate && (
        <svg
          className="resource-access__icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
          focusable="false"
        >
          <rect x="5" y="10" width="14" height="11" rx="3" />
          <path d="M8 10V7a4 4 0 0 1 8 0v3" />
          <path d="M12 14v3" />
        </svg>
      )}
      {isPrivate ? "Accès privé" : "Accès libre"}
    </span>
  );
}
