import { applicationStatuses } from "../config/intervenant.config.js";

export default function ApplicationStatus({ status }) {
  return <span className={`intervenant-status intervenant-status--${status?.toLowerCase()}`}>{applicationStatuses[status] || status}</span>;
}
