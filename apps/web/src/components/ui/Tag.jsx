import "../../styles/components/pages/ui/tag.scss";

export default function Tag({
  children,
  variant = "primary",
}) {
  return (
    <span className={`tag tag--${variant}`}>
      {children}
    </span>
  );
}