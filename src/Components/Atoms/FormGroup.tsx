import React from "react";
import { Input } from "./Input";
import { TextArea } from "./TextArea";
import { Select } from "./Select";

interface Option {
  [key: string]: string | number;
}

interface FormGroupProps {
  label: string;
  type: "text" | "number" | "textarea" | "select";
  name: string;
  value?: string | number;
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder?: string;
  required?: boolean;
  options?: Option[];
  optionId?: string;
  optionName?: string;
}

export const FormGroup: React.FC<FormGroupProps> = ({
  label,
  type,
  name,
  value,
  onChange,
  placeholder,
  required,
  options = [],
  optionId = "id",
  optionName = "name",
}) => {
  switch (type) {
    case "text":
    case "number":
      return (
        <Input
          label={label}
          name={name}
          type={type}
          value={value !== undefined ? value.toString() : ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
        />
      );
    case "textarea":
      return (
        <TextArea
          label={label}
          name={name}
          value={value !== undefined ? value.toString() : ""}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
        />
      );
    case "select":
      return (
        <Select
          label={label}
          name={name}
          value={value !== undefined ? value.toString() : ""}
          onChange={onChange}
          options={options}
          optionId={optionId}
          optionName={optionName}
        />
      );
    default:
      return null;
  }
};
