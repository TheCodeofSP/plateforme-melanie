export default function PublicationSignatureChoice({ firstName, pseudonym, value, onChange }) {
  return (
    <fieldset className="clearing-signature">
      <legend>Comment souhaites-tu signer cette publication ?</legend>
      <p>Ce choix concerne uniquement cette publication. Ton nom reste privé.</p>
      <div>
        <label className="clearing-check">
          <input
            type="radio"
            name="signatureType"
            value="PSEUDONYM"
            checked={value === "PSEUDONYM"}
            onChange={onChange}
          />
          <span>
            Avec mon pseudonyme : <strong>{pseudonym}</strong>
          </span>
        </label>
        <label className="clearing-check">
          <input
            type="radio"
            name="signatureType"
            value="FIRST_NAME"
            checked={value === "FIRST_NAME"}
            onChange={onChange}
          />
          <span>
            Avec mon prénom : <strong>{firstName}</strong>
          </span>
        </label>
      </div>
    </fieldset>
  );
}
