import { createSlice } from "@reduxjs/toolkit";

// Get initial theme from localStorage or default to 'light'
const getInitialTheme = () => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme || "light";
};

const initialState = {
    theme: getInitialTheme(),
};

const themeSlice = createSlice({
    name: "theme",
    initialState,
    reducers: {
        toggleTheme: (state) => {
            state.theme = state.theme === "light" ? "dark" : "light";
            // Save to localStorage
            localStorage.setItem("theme", state.theme);
            // Apply theme to document
            document.documentElement.setAttribute("data-theme", state.theme);
        },
        setTheme: (state, action) => {
            state.theme = action.payload;
            // Save to localStorage
            localStorage.setItem("theme", state.theme);
            // Apply theme to document
            document.documentElement.setAttribute("data-theme", state.theme);
        },
    },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export const selectTheme = (state) => state.theme.theme;
export default themeSlice.reducer; 