import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, View, Alert, useColorScheme } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ParentPortal from "../parent";
import TeacherPortal from "../teacher";
import { useNotifications } from "../../../hooks/use-notifications";
import { useRouter } from "expo-router";
import { Colors } from "../../../constants/theme";

type UserRole = "teacher" | "parent";

export default function HomeScreen() {
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  // Handle notification responses
  const handleNotificationResponse = (
    actionIdentifier: string,
    notification: any,
  ) => {
    console.log("User tapped:", actionIdentifier);

    if (actionIdentifier === "yes") {
      // Navigate to map screen
      router.push("/pickup-map");
    } else if (actionIdentifier === "no") {
      Alert.alert(
        "Notification Dismissed",
        "You can view the pickup status anytime from the home screen.",
        [{ text: "OK" }],
      );
    }
  };

  const { scheduleNotification } = useNotifications(handleNotificationResponse);

  useEffect(() => {
    loadUserRole();
  }, []);

  useEffect(() => {
    // Trigger notification when home page is loaded
    if (!loading && userRole === "parent") {
      triggerPickupNotification();
    }
  }, [loading, userRole]);

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

  const triggerPickupNotification = async () => {
    try {
      await scheduleNotification({
        title: "Pickup In Progress",
        body: "Sarah from your backup circle has picked up Dimeth. View live tracking on the map.",
        data: {
          type: "pickup_status",
          parentName: "Arun Dias",
          childName: "Dimeth",
          pickupPerson: "Sarah",
        },
        categoryIdentifier: "pickup_request",
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error("Error triggering notification:", error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.background }}
        edges={["top"]}
      >
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaView>
    );
  }

  // Conditionally render based on user role
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={["top"]}
    >
      {userRole === "teacher" ? <TeacherPortal /> : <ParentPortal />}
    </SafeAreaView>
  );
}
