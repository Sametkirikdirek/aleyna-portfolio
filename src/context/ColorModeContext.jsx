import { createContext, useContext, useState, useEffect } from "react";

const ColorModeContext = createContext({
  isColorActive: false,
  toggleColorMode: () => {},
  theme: "dark",
  toggleTheme: () => {},
});

export function ColorModeProvider({ children }) {
  const [isColorActive, setIsColorActive] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("isColorActive") === "true";
    }
    return false;
  });

  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark") return saved;
    }
    return "dark"; // Default is Dark Mode
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    // 1. Briefly suppress all transitions to prevent repaint cascade
    body.classList.add("no-transition");

    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);

    // 2. Re-enable transitions after one paint cycle
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        body.classList.remove("no-transition");
      });
    });
  }, [theme]);

  const toggleColorMode = () => {
    setIsColorActive((prev) => {
      const next = !prev;
      localStorage.setItem("isColorActive", String(next));
      return next;
    });
  };

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <ColorModeContext.Provider
      value={{ isColorActive, toggleColorMode, theme, toggleTheme }}
    >
      {children}
    </ColorModeContext.Provider>
  );
}

export function useColorMode() {
  return useContext(ColorModeContext);
}
