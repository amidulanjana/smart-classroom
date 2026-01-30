import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import ParentPortal from "../parent";
import TeacherPortal from "../teacher";

type UserRole = "teacher" | "parent";

export default function HomeScreen() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserRole();
  }, []);

  const loadUserRole = async () => {
    try {
      const role = await AsyncStorage.getItem("userRole");
      setUserRole((role as UserRole) || "teacher");
    } catch (error) {
      console.error("Error loading user role:", error);
      setUserRole("teacher");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Conditionally render based on user role
  return userRole === "teacher" ? <TeacherPortal /> : <ParentPortal />;
}
