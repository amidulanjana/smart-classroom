import * as Notifications from "expo-notifications";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

export function useNotifications(autoRegister: boolean) {
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const register = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      if (Platform.OS === "android") {
        await Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF231F7C",
        });
      }
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        setError("Notification permission not granted");
        setIsLoading(false);
        return "";
      }

      const { data } = await Notifications.getExpoPushTokenAsync();
      setToken(data);
      setIsLoading(false);
      return data;
    } catch (err) {
      setError("Failed to register");
      setIsLoading(false);
      return "";
    }
  }, []);

  useEffect(() => {
    if (autoRegister) {
      register();
    }
  }, [autoRegister, register]);

  return {
    token,
    isLoading,
    error,
    register,
  };
}
