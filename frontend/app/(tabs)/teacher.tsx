import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export default function TeacherPortal() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Profile Card */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              <View
                style={[styles.avatar, { backgroundColor: colors.primary }]}
              >
                <Ionicons name="person" size={28} color={colors.white} />
              </View>
              <View
                style={[
                  styles.onlineIndicator,
                  { borderColor: colors.background },
                ]}
              />
            </View>
            <View>
              <Text style={[styles.greeting, { color: colors.textSecondary }]}>
                Welcome back,
              </Text>
              <Text style={[styles.userName, { color: colors.text }]}>
                Mr. Anderson
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.notificationButton,
              { backgroundColor: colors.surface },
            ]}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>

        {/* Stats Overview */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={styles.statHeader}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: colors.blueLight },
                ]}
              >
                <Ionicons
                  name="school-outline"
                  size={20}
                  color={colors.primary}
                />
              </View>
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>3</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Classes Today
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
            <View style={styles.statHeader}>
              <View
                style={[
                  styles.statIconContainer,
                  { backgroundColor: colors.orangeLight },
                ]}
              >
                <Ionicons
                  name="mail-unread-outline"
                  size={20}
                  color={colors.orange}
                />
              </View>
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>2</Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Unread Msgs
            </Text>
          </View>
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.quickActionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Quick Actions
            </Text>
          </View>
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity
              style={[
                styles.primaryActionButton,
                { backgroundColor: colors.primary },
              ]}
              activeOpacity={0.8}
            >
              <Ionicons name="create-outline" size={28} color={colors.white} />
              <Text style={[styles.actionButtonText, { color: colors.white }]}>
                Message
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.surface }]}
              activeOpacity={0.8}
            >
              <Ionicons name="calendar-outline" size={28} color={colors.text} />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>
                Meeting
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.surface }]}
              activeOpacity={0.8}
            >
              <Ionicons
                name="stats-chart-outline"
                size={28}
                color={colors.text}
              />
              <Text style={[styles.actionButtonText, { color: colors.text }]}>
                Analytics
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Active Classes Carousel */}
        <View style={styles.classesSection}>
          <View style={styles.classesSectionHeader}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Active Classes
              </Text>
              <TouchableOpacity>
                <Text style={[styles.seeAllLink, { color: colors.primary }]}>
                  See All
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.classesScroll}
          >
            {/* Class Card 1 */}
            <View
              style={[styles.classCard, { backgroundColor: colors.surface }]}
            >
              <View
                style={[
                  styles.classCardGradient,
                  { backgroundColor: `${colors.blue}10` },
                ]}
              />
              <View style={styles.classCardContent}>
                <View style={styles.classCardHeader}>
                  <View
                    style={[
                      styles.classBadge,
                      { backgroundColor: colors.blueLight },
                    ]}
                  >
                    <Text
                      style={[styles.classBadgeText, { color: colors.primary }]}
                    >
                      09:00 AM
                    </Text>
                  </View>
                  <Ionicons
                    name="ellipsis-horizontal"
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>
                <Text style={[styles.classTitle, { color: colors.text }]}>
                  Biology 101
                </Text>
                <Text
                  style={[
                    styles.classSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  Room 3B • Lab Session
                </Text>
              </View>
              <View style={styles.classCardFooter}>
                <View style={styles.studentsAvatars}>
                  <View
                    style={[
                      styles.studentAvatar,
                      {
                        backgroundColor: colors.primary,
                        borderColor: colors.surface,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.avatarInitial, { color: colors.white }]}
                    >
                      A
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.studentAvatar,
                      {
                        backgroundColor: colors.orange,
                        borderColor: colors.surface,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.avatarInitial, { color: colors.white }]}
                    >
                      B
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.studentAvatar,
                      {
                        backgroundColor: colors.green,
                        borderColor: colors.surface,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.avatarInitial, { color: colors.white }]}
                    >
                      C
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.studentsCount,
                    { color: colors.textSecondary },
                  ]}
                >
                  +21 Students
                </Text>
              </View>
            </View>

            {/* Class Card 2 */}
            <View
              style={[styles.classCard, { backgroundColor: colors.surface }]}
            >
              <View
                style={[
                  styles.classCardGradient,
                  { backgroundColor: `${colors.green}10` },
                ]}
              />
              <View style={styles.classCardContent}>
                <View style={styles.classCardHeader}>
                  <View
                    style={[
                      styles.classBadge,
                      { backgroundColor: colors.greenLight },
                    ]}
                  >
                    <Text
                      style={[styles.classBadgeText, { color: colors.green }]}
                    >
                      10:00 AM
                    </Text>
                  </View>
                  <Ionicons
                    name="ellipsis-horizontal"
                    size={20}
                    color={colors.textSecondary}
                  />
                </View>
                <Text style={[styles.classTitle, { color: colors.text }]}>
                  Homeroom
                </Text>
                <Text
                  style={[
                    styles.classSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  Main Hall • Attendance
                </Text>
              </View>
              <View style={styles.classCardFooter}>
                <View style={styles.studentsAvatars}>
                  <View
                    style={[
                      styles.studentAvatar,
                      {
                        backgroundColor: colors.primary,
                        borderColor: colors.surface,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.avatarInitial, { color: colors.white }]}
                    >
                      D
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.studentAvatar,
                      {
                        backgroundColor: colors.orange,
                        borderColor: colors.surface,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.avatarInitial, { color: colors.white }]}
                    >
                      E
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.studentAvatar,
                      {
                        backgroundColor: colors.textSecondary,
                        borderColor: colors.surface,
                      },
                    ]}
                  >
                    <Text
                      style={[styles.avatarInitial, { color: colors.white }]}
                    >
                      JL
                    </Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.studentsCount,
                    { color: colors.textSecondary },
                  ]}
                >
                  +27 Students
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>

        {/* Up Next Timeline */}
        <View style={styles.upNextSection}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Up Next
            </Text>
          </View>
          <View style={styles.timeline}>
            {/* Timeline Item 1 */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <Text style={[styles.timelineTime, { color: colors.text }]}>
                  11:30
                </Text>
                <View
                  style={[
                    styles.timelineLine,
                    { backgroundColor: colors.border },
                  ]}
                />
              </View>
              <View
                style={[
                  styles.timelineCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.timelineCardHeader}>
                  <Text style={[styles.timelineTitle, { color: colors.text }]}>
                    Staff Meeting
                  </Text>
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={colors.textSecondary}
                  />
                </View>
                <Text
                  style={[
                    styles.timelineSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  Conference Room A
                </Text>
              </View>
            </View>

            {/* Timeline Item 2 */}
            <View style={styles.timelineItem}>
              <View style={styles.timelineLeft}>
                <Text
                  style={[styles.timelineTime, { color: colors.textSecondary }]}
                >
                  13:00
                </Text>
              </View>
              <View
                style={[
                  styles.timelineCard,
                  styles.timelineCardInactive,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.timelineCardHeader}>
                  <Text style={[styles.timelineTitle, { color: colors.text }]}>
                    Mathematics 202
                  </Text>
                  <Ionicons
                    name="school-outline"
                    size={16}
                    color={colors.textSecondary}
                  />
                </View>
                <Text
                  style={[
                    styles.timelineSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  Room 4C • Exam Prep
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Bottom spacer for tab bar */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 48,
    paddingBottom: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatarContainer: {
    position: "relative",
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: Colors.light.green,
    borderWidth: 2,
  },
  greeting: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 16,
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statHeader: {
    marginBottom: 8,
  },
  statIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  quickActionsSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  seeAllLink: {
    fontSize: 14,
    fontWeight: "600",
  },
  quickActionsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  primaryActionButton: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: Colors.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  actionButton: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
  classesSection: {
    marginBottom: 32,
  },
  classesSectionHeader: {
    paddingHorizontal: 24,
  },
  classesScroll: {
    paddingHorizontal: 24,
    gap: 16,
  },
  classCard: {
    width: 260,
    height: 160,
    borderRadius: 16,
    padding: 20,
    position: "relative",
    overflow: "hidden",
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  classCardGradient: {
    position: "absolute",
    top: -16,
    right: -16,
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  classCardContent: {
    flex: 1,
  },
  classCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  classBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  classBadgeText: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  classTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
  },
  classSubtitle: {
    fontSize: 14,
  },
  classCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 8,
  },
  studentsAvatars: {
    flexDirection: "row",
    marginRight: 4,
  },
  studentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    marginLeft: -8,
  },
  avatarInitial: {
    fontSize: 12,
    fontWeight: "600",
  },
  studentsCount: {
    fontSize: 12,
    fontWeight: "500",
  },
  upNextSection: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  timeline: {
    gap: 16,
  },
  timelineItem: {
    flexDirection: "row",
    gap: 16,
  },
  timelineLeft: {
    alignItems: "center",
    width: 48,
  },
  timelineTime: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 32,
    borderRadius: 1,
  },
  timelineCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  timelineCardInactive: {
    opacity: 0.6,
  },
  timelineCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  timelineSubtitle: {
    fontSize: 14,
  },
  bottomSpacer: {
    height: 20,
  },
});
