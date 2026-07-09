import "../../styles/components/pages/ui/form-field.scss";

export default function FormField({
  id,
  label,
  type = "text",
  value,
  placeholder,
  onChange,
  textarea = false,
  rows = 6,
  required = false,
}) {
  return (
    <div className="form-field">
      <label htmlFor={id}>
        {label}

        {required && <span className="form-field__required">*</span>}
      </label>

      {textarea ? (
        <textarea
          id={id}
          value={value}
          rows={rows}
          placeholder={placeholder}
          onChange={onChange}
          required={required}
        />
      ) : (
        <input
          id={id}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          required={required}
        />
      )}
    </div>
  );
}
