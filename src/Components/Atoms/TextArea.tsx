import React from "react";

interface TextAreaProps {
  label?: string;
  name: string;
  value?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void; // Corrected type
  placeholder?: string;
  required?: boolean; // Made optional (default value provided)
}

export const TextArea: React.FC<TextAreaProps> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  required = false,
}) => (
  <div className="inputContainer">
    {label && <label className="inputLabel">{label}:</label>} {/* Render only if label exists */}
    <textarea
      className="customInput description"
      placeholder={placeholder}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
    ></textarea>
    <div className="inputUnderline"></div>
  </div>
);
