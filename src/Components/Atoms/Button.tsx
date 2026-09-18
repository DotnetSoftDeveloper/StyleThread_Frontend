// // Button.tsx
// import React from 'react';
// import './Button.css';  // Make sure to create this CSS file

// interface ButtonProps{
//   type? : "button" | "submit" | "reset",
//   className? : string;
//   label: React.ReactNode; // Accepts string or JSX
//   onClick? : (event: React.MouseEvent<HTMLButtonElement>) => void;
// }

// export const Button:React.FC<ButtonProps> = ({ type = 'submit', className = 'submitButton', label, onClick }) => (
//   <button className={`${className}`} type={type} onClick={onClick}>
//     {label}
//   </button>
// );


import React from 'react';
import styles from './Button.module.css';

interface ButtonProps {
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  label: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';  // optional prop for button style variants
}

export const Button: React.FC<ButtonProps> = ({
  type = 'submit',
  className,
  label,
  onClick,
  disabled = false,
  variant,
}) => {
  // Compose class names: btn + variant + custom className
  const buttonClassNames = [
    styles.btn,
    variant ? styles[variant] : '',
    className || '',
  ].join(' ').trim();

  return (
    <button
      type={type}
      className={buttonClassNames}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
};
