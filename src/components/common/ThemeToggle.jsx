import React from "react";
import { SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import useTheme from "../../hooks/useTheme";

const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

    return (
        <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
                <h3 className="card-title text-lg mb-4">Theme Settings</h3>
                <p className="text-sm text-base-content/70 mb-4">
                    Choose your preferred theme for the application interface.
                </p>

                <div className="flex gap-4">
                    <label className="flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-primary">
                        <input
                            type="radio"
                            name="theme"
                            value="light"
                            checked={theme === "light"}
                            onChange={() => handleThemeChange("light")}
                            className="sr-only"
                        />
                        <SunIcon className="w-8 h-8 mb-2 text-yellow-500" />
                        <span className="font-medium">Light</span>
                        <span className="text-xs text-base-content/60 mt-1">
                            Clean and bright interface
                        </span>
                    </label>

                    <label className="flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all hover:border-primary">
                        <input
                            type="radio"
                            name="theme"
                            value="dark"
                            checked={theme === "dark"}
                            onChange={() => handleThemeChange("dark")}
                            className="sr-only"
                        />
                        <MoonIcon className="w-8 h-8 mb-2 text-blue-400" />
                        <span className="font-medium">Dark</span>
                        <span className="text-xs text-base-content/60 mt-1">
                            Easy on the eyes
                        </span>
                    </label>
                </div>

                <div className="mt-4 p-3 bg-base-200 rounded-lg">
                    <p className="text-sm text-base-content/70">
                        <strong>Current theme:</strong> {theme === "light" ? "Light Mode" : "Dark Mode"}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ThemeToggle; 