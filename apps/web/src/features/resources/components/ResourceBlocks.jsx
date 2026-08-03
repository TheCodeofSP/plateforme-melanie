export default function ResourceBlocks({ blocks = [] }) {
  return <div className="resource-blocks">{blocks.map((block, index) => {
    const key = `${block.type}-${index}`;
    if (block.type === "HEADING") return <h2 key={key}>{block.text}</h2>;
    if (block.type === "QUOTE") return <blockquote key={key}>{block.text}</blockquote>;
    if (block.type === "BULLET_LIST") return <ul key={key}>{block.items?.map((item) => <li key={item}>{item}</li>)}</ul>;
    if (block.type === "NUMBERED_LIST") return <ol key={key}>{block.items?.map((item) => <li key={item}>{item}</li>)}</ol>;
    if (block.type === "PARAGRAPH") return <p key={key}>{block.text}{block.links?.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noreferrer"> {link.label}</a>)}</p>;
    return null;
  })}</div>;
}
