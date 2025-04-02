import React, { useContext, useState } from "react";
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Alert 
} from "react-native";
import { useUser, useAuth } from "@clerk/clerk-expo";
import { useNavigation } from "@react-navigation/native";
import { ThemeContext } from "../Context/ThemeContext";
import * as Progress from "react-native-progress";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const { isSignedIn, user } = useUser();
  const { signOut } = useAuth();
  const navigation = useNavigation();
  const { theme, toggleTheme } = useContext(ThemeContext);

  // Dummy user stats
  const totalCourses = 12;
  const completedCourses = 8;
  const inProgressCourses = totalCourses - completedCourses;
  
  // Calculate Profile Completion
  const profileFields = [user?.fullName, user?.primaryEmailAddress?.emailAddress, user?.imageUrl];
  const completedFields = profileFields.filter(Boolean).length;
  const profileCompletion = completedFields / profileFields.length;

  // ✅ Logout Confirmation Alert
  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", onPress: async () => {
            await signOut();
            navigation.replace("LoginScreen");
          } 
        }
      ]
    );
  };

  if (!isSignedIn) {
    return (
      <View style={[styles.container, theme === "dark" ? styles.darkBackground : styles.lightBackground]}>
        <Text style={[styles.message, theme === "dark" ? styles.whiteText : styles.blackText]}>
          Please log in to view your profile.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView 
      contentContainerStyle={[styles.container, theme === "dark" ? styles.darkBackground : styles.lightBackground]}
    >
      {/* Profile Header */}
      <View style={[styles.profileCard, theme === "dark" ? styles.darkCard : styles.lightCard]}>
        <Image
          source={{ uri: user?.imageUrl || "https://via.placeholder.com/100" }}
          style={styles.profileImage}
        />
        <Text style={[styles.name, theme === "dark" ? styles.whiteText : styles.blackText]}>
          {user?.fullName}
        </Text>
        <Text style={[styles.email, theme === "dark" ? styles.whiteText : styles.blackText]}>
          {user?.primaryEmailAddress?.emailAddress}
        </Text>

        {/* Profile Completion Progress */}
        <View style={styles.progressContainer}>
          <Text style={[styles.progressText, theme === "dark" ? styles.whiteText : styles.blackText]}>
            Profile Completion: {Math.round(profileCompletion * 100)}%
          </Text>
          <Progress.Bar progress={profileCompletion} width={200} color="#4CAF50" />
        </View>
      </View>

      {/* User Statistics */}
      {/* <View style={[styles.statsContainer, theme === "dark" ? styles.darkCard : styles.lightCard]}>
        <Text style={[styles.sectionTitle, theme === "dark" ? styles.whiteText : styles.blackText]}>
          Your Statistics
        </Text>
        <View style={styles.statRow}>
          <View style={styles.statBox}>
            <Ionicons name="book-outline" size={30} color={theme === "dark" ? "#fff" : "#000"} />
            <Text style={[styles.statNumber, theme === "dark" ? styles.whiteText : styles.blackText]}>
              {totalCourses}
            </Text>
            <Text style={[styles.statLabel, theme === "dark" ? styles.whiteText : styles.blackText]}>Courses Enrolled</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="checkmark-done-outline" size={30} color="#4CAF50" />
            <Text style={[styles.statNumber, theme === "dark" ? styles.whiteText : styles.blackText]}>
              {completedCourses}
            </Text>
            <Text style={[styles.statLabel, theme === "dark" ? styles.whiteText : styles.blackText]}>Completed</Text>
          </View>
          <View style={styles.statBox}>
            <Ionicons name="hourglass-outline" size={30} color="#FFA500" />
            <Text style={[styles.statNumber, theme === "dark" ? styles.whiteText : styles.blackText]}>
              {inProgressCourses}
            </Text>
            <Text style={[styles.statLabel, theme === "dark" ? styles.whiteText : styles.blackText]}>In Progress</Text>
          </View>
        </View>
      </View> */}

      {/* Settings & Preferences */}
      <View style={[styles.settingsContainer, theme === "dark" ? styles.darkCard : styles.lightCard]}>
        <Text style={[styles.sectionTitle, theme === "dark" ? styles.whiteText : styles.blackText]}>
          Settings & Preferences
        </Text>

        {/* Dark Mode Toggle */}
        <TouchableOpacity style={styles.themeButton} onPress={toggleTheme}>
          <Text style={styles.themeButtonText}>
            {theme === "light" ? "🌙 Enable Dark Mode" : "☀ Switch to Light Mode"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>  
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ✅ Styles
const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingTop: 40,
    alignItems: "center",
  },
  darkBackground: {
    backgroundColor: "#121212",
  },
  lightBackground: {
    backgroundColor: "#f5f5f5",
  },
  profileCard: {
    width: "100%",
    alignItems: "center",
    padding: 20,
    borderRadius: 12,
    elevation: 5,
    marginBottom: 20,
  },
  darkCard: {
    backgroundColor: "#1e1e1e",
  },
  lightCard: {
    backgroundColor: "#ffffff",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  name: { 
    fontSize: 22, 
    fontWeight: "bold" 
  },
  email: { 
    fontSize: 16, 
    marginBottom: 10 
  },
  whiteText: { 
    color: "#fff" 
  },
  blackText: { 
    color: "#000" 
  },
  progressContainer: { 
    alignItems: "center", 
    marginTop: 10 
  },
  progressText: { 
    fontSize: 14, 
    marginBottom: 5 
  },
  statsContainer: { 
    width: "100%", 
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 20 
  },
  sectionTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    marginBottom: 10 
  },
  statRow: { 
    flexDirection: "row", 
    justifyContent: "space-between" 
  },
  statBox: { 
    alignItems: "center", 
    flex: 1 
  },
  statNumber: { 
    fontSize: 22, 
    fontWeight: "bold" 
  },
  statLabel: { 
    fontSize: 14, 
    color: "#fff" 
  },
  settingsContainer: { 
    width: "100%", 
    padding: 15, 
    borderRadius: 8, 
    marginBottom: 20 
  },
  themeButton: { 
    backgroundColor: "#FFA500", 
    padding: 12, 
    borderRadius: 8, 
    width: "80%", 
    alignItems: "center" 
  },
  themeButtonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "bold" 
  },
  logoutButton: { 
    backgroundColor: "#d9534f", 
    padding: 12, 
    borderRadius: 8, 
    width: "80%", 
    alignItems: "center" 
  },
  buttonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "bold" 
  },
});