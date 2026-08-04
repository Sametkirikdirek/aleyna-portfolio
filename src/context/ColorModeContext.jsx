import { createContext, useContext, useState } from "react";

const ColorModeContext = createContext({
  isColorActive: false,
  toggleColorMode: () => {},
});

export function ColorModeProvider({ children }) {
  const [isColorActive, setIsColorActive] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("isColorActive") === "true";
    }
    return false;
  });

  const toggleColorMode = () => {
    setIsColorActive((prev) => {
      const next = !prev;
      localStorage.setItem("isColorActive", String(next));
      return next;
    });
  };

  return (
    <ColorModeContext.Provider value={{ isColorActive, toggleColorMode }}>
      {children}
    </ColorModeContext.Provider>
  );
}

export function useColorMode() {
  return useContext(ColorModeContext);
}
