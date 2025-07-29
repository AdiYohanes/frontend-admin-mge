import { useSelector, useDispatch } from "react-redux";
import { selectTheme, toggleTheme, setTheme } from "../store/slices/themeSlice";

const useTheme = () => {
    const dispatch = useDispatch();
    const theme = useSelector(selectTheme);

    const handleToggleTheme = () => {
        dispatch(toggleTheme());
    };

    const handleSetTheme = (newTheme) => {
        dispatch(setTheme(newTheme));
    };

    return {
        theme,
        isDark: theme === "dark",
        isLight: theme === "light",
        toggleTheme: handleToggleTheme,
        setTheme: handleSetTheme,
    };
};

export default useTheme; 