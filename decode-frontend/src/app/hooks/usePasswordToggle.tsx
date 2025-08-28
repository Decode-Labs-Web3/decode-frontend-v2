"use client";
import { useState } from "react";

export function usePasswordToggle() {
  const [visible, setVisible] = useState(false);

  const toggleVisibility = () => setVisible((prevVisible) => !prevVisible);
  const inputType = visible ? "text" : "password";

  return { inputType, visible, toggleVisibility };
}
