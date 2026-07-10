export default function AccompanimentIcon({ icon, className = "" }) {
  return (
    <span className={className} aria-hidden="true">
      {icon}
    </span>
  );
}