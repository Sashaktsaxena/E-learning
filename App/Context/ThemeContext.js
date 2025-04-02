import React, { createContext, useState, useEffect } from "react";
import { useColorScheme } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const systemTheme = useColorScheme();
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    // Load saved theme from AsyncStorage when app starts
    AsyncStorage.getItem("theme").then((savedTheme) => {
      if (savedTheme) {
        setTheme(savedTheme);
      } else {
        setTheme(systemTheme || "light");
      }
    });
  }, [systemTheme]);

  const toggleTheme = async () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    await AsyncStorage.setItem("theme", newTheme); // Save the selected theme
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};