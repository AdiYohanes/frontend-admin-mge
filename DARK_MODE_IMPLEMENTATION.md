# Dark Mode Implementation

This document describes the dark mode implementation for the MGE Admin Dashboard.

## Features

- **Theme Toggle**: Users can switch between light and dark themes
- **Persistent Storage**: Theme preference is saved in localStorage
- **Quick Access**: Theme toggle button in the header
- **Settings Page**: Dedicated settings page for theme management
- **Automatic Application**: Theme is applied immediately when changed

## Implementation Details

### 1. Redux State Management

**File**: `src/store/slices/themeSlice.js`

- Manages theme state (light/dark)
- Handles localStorage persistence
- Provides actions for theme switching

### 2. Theme Provider

**File**: `src/components/common/ThemeProvider.jsx`

- Wraps the entire application
- Initializes theme on app load
- Applies theme to document element

### 3. Custom Hook

**File**: `src/hooks/useTheme.js`

- Provides easy access to theme state
- Returns theme, toggle function, and theme status
- Simplifies theme management across components

### 4. Theme Toggle Component

**File**: `src/components/common/ThemeToggle.jsx`

- Radio button interface for theme selection
- Visual indicators (sun/moon icons)
- Descriptive labels for each theme

### 5. Header Integration

**File**: `src/layouts/Header.jsx`

- Quick theme toggle button
- Shows current theme icon
- Accessible with proper ARIA labels

### 6. Settings Page

**File**: `src/features/settings/pages/AppSettingsPage.jsx`

- Dedicated page for app settings
- Includes theme toggle component
- Extensible for future settings

## Usage

### Basic Theme Toggle

```jsx
import useTheme from "../hooks/useTheme";

const MyComponent = () => {
  const { theme, toggleTheme, isDark, isLight } = useTheme();

  return <button onClick={toggleTheme}>Current theme: {theme}</button>;
};
```

### Setting Specific Theme

```jsx
import useTheme from "../hooks/useTheme";

const MyComponent = () => {
  const { setTheme } = useTheme();

  const handleLightMode = () => setTheme("light");
  const handleDarkMode = () => setTheme("dark");

  return (
    <div>
      <button onClick={handleLightMode}>Light Mode</button>
      <button onClick={handleDarkMode}>Dark Mode</button>
    </div>
  );
};
```

## CSS Classes

The implementation uses DaisyUI's built-in theme system:

- `data-theme="light"` - Light theme
- `data-theme="dark"` - Dark theme

## Navigation

Users can access theme settings through:

1. **Quick Toggle**: Header button (sun/moon icon)
2. **Settings Page**: Settings → App Settings → Theme Settings

## Browser Support

- Theme preference is saved in localStorage
- Works across browser sessions
- Graceful fallback to light theme if no preference is saved

## Future Enhancements

- System theme detection
- Custom theme colors
- Animation transitions
- More granular theme controls
