import React from 'react';

interface Option {
  [key: string]: string | number;
}

interface SelectProps{
  label : string;
  name : string;
  value : string;
  onChange : (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>)=>void;
  options : Option[];
  optionId : string;
  optionName: string;
}

export const Select:React.FC<SelectProps> = ({ label, name, value, onChange, options, optionId, optionName }) => (
  <div className="inputContainer">
    <label className="inputLabel">{label}:</label>
    <select
      className="customInput"
      name={name}
      value={value}
      onChange={onChange}
      required
    >
      <option value="">Select {label}</option>
      {options.map((option) => (
        <option key={option[optionId]} value={option[optionId]}>
          {option[optionName]}
        </option>
      ))}
    </select>
    <div className="inputUnderline"></div>
  </div>
);
