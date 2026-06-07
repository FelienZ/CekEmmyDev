"use client";

import { MoonStar, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { DropdownMenuItem } from "./ui/dropdown-menu";

export function ThemeToggler() {
  const { theme, setTheme } = useTheme();
  function handleToggle(e: React.MouseEvent<HTMLDivElement>) {
    e.preventDefault();
    setTheme(theme === "light" ? "dark" : "light");
  }
  return (
    <DropdownMenuItem onClick={(e) => handleToggle(e)}>
      {theme === "light" ? (
        <>
          <Sun />
          Light Mode
        </>
      ) : (
        <>
          <MoonStar />
          Dark Mode
        </>
      )}
    </DropdownMenuItem>
  );
}
