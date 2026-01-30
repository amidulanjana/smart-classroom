import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Stack } from "expo-router";
import React from "react";

export default function HomeStackLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="backup-circle"
        options={{
          title: "Backup Circle Setup",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="smart-checklist"
        options={{
          title: "Smart Item Request",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="events-list"
        options={{
          title: "Events",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="meeting-invitation"
        options={{
          title: "Meeting Details",
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="meeting-details"
        options={{
          title: "Meeting Summary",
          headerShown: false,
        }}
      />
    </Stack>
  );
}
