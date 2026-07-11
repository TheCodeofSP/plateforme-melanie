export default function SectionDivider({
  variant = "primary",
  symbol = "✦",
}) {
  return (
    <div
      className={`section-divider section-divider--${variant}`}
      aria-hidden="true"
    >
      <span className="section-divider__line" />

      <span className="section-divider__symbol">{symbol}</span>

      <span className="section-divider__line" />
    </div>
  );
}