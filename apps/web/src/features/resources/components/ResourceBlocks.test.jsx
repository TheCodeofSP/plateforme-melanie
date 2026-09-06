import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ResourceBlocks from "./ResourceBlocks.jsx";

describe("ResourceBlocks", () => {
  it("affiche les blocs éditoriaux pris en charge", () => {
    render(<ResourceBlocks blocks={[
      { type: "HEADING", text: "Comprendre" },
      { type: "PARAGRAPH", text: "Un contenu accessible." },
      { type: "BULLET_LIST", items: ["Premier point"] },
      { type: "QUOTE", text: "Prendre son temps." },
      { type: "IMAGE", src: "/images/articles/illustration.jpg", alt: "Une illustration" },
    ]} />);
    expect(screen.getByRole("heading", { name: "Comprendre" })).toBeInTheDocument();
    expect(screen.getByText("Premier point")).toBeInTheDocument();
    expect(screen.getByText("Prendre son temps.")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Une illustration" })).toHaveAttribute("src", "/images/articles/illustration.jpg");
  });

  it("ignore un bloc inconnu sans faire planter la page", () => {
    const { container } = render(<ResourceBlocks blocks={[{ type: "UNKNOWN", text: "Invisible" }]} />);
    expect(container).not.toHaveTextContent("Invisible");
  });
});
