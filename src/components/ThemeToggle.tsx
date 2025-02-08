
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

const ThemeToggle = () => {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    if (storedTheme) {
      setTheme(storedTheme as "light" | "dark");
      document.documentElement.classList.toggle("dark", storedTheme === "dark");
    } else {
      const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setTheme(systemPrefersDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", systemPrefersDark);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", newTheme);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-10 w-10 rounded-full bg-background/50 backdrop-blur-sm border border-theme/20 hover:bg-background/80"
    >
      <Sun className={`h-5 w-5 text-theme transition-all ${theme === 'light' ? 'rotate-0 scale-100' : '-rotate-90 scale-0'} absolute`} />
      <Moon className={`h-5 w-5 text-theme transition-all ${theme === 'dark' ? 'rotate-0 scale-100' : 'rotate-90 scale-0'} absolute`} />
    </Button>
  );
};

export default ThemeToggle;
