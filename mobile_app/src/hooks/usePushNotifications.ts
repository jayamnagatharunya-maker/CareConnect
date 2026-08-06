import { useEffect } from "react";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { api } from "../services/api";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function registerForPushNotificationsAsync() {
  let token: string | null = null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== "granted") {
      const { status } =
        await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== "granted") {
      console.log("Push notification permission not granted");
      return null;
    }
    const projectId = (
      await Notifications.getExpoPushTokenAsync({
        projectId: "your-project-id",
      })
    ).data;
    token = projectId;
  } else {
    console.log("Push notifications require a physical device");
  }

  return token;
}

export async function registerDeviceToken() {
  try {
    const token = await registerForPushNotificationsAsync();
    if (!token) return false;

    const storedToken = await AsyncStorage.getItem("accessToken");
    if (!storedToken) return false;

    await api.post(
      "/auth/device-token/",
      { token, platform: Platform.OS },
      {
        headers: {
          Authorization: `Bearer ${storedToken}`,
        },
      }
    );

    console.log("Device token registered:", token);
    return true;
  } catch (error) {
    console.log("Failed to register device token:", error);
    return false;
  }
}

export function usePushNotifications() {
  useEffect(() => {
    registerDeviceToken();

    const subscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
      }
    );

    const responseSubscription =
      Notifications.addNotificationResponseReceivedListener(
        (response) => {
          console.log("Notification response:", response);
        }
      );

    return () => {
      subscription.remove();
      responseSubscription.remove();
    };
  }, []);

  return { registerDeviceToken };
}
