import { prepareArticleBlocks } from "../utils/article-layout.utils.js";

function BlockText({ text, links }) {
  return (
    <>
      {text}
      {links?.map((link, index) => (
        <a key={`${link.url}-${index}`} href={link.url} target="_blank" rel="noreferrer">
          {" "}
          {link.label}
        </a>
      ))}
    </>
  );
}

export default function ResourceBlocks({ blocks = [], article = false }) {
  const validBlocks = Array.isArray(blocks)
    ? blocks.filter((block) => block && typeof block === "object" && typeof block.type === "string")
    : [];

  const displayBlocks = article ? prepareArticleBlocks(validBlocks) : validBlocks;

  return (
    <div className="resource-blocks">
      {displayBlocks.map((block, index) => {
        const key = `${block.type}-${index}`;

        if (block.type === "HEADING") {
          const Heading = block.level === 3 ? "h3" : "h2";
          return (
            <Heading key={key}>
              <BlockText text={block.text} links={block.links} />
            </Heading>
          );
        }

        if (block.type === "QUOTE") {
          return <blockquote key={key}>{block.text}</blockquote>;
        }

        if (["BULLET_LIST", "NUMBERED_LIST"].includes(block.type)) {
          const List = block.type === "NUMBERED_LIST" ? "ol" : "ul";
          return (
            <List key={key}>
              {(Array.isArray(block.items) ? block.items : []).map((item, itemIndex) => (
                <li key={itemIndex}>
                  <BlockText
                    text={typeof item === "string" ? item : item.text}
                    links={typeof item === "object" ? item.links : undefined}
                  />
                </li>
              ))}
            </List>
          );
        }

        if (block.type === "PARAGRAPH") {
          return (
            <p key={key}>
              <BlockText text={block.text} links={block.links} />
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
