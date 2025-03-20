import { useState } from "react";
import "./button.css";

export const Button = ({
  children,
  onClick,
  disabled = false,
}: {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const onButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!onClick) return;
    setIsPressed(true);
    onClick(e);
    setTimeout(() => {
      setIsPressed(false);
    }, 150);
  };

  return (
    <button
      onClick={onClick ? onButtonClick : undefined}
      disabled={disabled}
      className={`ui-basic-button ${isPressed ? "pressed" : ""}`}>
      {children}
    </button>
  );
};
