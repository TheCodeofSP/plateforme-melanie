import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import ResourceBlocks from "./ResourceBlocks.jsx";

afterEach(cleanup);

describe("ResourceBlocks", () => {
  it("affiche les blocs éditoriaux pris en charge", () => {
    render(
      <ResourceBlocks
        blocks={[
          { type: "HEADING", text: "Comprendre" },
          { type: "PARAGRAPH", text: "Un contenu accessible." },
          { type: "BULLET_LIST", items: ["Premier point"] },
          { type: "QUOTE", text: "Prendre son temps." },
          { type: "IMAGE", src: "/images/articles/illustration.jpg", alt: "Une illustration" },
        ]}
      />,
    );
    expect(screen.getByRole("heading", { name: "Comprendre" })).toBeInTheDocument();
    expect(screen.getByText("Premier point")).toBeInTheDocument();
    expect(screen.getByText("Prendre son temps.")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Une illustration" })).toHaveAttribute(
      "src",
      "/images/articles/illustration.jpg",
    );
  });

  it("ignore un bloc inconnu sans faire planter la page", () => {
    const { container } = render(
      <ResourceBlocks blocks={[{ type: "UNKNOWN", text: "Invisible" }]} />,
    );
    expect(container).not.toHaveTextContent("Invisible");
  });

  it("ignore les entrées vides reçues depuis une ancienne ressource", () => {
    render(
      <ResourceBlocks blocks={[null, undefined, { type: "PARAGRAPH", text: "Contenu valide" }]} />,
    );

    expect(screen.getByText("Contenu valide")).toBeInTheDocument();
  });

  it("accepte une collection de blocs absente", () => {
    const { container } = render(<ResourceBlocks blocks={null} />);
    expect(container.querySelector(".resource-blocks")).toBeEmptyDOMElement();
  });
});

it("applique le modèle aux articles et conserve les liens dans les listes", () => {
  const blocks = [
    { type: "HEADING", text: "Douleurs des seins : qu’est-ce que cela signifie ?" },
    { type: "HEADING", text: "Douleurs dues aux changements hormonaux" },
    {
      type: "PARAGRAPH",
      text: "Une rougeur",
      links: [{ url: "https://example.org/source", label: "Source" }],
    },
    { type: "PARAGRAPH", text: "Un gonflement localisé" },
    {
      type: "PARAGRAPH",
      text: "Un changement cutané (ex : une peau avec l’aspect chair de poule)",
    },
    { type: "PARAGRAPH", text: "Un mamelon inversé" },
    { type: "PARAGRAPH", text: "Un nodule." },
  ];
  const { rerender } = render(<ResourceBlocks blocks={blocks} article />);
  expect(
    screen.getByRole("heading", { name: "Douleurs dues aux changements hormonaux", level: 3 }),
  ).toBeInTheDocument();
  expect(screen.getAllByRole("listitem")).toHaveLength(5);
  expect(screen.getByRole("link", { name: "Source" })).toHaveAttribute(
    "href",
    "https://example.org/source",
  );
  rerender(<ResourceBlocks blocks={blocks} />);
  expect(screen.queryByRole("list")).not.toBeInTheDocument();
  expect(
    screen.getByRole("heading", { name: "Douleurs dues aux changements hormonaux", level: 2 }),
  ).toBeInTheDocument();
});
