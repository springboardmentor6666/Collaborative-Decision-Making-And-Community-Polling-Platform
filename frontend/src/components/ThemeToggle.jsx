import { useTheme } from "../context/ThemeContext";
import sunIcon from "../assets/sun-icon.png";
import moonIcon from "../assets/moon-icon.png";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="
        theme-toggle
        flex h-10 w-10
        items-center justify-center
        rounded-xl
        transition-all
        duration-200
        hover:scale-110
        active:scale-95
      "
      title={
        theme === "dark"
          ? "Switch to light mode"
          : "Switch to dark mode"
      }
    >
      <img
        src={theme === "dark" ? sunIcon : moonIcon}
        alt={
          theme === "dark"
            ? "Switch to light mode"
            : "Switch to dark mode"
        }
        className="h-8 w-8 object-contain"
      />
    </button>
  );
}

export default ThemeToggle;