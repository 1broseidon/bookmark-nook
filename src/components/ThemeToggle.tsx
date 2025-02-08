
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
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    localStorage.setItem("theme", newTheme);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="relative h-10 w-10 rounded-full bg-background/50 backdrop-blur-sm border border-theme/20 hover:bg-background/80"
    >
      <Sun className="absolute h-5 w-5 text-theme transition-all duration-300" 
          style={{ 
            opacity: theme === 'light' ? 1 : 0,
            transform: `scale(${theme === 'light' ? 1 : 0}) rotate(${theme === 'light' ? '0deg' : '-90deg'})`
          }} 
      />
      <Moon className="absolute h-5 w-5 text-theme transition-all duration-300" 
          style={{ 
            opacity: theme === 'dark' ? 1 : 0,
            transform: `scale(${theme === 'dark' ? 1 : 0}) rotate(${theme === 'dark' ? '0deg' : '90deg'})`
          }} 
      />
    </Button>
  );
};

export default ThemeToggle;
