import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { useFonts } from "expo-font";
import { ClerkProvider, SignedIn, SignedOut } from "@clerk/clerk-expo";
import LoginScreen from "./App/Screen/LoginScreen";
import { NavigationContainer } from "@react-navigation/native";
import TabNavigation from "./App/Navigations/TabNavigation";
import * as SecureStore from "expo-secure-store";
import { CompleteChapterContext } from "./App/Context/CompleteChapterContext";
import { useState } from "react";
import { UserPointsContext } from "./App/Context/UserPointsContext";
import { ThemeProvider } from "./App/Context/ThemeContext";

const tokenCache = {
  async getToken(key) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key, value) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

export default function App() {
  const [isChapterComplete, setIsChapterComplete] = useState(false);
  const [userPoints, setUserPoints] = useState(0); // ✅ Initialize with 0 instead of null
  const [fontsLoaded] = useFonts({
    outfit: require("./assets/fonts/Outfit-Regular.ttf"),
    "outfit-bold": require("./assets/fonts/Outfit-Bold.ttf"),
    "outfit-medium": require("./assets/fonts/Outfit-SemiBold.ttf"),
  });

  return (
    <ClerkProvider 
      tokenCache={tokenCache} 
      publishableKey={"pk_test_YWNlLWxhYi02NC5jbGVyay5hY2NvdW50cy5kZXYk"}
    >
      <ThemeProvider>
        <UserPointsContext.Provider value={{ userPoints, setUserPoints }}>
          <CompleteChapterContext.Provider value={{ isChapterComplete, setIsChapterComplete }}>
            <View style={{flex: 1}}>
              <NavigationContainer>
                <SignedIn>
                  <TabNavigation />
                </SignedIn>
                <SignedOut>
                  <LoginScreen />
                </SignedOut>
              </NavigationContainer>
            </View>
          </CompleteChapterContext.Provider>
        </UserPointsContext.Provider>
      </ThemeProvider>
    </ClerkProvider>
  );
}