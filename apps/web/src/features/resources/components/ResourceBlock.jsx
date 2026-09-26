function ParagraphBlock({ block }) {
  return (
    <p>
      {block.text}
      {block.links?.map((link) => (
        <a key={link.url} href={link.url} target="_blank" rel="noreferrer">
          {" "}
          {link.label}
        </a>
      ))}
    </p>
  );
}

function ListBlock({ block, ordered }) {
  const List = ordered ? "ol" : "ul";
  return (
    <List>
      {block.items?.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </List>
  );
}

export default function ResourceBlock({ block }) {
  switch (block.type) {
    case "HEADING":
      return <h2>{block.text}</h2>;
    case "QUOTE":
      return <blockquote>{block.text}</blockquote>;
    case "BULLET_LIST":
      return <ListBlock block={block} ordered={false} />;
    case "NUMBERED_LIST":
      return <ListBlock block={block} ordered />;
    case "PARAGRAPH":
      return <ParagraphBlock block={block} />;
    case "IMAGE":
      return (
        <figure className="resource-blocks__image">
          <img src={block.src} alt={block.alt} loading="lazy" />
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      );
    default:
      return null;
  }
}
