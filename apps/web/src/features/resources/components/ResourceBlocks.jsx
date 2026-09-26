import ResourceBlock from "./ResourceBlock.jsx";

export default function ResourceBlocks({ blocks = [] }) {
  return (
    <div className="resource-blocks">
      {blocks.map((block, index) => (
        <ResourceBlock block={block} key={`${block.type}-${index}`} />
      ))}
    </div>
  );
}
