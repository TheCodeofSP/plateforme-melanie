import "../../../styles/components/pages/resources/resources-filters.scss";

export default function ResourcesFilters({ filters, activeFilter, onFilterChange }) {
  return (
    <div className="resources-filters" aria-label="Filtrer les ressources">
      {filters.map((filter) => (
        <button
          key={filter.id}
          className={`resources-filters__button ${
            activeFilter === filter.id ? "resources-filters__button--active" : ""
          }`}
          type="button"
          onClick={() => onFilterChange(filter.id)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}