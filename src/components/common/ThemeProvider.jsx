import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectTheme, setTheme } from "../../store/slices/themeSlice";

const ThemeProvider = ({ children }) => {
    const dispatch = useDispatch();
    const theme = useSelector(selectTheme);

    useEffect(() => {
        // Apply theme to document on mount
        const savedTheme = localStorage.getItem("theme") || "light";
        dispatch(setTheme(savedTheme));
        document.documentElement.setAttribute("data-theme", savedTheme);
    }, [dispatch]);

    useEffect(() => {
        // Apply theme whenever it changes
        document.documentElement.setAttribute("data-theme", theme);
    }, [theme]);

    return <>{children}</>;
};

export default ThemeProvider; 