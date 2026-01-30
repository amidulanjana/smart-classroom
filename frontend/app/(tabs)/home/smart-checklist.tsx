import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

type ItemComplexity = "Easy" | "Medium" | "Complex";

interface ChecklistItem {
  id: number;
  title: string;
  description: string;
  complexity: ItemComplexity;
  timeNeeded: string;
  completed: boolean;
}

export default function SmartChecklistScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();

  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: 1,
      title: "Volcano Clay Kit",
      description: "Needs drying time. Buy ASAP.",
      complexity: "Complex",
      timeNeeded: "5-7 days needed",
      completed: false,
    },
    {
      id: 2,
      title: "Vinegar & Baking Soda",
      description: "1 Gallon Vinegar, 1 Box Soda",
      complexity: "Medium",
      timeNeeded: "2 days prep",
      completed: false,
    },
    {
      id: 3,
      title: "Cardboard Tri-fold Board",
      description: 'Standard size 36x48"',
      complexity: "Easy",
      timeNeeded: "1 day",
      completed: true,
    },
  ]);

  const progress = Math.round(
    (items.filter((item) => item.completed).length / items.length) * 100,
  );
  const itemsLeft = items.filter((item) => !item.completed).length;

  const toggleItem = (id: number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      ),
    );
  };

  const markAllPurchased = () => {
    setItems(items.map((item) => ({ ...item, completed: true })));
  };

  const getComplexityColor = (complexity: ItemComplexity) => {
    switch (complexity) {
      case "Complex":
        return {
          bg: colorScheme === "dark" ? "rgba(234, 88, 12, 0.2)" : "#FFF7ED",
          text: colorScheme === "dark" ? "#FB923C" : "#EA580C",
        };
      case "Medium":
        return {
          bg: colorScheme === "dark" ? "rgba(37, 99, 235, 0.2)" : "#EFF6FF",
          text: colorScheme === "dark" ? "#60A5FA" : "#2563EB",
        };
      case "Easy":
        return {
          bg: colorScheme === "dark" ? "rgba(34, 197, 94, 0.2)" : "#F0FDF4",
          text: colorScheme === "dark" ? "#4ADE80" : "#16A34A",
        };
    }
  };

  const getTimeColor = (complexity: ItemComplexity) => {
    switch (complexity) {
      case "Complex":
        return colorScheme === "dark" ? "#FB923C" : "#EA580C";
      case "Medium":
        return colorScheme === "dark" ? "#60A5FA" : "#2563EB";
      case "Easy":
        return colorScheme === "dark" ? "#4ADE80" : "#16A34A";
    }
  };

  const daysOfWeek = ["Mon", "Tue", "Today", "Thu", "Fri", "Sat", "Due"];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* AI Analysis Card */}
        <View
          style={[
            styles.analysisCard,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={styles.analysisHeader}>
            <View
              style={[
                styles.aiIcon,
                {
                  backgroundColor:
                    colorScheme === "dark"
                      ? "rgba(37, 99, 235, 0.3)"
                      : "#DBEAFE",
                },
              ]}
            >
              <Ionicons name="sparkles" size={20} color={colors.primary} />
            </View>
            <View style={styles.analysisText}>
              <Text style={[styles.analysisTitle, { color: colors.text }]}>
                Project Analysis
              </Text>
              <Text
                style={[
                  styles.analysisSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Hi Sarah, the Science Fair is in 7 days. You are {progress}%
                ready.
              </Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressSection}>
            <View style={styles.progressHeader}>
              <Text
                style={[styles.progressLabel, { color: colors.textSecondary }]}
              >
                Progress
              </Text>
              <Text style={[styles.progressValue, { color: colors.primary }]}>
                {progress}%
              </Text>
            </View>
            <View
              style={[
                styles.progressBarBg,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#374151" : "#F0F2F5",
                },
              ]}
            >
              <View
                style={[
                  styles.progressBarFill,
                  { backgroundColor: colors.primary, width: `${progress}%` },
                ]}
              />
            </View>
          </View>

          {/* Timeline */}
          <View
            style={[
              styles.timeline,
              {
                borderTopColor: colorScheme === "dark" ? "#374151" : "#E5E7EB",
              },
            ]}
          >
            {daysOfWeek.map((day, index) => {
              const isToday = day === "Today";
              const isDue = day === "Due";
              return (
                <View key={day} style={styles.timelineDay}>
                  <Text
                    style={[
                      styles.timelineDayLabel,
                      {
                        color: isToday
                          ? colors.primary
                          : isDue
                            ? colors.red
                            : colors.textSecondary,
                        fontWeight: isToday || isDue ? "700" : "500",
                        opacity: isToday || isDue || index > 1 ? 1 : 0.5,
                      },
                    ]}
                  >
                    {day}
                  </Text>
                  {isDue ? (
                    <Ionicons name="flag" size={14} color={colors.red} />
                  ) : isToday ? (
                    <View
                      style={[
                        styles.timelineDotActive,
                        {
                          backgroundColor: colors.primary,
                          borderColor:
                            colorScheme === "dark" ? "#1E3A8A" : "#DBEAFE",
                        },
                      ]}
                    />
                  ) : (
                    <View
                      style={[
                        styles.timelineDot,
                        {
                          backgroundColor:
                            index > 1
                              ? colorScheme === "dark"
                                ? "#1E3A8A"
                                : "#BFDBFE"
                              : "#D1D5DB",
                          opacity: index <= 1 ? 0.5 : 1,
                        },
                      ]}
                    />
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[
              styles.quickActionButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons name="storefront" size={20} color={colors.primary} />
            <Text style={[styles.quickActionText, { color: colors.text }]}>
              Find Stores
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.quickActionButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Ionicons name="sparkles" size={20} color={colors.primary} />
            <Text style={[styles.quickActionText, { color: colors.text }]}>
              Ask Teacher AI
            </Text>
          </TouchableOpacity>
        </View>

        {/* Checklist Section */}
        <View style={styles.checklistSection}>
          <View style={styles.checklistHeader}>
            <Text style={[styles.checklistTitle, { color: colors.text }]}>
              Required Materials
            </Text>
            <View
              style={[
                styles.itemsLeftBadge,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#374151" : "#F3F4F6",
                },
              ]}
            >
              <Text
                style={[styles.itemsLeftText, { color: colors.textSecondary }]}
              >
                {itemsLeft} items left
              </Text>
            </View>
          </View>

          <View style={styles.checklistItems}>
            {items.map((item) => {
              const complexityColors = getComplexityColor(item.complexity);
              const timeColor = getTimeColor(item.complexity);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.checklistItem,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => toggleItem(item.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.checkboxContainer}>
                    <View
                      style={[
                        styles.checkbox,
                        {
                          borderColor: item.completed
                            ? colors.primary
                            : colorScheme === "dark"
                              ? "#4B5563"
                              : "#D1D5DB",
                          backgroundColor: item.completed
                            ? colors.primary
                            : "transparent",
                        },
                      ]}
                    >
                      {item.completed && (
                        <Ionicons name="checkmark" size={16} color="white" />
                      )}
                    </View>
                  </View>
                  <View style={styles.itemContent}>
                    <View style={styles.itemHeader}>
                      <Text
                        style={[
                          styles.itemTitle,
                          {
                            color: item.completed
                              ? colors.textSecondary
                              : colors.text,
                            textDecorationLine: item.completed
                              ? "line-through"
                              : "none",
                          },
                        ]}
                      >
                        {item.title}
                      </Text>
                      <View
                        style={[
                          styles.complexityBadge,
                          { backgroundColor: complexityColors.bg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.complexityText,
                            {
                              color: complexityColors.text,
                              opacity: item.completed ? 0.6 : 1,
                            },
                          ]}
                        >
                          {item.complexity.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text
                      style={[
                        styles.itemDescription,
                        {
                          color: item.completed
                            ? "#9CA3AF"
                            : colors.textSecondary,
                          textDecorationLine: item.completed
                            ? "line-through"
                            : "none",
                        },
                      ]}
                    >
                      {item.description}
                    </Text>
                    {!item.completed && (
                      <View style={styles.timeInfo}>
                        <Ionicons
                          name="time-outline"
                          size={14}
                          color={timeColor}
                        />
                        <Text style={[styles.timeText, { color: timeColor }]}>
                          {item.timeNeeded}
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Add Custom Item */}
            <TouchableOpacity
              style={[styles.addItemButton, { borderColor: colors.border }]}
            >
              <Ionicons
                name="add-circle-outline"
                size={24}
                color={colors.textSecondary}
              />
              <Text
                style={[styles.addItemText, { color: colors.textSecondary }]}
              >
                Add custom item
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Footer with Progress */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor:
              colorScheme === "dark"
                ? "rgba(17, 22, 33, 0.9)"
                : "rgba(255, 255, 255, 0.9)",
            borderTopColor: colors.border,
          },
        ]}
      >
        <View style={styles.footerContent}>
          <View style={styles.progressCircle}>
            <View
              style={[
                styles.progressCircleBg,
                {
                  borderColor: colorScheme === "dark" ? "#374151" : "#E5E7EB",
                },
              ]}
            />
            <View
              style={[
                styles.progressCircleFill,
                {
                  borderColor: colors.primary,
                  transform: [{ rotate: `${progress * 3.6}deg` }],
                },
              ]}
            />
            <View style={styles.progressCircleCenter}>
              <Text style={[styles.progressPercentage, { color: colors.text }]}>
                {progress}%
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.markAllButton, { backgroundColor: colors.primary }]}
            onPress={markAllPurchased}
          >
            <Ionicons name="checkmark-circle" size={20} color="white" />
            <Text style={styles.markAllButtonText}>Mark All as Purchased</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  analysisCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 8,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  analysisHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 16,
  },
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  analysisText: {
    flex: 1,
  },
  analysisTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  analysisSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  progressValue: {
    fontSize: 12,
    fontWeight: "700",
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  timeline: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
  },
  timelineDay: {
    alignItems: "center",
    gap: 4,
  },
  timelineDayLabel: {
    fontSize: 10,
    textTransform: "uppercase",
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  timelineDotActive: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 3,
  },
  quickActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  quickActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  checklistSection: {
    marginTop: 20,
  },
  checklistHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  checklistTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  itemsLeftBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  itemsLeftText: {
    fontSize: 12,
    fontWeight: "500",
  },
  checklistItems: {
    gap: 12,
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  checkboxContainer: {
    paddingTop: 4,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  itemContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 4,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  complexityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  complexityText: {
    fontSize: 10,
    fontWeight: "700",
  },
  itemDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  timeInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    fontWeight: "500",
  },
  addItemButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: "dashed",
  },
  addItemText: {
    fontSize: 14,
    fontWeight: "500",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  footerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  progressCircle: {
    width: 48,
    height: 48,
    position: "relative",
  },
  progressCircleBg: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
  },
  progressCircleFill: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderTopColor: "transparent",
    borderRightColor: "transparent",
  },
  progressCircleCenter: {
    position: "absolute",
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  progressPercentage: {
    fontSize: 10,
    fontWeight: "700",
  },
  markAllButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    borderRadius: 12,
    shadowColor: "#2463EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  markAllButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "700",
  },
});
