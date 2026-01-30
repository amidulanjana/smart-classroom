import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  useColorScheme,
} from "react-native";
import { Colors } from "@/constants/theme";

export default function MeetingInvitationScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Main Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Teacher Profile Card */}
        <View style={styles.section}>
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.surface,
                borderColor: isDark ? colors.border : "#e2e8f0",
              },
            ]}
          >
            {/* Header with Avatar and Basic Info */}
            <View
              style={[
                styles.cardHeader,
                { borderBottomColor: isDark ? colors.border : "#e2e8f0" },
              ]}
            >
              <View style={styles.avatarContainer}>
                <View
                  style={[
                    styles.avatar,
                    { backgroundColor: isDark ? "#475569" : "#e2e8f0" },
                  ]}
                >
                  <Image
                    source={{
                      uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCpxuTkdcRcFe54aH3qO4WalUWklUvNg6fP2XHdiMhrXiBxEH6vsm4SwJdT5CoWZr8HtSwB6ePxR4-zGLaXZMk7nEMQtNbxQ-UcAjOngbkEVezUxKUxo9CXFDwadsA3qaQlpW5iE_tyaBQ-Ne9GrKRfBg5joHPvO_3zhdVY4PAq3BQ_BFmrhdKtPouG21NgJPeq0AVUfgOPXLHoYjT5aiGVdMa2uE_NdaslVYiYcp3SEwjCmyL9XR5nAmDXOV8Tf2RAcPOdnIyQI3d_",
                    }}
                    style={styles.avatarImage}
                  />
                </View>
                <View style={styles.statusBadge} />
              </View>
              <View style={styles.teacherInfo}>
                <View style={styles.nameRow}>
                  <Text style={[styles.teacherName, { color: colors.text }]}>
                    Mrs. Sarah Jenkins
                  </Text>
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color="#3b82f6"
                    style={styles.verifiedBadge}
                  />
                </View>
                <Text
                  style={[styles.teacherRole, { color: colors.textSecondary }]}
                >
                  Mathematics Teacher
                </Text>
              </View>
            </View>

            {/* Agenda Content */}
            <View style={styles.cardContent}>
              <View style={styles.topicSection}>
                <Text
                  style={[
                    styles.sectionLabel,
                    { color: isDark ? "#64748b" : "#94a3b8" },
                  ]}
                >
                  TOPIC
                </Text>
                <Text style={[styles.topicText, { color: colors.text }]}>
                  Semester 1 Progress Review
                </Text>
              </View>

              <View
                style={[
                  styles.aiSummaryBox,
                  {
                    backgroundColor: isDark
                      ? "rgba(37, 99, 235, 0.1)"
                      : "rgba(37, 99, 235, 0.05)",
                    borderColor: isDark
                      ? "rgba(37, 99, 235, 0.2)"
                      : "rgba(37, 99, 235, 0.1)",
                  },
                ]}
              >
                <View style={styles.aiHeader}>
                  <Ionicons name="sparkles" size={16} color="#2563eb" />
                  <Text style={styles.aiLabel}>AI SUMMARY</Text>
                </View>
                <Text
                  style={[
                    styles.aiText,
                    { color: isDark ? "#cbd5e1" : "#475569" },
                  ]}
                >
                  Discuss students improvement in algebra, review recent test
                  scores, and plan for upcoming project deadlines.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Proposed Time Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Proposed Time
          </Text>
          <View
            style={[
              styles.timeCard,
              {
                backgroundColor: colors.surface,
                borderColor: isDark ? colors.border : "#e2e8f0",
              },
            ]}
          >
            {/* Date Row */}
            <View
              style={[
                styles.timeRow,
                { borderBottomColor: isDark ? colors.border : "#e2e8f0" },
              ]}
            >
              <View
                style={[
                  styles.dateBox,
                  {
                    backgroundColor: isDark
                      ? "rgba(59, 130, 246, 0.2)"
                      : "#dbeafe",
                  },
                ]}
              >
                <Text style={styles.dateMonth}>OCT</Text>
                <Text style={styles.dateDay}>24</Text>
              </View>
              <View style={styles.dateInfo}>
                <Text style={[styles.dateText, { color: colors.text }]}>
                  Friday, October 24th
                </Text>
                <Text
                  style={[styles.dateYear, { color: colors.textSecondary }]}
                >
                  2024
                </Text>
              </View>
              <Ionicons
                name="calendar-outline"
                size={24}
                color={colors.textSecondary}
              />
            </View>

            {/* Time Row */}
            <View style={styles.timeRow}>
              <View
                style={[
                  styles.timeBox,
                  {
                    backgroundColor: isDark ? colors.border : "#f8fafc",
                  },
                ]}
              >
                <Ionicons
                  name="time-outline"
                  size={24}
                  color={colors.textSecondary}
                />
              </View>
              <View style={styles.timeInfo}>
                <Text style={[styles.timeText, { color: colors.text }]}>
                  3:30 PM - 4:00 PM
                </Text>
                <Text
                  style={[styles.timeDuration, { color: colors.textSecondary }]}
                >
                  30 Minutes duration
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Timeline Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Timeline
          </Text>
          <View style={styles.timeline}>
            {/* Timeline Item 1: Past */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineIconContainer}>
                <View
                  style={[
                    styles.timelineIcon,
                    styles.timelineIconCompleted,
                    { borderColor: colors.background },
                  ]}
                >
                  <Ionicons name="checkmark" size={16} color="#16a34a" />
                </View>
                <View
                  style={[
                    styles.timelineLine,
                    { backgroundColor: isDark ? colors.border : "#e2e8f0" },
                  ]}
                />
              </View>
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineTitle, { color: colors.text }]}>
                  Invitation Received
                </Text>
                <Text
                  style={[styles.timelineTime, { color: colors.textSecondary }]}
                >
                  Just now
                </Text>
              </View>
            </View>

            {/* Timeline Item 2: Future */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineIconContainer}>
                <View
                  style={[
                    styles.timelineIcon,
                    styles.timelineIconPending,
                    {
                      backgroundColor: isDark ? colors.border : "#f1f5f9",
                      borderColor: colors.background,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.timelineDot,
                      { backgroundColor: isDark ? "#64748b" : "#cbd5e1" },
                    ]}
                  />
                </View>
                <View
                  style={[
                    styles.timelineLine,
                    { backgroundColor: isDark ? colors.border : "#e2e8f0" },
                  ]}
                />
              </View>
              <View style={styles.timelineContent}>
                <View style={styles.timelineTitleRow}>
                  <Text
                    style={[
                      styles.timelineTitle,
                      styles.timelineTitlePending,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Reminder
                  </Text>
                  <View
                    style={[
                      styles.autoBadge,
                      { backgroundColor: isDark ? colors.border : "#f1f5f9" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.autoBadgeText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      AUTO
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.timelineTime,
                    { color: isDark ? "#64748b" : "#94a3b8" },
                  ]}
                >
                  24 hours before meeting
                </Text>
              </View>
            </View>

            {/* Timeline Item 3: Future */}
            <View style={[styles.timelineItem, styles.timelineItemLast]}>
              <View style={styles.timelineIconContainer}>
                <View
                  style={[
                    styles.timelineIcon,
                    styles.timelineIconPending,
                    {
                      backgroundColor: isDark ? colors.border : "#f1f5f9",
                      borderColor: colors.background,
                    },
                  ]}
                >
                  <View
                    style={[
                      styles.timelineDot,
                      { backgroundColor: isDark ? "#64748b" : "#cbd5e1" },
                    ]}
                  />
                </View>
              </View>
              <View style={styles.timelineContent}>
                <View style={styles.timelineTitleRow}>
                  <Text
                    style={[
                      styles.timelineTitle,
                      styles.timelineTitlePending,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Urgent Reminder
                  </Text>
                  <View
                    style={[
                      styles.autoBadge,
                      { backgroundColor: isDark ? colors.border : "#f1f5f9" },
                    ]}
                  >
                    <Text
                      style={[
                        styles.autoBadgeText,
                        { color: colors.textSecondary },
                      ]}
                    >
                      AUTO
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.timelineTime,
                    { color: isDark ? "#64748b" : "#94a3b8" },
                  ]}
                >
                  1 hour before meeting
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Action Bar */}
      <View
        style={[
          styles.actionBar,
          {
            backgroundColor: colors.surface,
            borderTopColor: isDark ? colors.border : "#e2e8f0",
          },
        ]}
      >
        <View style={styles.actionBarContent}>
          {/* Decline Button */}
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="close" size={24} color="#94a3b8" />
            <Text style={styles.actionButtonText}>Decline</Text>
          </TouchableOpacity>

          {/* Reschedule Button */}
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="calendar-outline" size={24} color="#94a3b8" />
            <Text style={styles.actionButtonText}>Reschedule</Text>
          </TouchableOpacity>

          {/* Accept Button */}
          <TouchableOpacity style={styles.acceptButton}>
            <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
            <Text style={styles.acceptButtonText}>Accept Invite</Text>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 120,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 16,
    borderBottomWidth: 1,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#ffffff",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  statusBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#22c55e",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  teacherInfo: {
    flex: 1,
    justifyContent: "center",
    gap: 4,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: "700",
  },
  verifiedBadge: {
    marginTop: 2,
  },
  teacherRole: {
    fontSize: 14,
    fontWeight: "500",
  },
  cardContent: {
    padding: 20,
    gap: 16,
  },
  topicSection: {
    gap: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  topicText: {
    fontSize: 16,
    fontWeight: "600",
  },
  aiSummaryBox: {
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  aiLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563eb",
    letterSpacing: 1,
  },
  aiText: {
    fontSize: 14,
    lineHeight: 20,
  },
  timeCard: {
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
  },
  dateBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  dateMonth: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563eb",
  },
  dateDay: {
    fontSize: 20,
    fontWeight: "700",
    color: "#2563eb",
    marginTop: 2,
  },
  dateInfo: {
    flex: 1,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "600",
  },
  dateYear: {
    fontSize: 14,
    marginTop: 2,
  },
  timeBox: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  timeInfo: {
    flex: 1,
  },
  timeText: {
    fontSize: 16,
    fontWeight: "600",
  },
  timeDuration: {
    fontSize: 14,
    marginTop: 2,
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: "row",
    gap: 16,
    paddingBottom: 32,
  },
  timelineItemLast: {
    paddingBottom: 0,
  },
  timelineIconContainer: {
    position: "relative",
    alignItems: "center",
  },
  timelineIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 4,
    zIndex: 10,
  },
  timelineIconCompleted: {
    backgroundColor: "#dcfce7",
  },
  timelineIconPending: {
    backgroundColor: "#f1f5f9",
  },
  timelineLine: {
    position: "absolute",
    top: 40,
    width: 2,
    height: "100%",
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  timelineContent: {
    flex: 1,
    paddingTop: 8,
  },
  timelineTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  timelineTitlePending: {
    fontWeight: "500",
  },
  timelineTime: {
    fontSize: 12,
    marginTop: 2,
  },
  autoBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  autoBadgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    padding: 16,
    paddingBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
    elevation: 5,
  },
  actionBarContent: {
    flexDirection: "row",
    gap: 12,
    maxWidth: 500,
    marginHorizontal: "auto",
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#64748b",
  },
  acceptButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#2563eb",
    borderRadius: 8,
    paddingVertical: 12,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
