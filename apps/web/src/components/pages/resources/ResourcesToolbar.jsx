import ResourcesFilters from "./ResourcesFilters.jsx";

import "../../../styles/components/pages/resources/resources-toolbar.scss";

export default function ResourcesToolbar({
  filters,
  activeFilter,
  onFilterChange,
  searchTerm,
  onSearchChange,
  resultsCount,
}) {
  return (
    <div className="resources-toolbar">
      <div className="resources-toolbar__search">
        <input
          type="search"
          placeholder="Rechercher une ressource..."
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
          aria-label="Rechercher une ressource"
        />
      </div>

      <ResourcesFilters
        filters={filters}
        activeFilter={activeFilter}
        onFilterChange={onFilterChange}
      />

      <p className="resources-toolbar__count">
        {resultsCount} ressource{resultsCount > 1 ? "s" : ""}
      </p>
    </div>
  );
}