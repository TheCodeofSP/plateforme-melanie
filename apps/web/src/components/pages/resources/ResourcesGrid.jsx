import { useMemo, useState } from "react";

import { resourcesContent } from "../../../content/resources.content.js";

import ResourceFlipCard from "./ResourceFlipCard.jsx";
import ResourcesToolbar from "./ResourcesToolbar.jsx";

import "../../../styles/components/pages/resources/resources-grid.scss";

export default function ResourcesGrid() {
  const { filters, resources } = resourcesContent;

  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredResources = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();

    return resources.filter((resource) => {
      const matchesFilter =
        activeFilter === "all" || resource.categoryId === activeFilter;

      const matchesSearch =
        search.length === 0 ||
        resource.title.toLowerCase().includes(search) ||
        resource.description.toLowerCase().includes(search) ||
        resource.category.toLowerCase().includes(search) ||
        resource.type.label.toLowerCase().includes(search);

      return matchesFilter && matchesSearch;
    });
  }, [resources, activeFilter, searchTerm]);

  return (
    <section className="resources-grid-section">
      <div className="page-container">
        <div className="resources-grid-section__header">
          <span className="eyebrow">Bibliothèque pédagogique</span>

          <h2>Toutes les ressources</h2>

          <p>
            Retrouve ici les contenus créés ou sélectionnés par Mélanie pour
            avancer à ton rythme.
          </p>
        </div>

        <ResourcesToolbar
          filters={filters}
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          resultsCount={filteredResources.length}
        />

        <div className="resources-grid">
          {filteredResources.map((resource) => (
            <ResourceFlipCard
              key={resource.id}
              resource={resource}
            />
          ))}
        </div>
      </div>
    </section>
  );
}