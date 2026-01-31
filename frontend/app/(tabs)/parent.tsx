import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

export default function ParentPortal() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.welcomeText, { color: colors.textSecondary }]}>
              Welcome back
            </Text>
            <Text style={[styles.greeting, { color: colors.text }]}>
              Good Morning, Sarah
            </Text>
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
            <View
              style={[styles.notificationDot, { borderColor: colors.surface }]}
            />
          </TouchableOpacity>
        </View>

        {/* Emergency Alert Banner */}
        <View
          style={[
            styles.emergencyBanner,
            {
              backgroundColor:
                colorScheme === "dark"
                  ? "rgba(220, 38, 38, 0.2)"
                  : "rgba(254, 242, 242, 1)",
              borderColor:
                colorScheme === "dark"
                  ? "rgba(220, 38, 38, 0.5)"
                  : "rgba(254, 226, 226, 1)",
            },
          ]}
        >
          <View style={styles.emergencyContent}>
            <View
              style={[
                styles.emergencyIcon,
                {
                  backgroundColor:
                    colorScheme === "dark"
                      ? "rgba(153, 27, 27, 1)"
                      : "rgba(254, 226, 226, 1)",
                },
              ]}
            >
              <Ionicons name="alert-circle" size={24} color={colors.red} />
            </View>
            <View style={styles.emergencyText}>
              <Text
                style={[
                  styles.emergencyTitle,
                  {
                    color:
                      colorScheme === "dark"
                        ? "rgba(254, 202, 202, 1)"
                        : "rgba(127, 29, 29, 1)",
                  },
                ]}
              >
                Emergency Mode
              </Text>
              <Text
                style={[
                  styles.emergencySubtitle,
                  {
                    color:
                      colorScheme === "dark"
                        ? "rgba(252, 165, 165, 1)"
                        : "rgba(185, 28, 28, 1)",
                  },
                ]}
              >
                Quick access to SOS & contacts
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.sosButton, { backgroundColor: colors.red }]}
          >
            <Text style={[styles.sosButtonText, { color: colors.white }]}>
              SOS
            </Text>
          </TouchableOpacity>
        </View>

        {/* My Kids Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text
              style={[
                styles.sectionTitle,
                { marginLeft: -20 },
                { color: colors.text },
              ]}
            >
              My Kids
            </Text>
            <TouchableOpacity>
              <Text style={[styles.seeAllText, { color: colors.green }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.kidsScrollContent}
            snapToInterval={296}
            decelerationRate="fast"
          >
            {/* Child Card 1 - Dimeth */}
            <View
              style={[
                styles.childCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.childImageContainer}>
                <View
                  style={[
                    styles.childImage,
                    { backgroundColor: colors.blueLight },
                  ]}
                >
                  <Ionicons name="person" size={48} color={colors.primary} />
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: `${colors.white}E6` },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: colors.green },
                    ]}
                  />
                  <Text style={[styles.statusText, { color: colors.text }]}>
                    Safe
                  </Text>
                </View>
              </View>
              <View style={styles.childInfo}>
                <View style={styles.childHeader}>
                  <View>
                    <Text style={[styles.childName, { color: colors.text }]}>
                      Liyana
                    </Text>
                    <View style={styles.locationRow}>
                      <Ionicons name="school" size={16} color={colors.green} />
                      <Text
                        style={[styles.locationText, { color: colors.green }]}
                      >
                        At School
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.checkInButton,
                    { backgroundColor: colors.green },
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={colors.white}
                  />
                  <Text
                    style={[styles.checkInButtonText, { color: colors.white }]}
                  >
                    Check-in
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Child Card 2 - Omaya */}
            <View
              style={[
                styles.childCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.childImageContainer}>
                <View
                  style={[
                    styles.childImage,
                    { backgroundColor: colors.orangeLight },
                  ]}
                >
                  <Ionicons name="person" size={48} color={colors.orange} />
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: `${colors.white}E6` },
                  ]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: colors.green },
                    ]}
                  />
                  <Text style={[styles.statusText, { color: colors.text }]}>
                    Safe
                  </Text>
                </View>
              </View>
              <View style={styles.childInfo}>
                <View style={styles.childHeader}>
                  <View>
                    <Text style={[styles.childName, { color: colors.text }]}>
                      Sayul
                    </Text>
                    <View style={styles.locationRow}>
                      <Ionicons
                        name="home"
                        size={16}
                        color={colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.locationText,
                          { color: colors.textSecondary },
                        ]}
                      >
                        Home
                      </Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity
                  style={[
                    styles.historyButton,
                    { backgroundColor: `${colors.text}10` },
                  ]}
                >
                  <Ionicons name="time-outline" size={18} color={colors.text} />
                  <Text
                    style={[styles.historyButtonText, { color: colors.text }]}
                  >
                    View History
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Add Child Placeholder */}
            <TouchableOpacity
              style={[styles.addChildCard, { borderColor: colors.border }]}
            >
              <View
                style={[
                  styles.addChildIcon,
                  { backgroundColor: `${colors.text}10` },
                ]}
              >
                <Ionicons name="add" size={24} color={colors.textSecondary} />
              </View>
              <Text
                style={[styles.addChildText, { color: colors.textSecondary }]}
              >
                Add Profile
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* Quick Access Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Quick Access
          </Text>
          <View style={styles.quickAccessGrid}>
            {/* Checklists */}
            <TouchableOpacity
              style={[
                styles.quickAccessCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => router.push("/(tabs)/home/smart-checklist")}
            >
              <View
                style={[
                  styles.quickAccessIcon,
                  { backgroundColor: colors.blueLight },
                ]}
              >
                <Ionicons
                  name="checkmark-done"
                  size={24}
                  color={colors.primary}
                />
              </View>
              <View style={styles.quickAccessInfo}>
                <Text style={[styles.quickAccessTitle, { color: colors.text }]}>
                  Checklists
                </Text>
                <Text
                  style={[
                    styles.quickAccessSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  School & Camping
                </Text>
              </View>
            </TouchableOpacity>

            {/* Backup Circle */}
            <TouchableOpacity
              style={[
                styles.quickAccessCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => router.push("/(tabs)/home/backup-circle")}
            >
              <View
                style={[
                  styles.quickAccessIcon,
                  { backgroundColor: `${colors.orange}20` },
                ]}
              >
                <Ionicons name="people" size={24} color={colors.orange} />
              </View>
              <View style={styles.quickAccessInfo}>
                <Text style={[styles.quickAccessTitle, { color: colors.text }]}>
                  Backup Circle
                </Text>
                <Text
                  style={[
                    styles.quickAccessSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  Manage Guardians
                </Text>
              </View>
            </TouchableOpacity>

            {/* Events */}
            <TouchableOpacity
              style={[
                styles.quickAccessCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => router.push("/(tabs)/home/events-list")}
            >
              <View
                style={[
                  styles.quickAccessIcon,
                  { backgroundColor: colors.orangeLight },
                ]}
              >
                <Ionicons name="calendar" size={24} color={colors.orange} />
              </View>
              <View style={styles.quickAccessInfo}>
                <Text style={[styles.quickAccessTitle, { color: colors.text }]}>
                  Events
                </Text>
                <Text
                  style={[
                    styles.quickAccessSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  3 Upcoming
                </Text>
              </View>
            </TouchableOpacity>

            {/* Messages */}
            <TouchableOpacity
              style={[
                styles.quickAccessCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View
                style={[
                  styles.quickAccessIcon,
                  { backgroundColor: `${colors.green}20` },
                ]}
              >
                <Ionicons name="chatbubbles" size={24} color={colors.green} />
              </View>
              <View style={styles.quickAccessInfo}>
                <Text style={[styles.quickAccessTitle, { color: colors.text }]}>
                  Messages
                </Text>
                <Text
                  style={[
                    styles.quickAccessSubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  2 New
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={[styles.section, { marginBottom: 120 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Recent Activity
          </Text>
          <View
            style={[
              styles.activityCard,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View
              style={[
                styles.activityIcon,
                { backgroundColor: colors.greenLight },
              ]}
            >
              <Ionicons name="location" size={24} color={colors.green} />
            </View>
            <View style={styles.activityInfo}>
              <Text style={[styles.activityTitle, { color: colors.text }]}>
                Dimeth arrived at Soccer Practice
              </Text>
              <Text
                style={[styles.activityTime, { color: colors.textSecondary }]}
              >
                10 minutes ago
              </Text>
            </View>
            <View
              style={[
                styles.activityMap,
                { backgroundColor: colors.blueLight },
              ]}
            >
              <Ionicons name="map" size={20} color={colors.primary} />
            </View>
          </View>
        </View>
      </ScrollView>

      {/* AI Assistant Floating Button */}
      <View style={styles.aiAssistantContainer}>
        <TouchableOpacity
          style={[
            styles.aiAssistantButton,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <View style={[styles.aiIcon, { backgroundColor: colors.green }]}>
            <Ionicons name="sparkles" size={20} color={colors.white} />
          </View>
          <Text
            style={[styles.aiAssistantText, { color: colors.textSecondary }]}
          >
            Ask AI Assistant...
          </Text>
          <Ionicons name="mic" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationDot: {
    position: "absolute",
    top: 8,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.red,
    borderWidth: 2,
  },
  emergencyBanner: {
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 24,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  emergencyContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  emergencyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emergencyText: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 2,
  },
  emergencySubtitle: {
    fontSize: 12,
  },
  sosButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
  },
  sosButtonText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: "600",
  },
  kidsScrollContent: {
    paddingHorizontal: 24,
    gap: 16,
  },
  childCard: {
    width: 280,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  childImageContainer: {
    position: "relative",
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  childImage: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  statusBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  childInfo: {
    paddingHorizontal: 4,
  },
  childHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  childName: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    fontWeight: "500",
  },
  checkInButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  checkInButtonText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  historyButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  historyButtonText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  addChildCard: {
    width: 100,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  addChildIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  addChildText: {
    fontSize: 12,
    fontWeight: "bold",
  },
  quickAccessGrid: {
    paddingHorizontal: 24,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickAccessCard: {
    flex: 1,
    minWidth: "47%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  quickAccessIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  quickAccessInfo: {
    gap: 2,
  },
  quickAccessTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  quickAccessSubtitle: {
    fontSize: 12,
  },
  activityCard: {
    marginHorizontal: 24,
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  activityInfo: {
    flex: 1,
    gap: 4,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: "bold",
  },
  activityTime: {
    fontSize: 12,
  },
  activityMap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  aiAssistantContainer: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
  },
  aiAssistantButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingLeft: 8,
    paddingRight: 16,
    paddingVertical: 8,
    borderRadius: 28,
    borderWidth: 1,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 30,
    elevation: 8,
  },
  aiIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  aiAssistantText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
});
