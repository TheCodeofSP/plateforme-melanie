export default function PageAnchors({ label = "Sur cette page", items }) {
  return (
    <nav className="page-anchors" aria-label={label}>
      <div className="page-container page-anchors__inner">
        <span>{label}</span>
        <div>
          {items.map((item) => (
            <a key={item.id} href={`#${item.id}`}>
              {item.label}
            </a>
          ))}
          <a className="page-anchors__back-to-top" href="#main-content">
            <span aria-hidden="true">↑</span>
            <span>Haut de page</span>
          </a>
        </div>
      </div>
    </nav>
  );
}
