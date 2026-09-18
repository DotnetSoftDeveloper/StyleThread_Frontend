import React from 'react';

interface InputProps{
  label? : string;
  name : string;
  type?: string;
  value?: string;
  onChange:(e: React.ChangeEvent<HTMLInputElement>)=>void;
  placeholder?:string;
  required?:boolean;
}

export const Input:React.FC<InputProps> = ({ label, name, type = 'text', value, onChange, placeholder, required = false }) => (
  <div className="inputContainer">
    <label className="inputLabel">{label}:</label>
    <input
      className="customInput"
      placeholder={placeholder}
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      required={required}
    />
    <div className="inputUnderline"></div>
  </div>
);
