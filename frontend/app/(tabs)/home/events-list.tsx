import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
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

interface Event {
  id: string;
  teacherName: string;
  teacherRole: string;
  teacherAvatar: string;
  topic: string;
  date: string;
  time: string;
  status: "pending" | "accepted" | "declined";
  urgent: boolean;
}

export default function EventsListScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[colorScheme ?? "light"];

  const [filter, setFilter] = useState<"all" | "pending" | "accepted">("all");

  const events: Event[] = [
    {
      id: "1",
      teacherName: "Mrs. Sarah Jenkins",
      teacherRole: "Mathematics Teacher",
      teacherAvatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCpxuTkdcRcFe54aH3qO4WalUWklUvNg6fP2XHdiMhrXiBxEH6vsm4SwJdT5CoWZr8HtSwB6ePxR4-zGLaXZMk7nEMQtNbxQ-UcAjOngbkEVezUxKUxo9CXFDwadsA3qaQlpW5iE_tyaBQ-Ne9GrKRfBg5joHPvO_3zhdVY4PAq3BQ_BFmrhdKtPouG21NgJPeq0AVUfgOPXLHoYjT5aiGVdMa2uE_NdaslVYiYcp3SEwjCmyL9XR5nAmDXOV8Tf2RAcPOdnIyQI3d_",
      topic: "Semester 1 Progress Review",
      date: "Oct 24, 2024",
      time: "3:30 PM - 4:00 PM",
      status: "pending",
      urgent: true,
    },
    {
      id: "2",
      teacherName: "Mr. David Thompson",
      teacherRole: "Science Teacher",
      teacherAvatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
      topic: "Science Project Discussion",
      date: "Oct 26, 2024",
      time: "2:00 PM - 2:30 PM",
      status: "pending",
      urgent: false,
    },
    {
      id: "3",
      teacherName: "Ms. Emily Rodriguez",
      teacherRole: "English Teacher",
      teacherAvatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop",
      topic: "Reading Improvement Plan",
      date: "Oct 28, 2024",
      time: "4:00 PM - 4:30 PM",
      status: "accepted",
      urgent: false,
    },
    {
      id: "4",
      teacherName: "Mr. James Wilson",
      teacherRole: "History Teacher",
      teacherAvatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
      topic: "History Fair Preparation",
      date: "Oct 30, 2024",
      time: "1:00 PM - 1:45 PM",
      status: "pending",
      urgent: false,
    },
  ];

  const filteredEvents = events.filter((event) => {
    if (filter === "all") return true;
    return event.status === filter;
  });

  const getStatusColor = (status: Event["status"]) => {
    switch (status) {
      case "pending":
        return "#f59e0b";
      case "accepted":
        return "#10b981";
      case "declined":
        return "#ef4444";
    }
  };

  const getStatusLabel = (status: Event["status"]) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "accepted":
        return "Accepted";
      case "declined":
        return "Declined";
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View
          style={[
            styles.statCard,
            {
              backgroundColor: isDark
                ? "rgba(249, 115, 22, 0.1)"
                : "rgba(249, 115, 22, 0.05)",
              borderColor: isDark
                ? "rgba(249, 115, 22, 0.2)"
                : "rgba(249, 115, 22, 0.1)",
            },
          ]}
        >
          <Text style={styles.statNumber}>
            {events.filter((e) => e.status === "pending").length}
          </Text>
          <Text style={[styles.statLabel, { color: "#f59e0b" }]}>Pending</Text>
        </View>

        <View
          style={[
            styles.statCard,
            {
              backgroundColor: isDark
                ? "rgba(16, 185, 129, 0.1)"
                : "rgba(16, 185, 129, 0.05)",
              borderColor: isDark
                ? "rgba(16, 185, 129, 0.2)"
                : "rgba(16, 185, 129, 0.1)",
            },
          ]}
        >
          <Text style={styles.statNumber}>
            {events.filter((e) => e.status === "accepted").length}
          </Text>
          <Text style={[styles.statLabel, { color: "#10b981" }]}>Accepted</Text>
        </View>

        <View
          style={[
            styles.statCard,
            {
              backgroundColor: isDark
                ? "rgba(99, 102, 241, 0.1)"
                : "rgba(99, 102, 241, 0.05)",
              borderColor: isDark
                ? "rgba(99, 102, 241, 0.2)"
                : "rgba(99, 102, 241, 0.1)",
            },
          ]}
        >
          <Text style={styles.statNumber}>{events.length}</Text>
          <Text style={[styles.statLabel, { color: "#6366f1" }]}>Total</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === "all" && styles.filterTabActive,
            filter === "all" && { backgroundColor: "#2563eb" },
          ]}
          onPress={() => setFilter("all")}
        >
          <Text
            style={[
              styles.filterText,
              { color: filter === "all" ? "#ffffff" : colors.textSecondary },
            ]}
          >
            All ({events.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === "pending" && styles.filterTabActive,
            filter === "pending" && { backgroundColor: "#2563eb" },
          ]}
          onPress={() => setFilter("pending")}
        >
          <Text
            style={[
              styles.filterText,
              {
                color: filter === "pending" ? "#ffffff" : colors.textSecondary,
              },
            ]}
          >
            Pending ({events.filter((e) => e.status === "pending").length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            filter === "accepted" && styles.filterTabActive,
            filter === "accepted" && { backgroundColor: "#2563eb" },
          ]}
          onPress={() => setFilter("accepted")}
        >
          <Text
            style={[
              styles.filterText,
              {
                color: filter === "accepted" ? "#ffffff" : colors.textSecondary,
              },
            ]}
          >
            Accepted ({events.filter((e) => e.status === "accepted").length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Events List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredEvents.map((event) => (
          <TouchableOpacity
            key={event.id}
            style={[
              styles.eventCard,
              {
                backgroundColor: colors.surface,
                borderColor: isDark ? colors.border : "#e2e8f0",
              },
            ]}
            onPress={() => router.push("/(tabs)/home/meeting-details")}
            activeOpacity={0.7}
          >
            {/* Urgent Badge */}
            {event.urgent && (
              <View style={styles.urgentBadge}>
                <Ionicons name="flame" size={12} color="#ffffff" />
                <Text style={styles.urgentText}>URGENT</Text>
              </View>
            )}

            {/* Status Badge */}
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(event.status) },
              ]}
            >
              <Text style={styles.statusText}>
                {getStatusLabel(event.status)}
              </Text>
            </View>

            {/* Teacher Info */}
            <View style={styles.teacherSection}>
              <View style={styles.avatarWrapper}>
                <Image
                  source={{ uri: event.teacherAvatar }}
                  style={styles.avatar}
                />
                <View style={styles.onlineBadge} />
              </View>
              <View style={styles.teacherInfo}>
                <View style={styles.teacherNameRow}>
                  <Text style={[styles.teacherName, { color: colors.text }]}>
                    {event.teacherName}
                  </Text>
                  <Ionicons name="checkmark-circle" size={16} color="#3b82f6" />
                </View>
                <Text
                  style={[styles.teacherRole, { color: colors.textSecondary }]}
                >
                  {event.teacherRole}
                </Text>
              </View>
            </View>

            {/* Topic */}
            <View style={styles.topicSection}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color={colors.textSecondary}
              />
              <Text
                style={[styles.topicText, { color: colors.text }]}
                numberOfLines={2}
              >
                {event.topic}
              </Text>
            </View>

            {/* Date & Time */}
            <View style={styles.dateTimeSection}>
              <View style={styles.dateTimeRow}>
                <Ionicons
                  name="calendar-outline"
                  size={18}
                  color={colors.textSecondary}
                />
                <Text
                  style={[styles.dateTimeText, { color: colors.textSecondary }]}
                >
                  {event.date}
                </Text>
              </View>
              <View style={styles.dateTimeRow}>
                <Ionicons
                  name="time-outline"
                  size={18}
                  color={colors.textSecondary}
                />
                <Text
                  style={[styles.dateTimeText, { color: colors.textSecondary }]}
                >
                  {event.time}
                </Text>
              </View>
            </View>

            {/* Action Footer */}
            <View
              style={[
                styles.cardFooter,
                { borderTopColor: isDark ? colors.border : "#e2e8f0" },
              ]}
            >
              <Text style={[styles.viewDetails, { color: "#2563eb" }]}>
                View Details
              </Text>
              <Ionicons name="chevron-forward" size={20} color="#2563eb" />
            </View>
          </TouchableOpacity>
        ))}

        {filteredEvents.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons
              name="calendar-outline"
              size={64}
              color={colors.textSecondary}
            />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No Events Found
            </Text>
            <Text
              style={[styles.emptySubtitle, { color: colors.textSecondary }]}
            >
              No {filter} events at the moment
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "transparent",
  },
  filterTabActive: {
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
  },
  eventCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    position: "relative",
  },
  urgentBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "#ef4444",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 10,
  },
  urgentText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ffffff",
  },
  statusBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    zIndex: 10,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#ffffff",
  },
  teacherSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 32,
    marginBottom: 16,
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e2e8f0",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#22c55e",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  teacherInfo: {
    flex: 1,
    gap: 2,
  },
  teacherNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: "600",
  },
  teacherRole: {
    fontSize: 13,
    fontWeight: "500",
  },
  topicSection: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    paddingVertical: 12,
  },
  topicText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
  },
  dateTimeSection: {
    flexDirection: "row",
    gap: 16,
    paddingVertical: 8,
  },
  dateTimeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateTimeText: {
    fontSize: 13,
    fontWeight: "500",
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  viewDetails: {
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
  },
});
