import React from 'react';

interface CheckboxProps{
  label?: string;
  name: string;
  checked: boolean;
  onChange:(e: React.ChangeEvent<HTMLInputElement>)=>void;
}

export const Checkbox:React.FC<CheckboxProps> = ({ label, name, checked, onChange }) => (
  <div className="inputContainer">
    <label className="inputLabel">{label}:</label>
    <input
      className="customInput"
      type="checkbox"
      name={name}
      checked={checked}
      onChange={onChange}
    />
  </div>
);
