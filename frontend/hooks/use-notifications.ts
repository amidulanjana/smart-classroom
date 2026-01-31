import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Set notification handler for how notifications should be displayed when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationOptions {
  title: string;
  body: string;
  data?: Record<string, any>;
  trigger?: Notifications.NotificationTriggerInput | null;
  categoryIdentifier?: string;
}

export interface NotificationResponseHandler {
  (actionIdentifier: string, notification: Notifications.Notification): void;
}

export const useNotifications = (onResponse?: NotificationResponseHandler) => {
  const notificationListener = useRef<Notifications.Subscription | undefined>(
    undefined,
  );
  const responseListener = useRef<Notifications.Subscription | undefined>(
    undefined,
  );

  useEffect(() => {
    // Request permissions and set up notification categories
    setupNotifications();

    // Listen for notifications received while app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("Notification received:", notification);
      });

    // Listen for user interactions with notifications
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("Notification response:", response);
        const actionIdentifier = response.actionIdentifier;
        const notification = response.notification;

        if (onResponse) {
          onResponse(actionIdentifier, notification);
        }
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  const scheduleNotification = async (options: NotificationOptions) => {
    try {
      const id = await Notifications.scheduleNotificationAsync({
        content: {
          title: options.title,
          body: options.body,
          data: options.data || {},
          categoryIdentifier: options.categoryIdentifier,
        },
        trigger: options.trigger || null, // null means show immediately
      });
      return id;
    } catch (error) {
      console.error("Error scheduling notification:", error);
      throw error;
    }
  };

  const cancelNotification = async (notificationId: string) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
    } catch (error) {
      console.error("Error canceling notification:", error);
    }
  };

  const cancelAllNotifications = async () => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error("Error canceling all notifications:", error);
    }
  };

  return {
    scheduleNotification,
    cancelNotification,
    cancelAllNotifications,
  };
};

async function setupNotifications() {
  // Set up notification categories with actions
  await Notifications.setNotificationCategoryAsync("pickup_request", [
    {
      identifier: "yes",
      buttonTitle: "Yes",
      options: {
        opensAppToForeground: true,
      },
    },
    {
      identifier: "no",
      buttonTitle: "No",
      options: {
        opensAppToForeground: false,
      },
    },
  ]);

  await registerForPushNotificationsAsync();
}

async function registerForPushNotificationsAsync() {
  let token;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Failed to get push token for push notification!");
    return;
  }

  return token;
}
