export default function ResourceBlocks({ blocks = [] }) {
  const validBlocks = Array.isArray(blocks)
    ? blocks.filter((block) => block && typeof block === "object" && typeof block.type === "string")
    : [];

  return (
    <div className="resource-blocks">
      {validBlocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        if (block.type === "HEADING") {
          const Heading = block.level === 3 ? "h3" : "h2";
          return <Heading key={key}>{block.text}</Heading>;
        }

        if (block.type === "QUOTE") {
          return <blockquote key={key}>{block.text}</blockquote>;
        }

        if (block.type === "BULLET_LIST") {
          return (
            <ul key={key}>
              {block.items?.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          );
        }

        if (block.type === "NUMBERED_LIST") {
          return (
            <ol key={key}>
              {block.items?.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ol>
          );
        }

        if (block.type === "PARAGRAPH") {
          return (
            <p key={key}>
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

        if (block.type === "IMAGE") {
          return (
            <figure className="resource-blocks__image" key={key}>
              <img src={block.src} alt={block.alt || ""} loading="lazy" />
              {block.caption && <figcaption>{block.caption}</figcaption>}
            </figure>
          );
        }

        return null;
      })}
    </div>
  );
}
