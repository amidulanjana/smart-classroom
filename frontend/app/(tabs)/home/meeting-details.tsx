import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { Colors } from "@/constants/theme";

interface ActionItem {
  id: string;
  text: string;
  completed: boolean;
}

interface TranscriptMessage {
  id: string;
  speaker: "Teacher" | "Parent";
  message: string;
}

export default function MeetingDetailsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const colors = Colors[colorScheme ?? "light"];

  const [activeTab, setActiveTab] = useState<"english" | "sinhala">("english");
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [actionItems, setActionItems] = useState<ActionItem[]>([
    {
      id: "1",
      text: "Sign and return field trip permission slip",
      completed: false,
    },
    {
      id: "2",
      text: "Review Chapter 4 math homework with Sarah",
      completed: false,
    },
    {
      id: "3",
      text: "Schedule follow-up meeting",
      completed: true,
    },
  ]);

  const transcriptMessages: TranscriptMessage[] = [
    {
      id: "1",
      speaker: "Teacher",
      message:
        "Hello, thank you for coming in today. I wanted to discuss Sarah's progress in mathematics specifically.",
    },
    {
      id: "2",
      speaker: "Parent",
      message:
        "Yes, we noticed she was struggling a bit with the last homework assignment.",
    },
    {
      id: "3",
      speaker: "Teacher",
      message:
        "Exactly. Her arithmetic is strong, but algebra concepts need a bit more practice. Chapter 4 covers this in depth.",
    },
  ];

  const toggleActionItem = (id: string) => {
    setActionItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item,
      ),
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Custom Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Meeting Summary
          </Text>
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={14} color="#2563eb" />
            <Text style={styles.aiBadgeText}>AI</Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View
        style={[
          styles.tabsContainer,
          {
            backgroundColor: colors.background,
            borderBottomColor: isDark ? "#374151" : "#e5e7eb",
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "english" && styles.tabActive,
            activeTab === "english" && { borderBottomColor: "#2563eb" },
          ]}
          onPress={() => setActiveTab("english")}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === "english"
                    ? "#2563eb"
                    : isDark
                      ? "#9ca3af"
                      : "#6b7280",
              },
            ]}
          >
            English
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "sinhala" && styles.tabActive,
            activeTab === "sinhala" && { borderBottomColor: "#2563eb" },
          ]}
          onPress={() => setActiveTab("sinhala")}
        >
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === "sinhala"
                    ? "#2563eb"
                    : isDark
                      ? "#9ca3af"
                      : "#6b7280",
              },
            ]}
          >
            Sinhala
          </Text>
        </TouchableOpacity>
      </View>

      {/* Scrollable Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Disclaimer */}
        <View style={styles.disclaimerContainer}>
          <View
            style={[
              styles.disclaimer,
              {
                backgroundColor: isDark ? "rgba(234, 179, 8, 0.1)" : "#fef9c3",
                borderColor: isDark ? "rgba(234, 179, 8, 0.3)" : "#fef3c7",
              },
            ]}
          >
            <Ionicons
              name="information-circle-outline"
              size={16}
              color={isDark ? "#fbbf24" : "#ca8a04"}
              style={styles.disclaimerIcon}
            />
            <Text
              style={[
                styles.disclaimerText,
                { color: isDark ? "#fde68a" : "#854d0e" },
              ]}
            >
              Summary generated by AI. Please review the full transcript for
              complete accuracy.
            </Text>
          </View>
        </View>

        {/* Key Points */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Key Points
          </Text>
          <View style={styles.pointsContainer}>
            {/* Point 1 */}
            <View
              style={[
                styles.pointCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: isDark ? colors.border : "#e5e7eb",
                },
              ]}
            >
              <View
                style={[
                  styles.pointIcon,
                  {
                    backgroundColor: isDark
                      ? "rgba(34, 197, 94, 0.2)"
                      : "#dcfce7",
                  },
                ]}
              >
                <Ionicons
                  name="calculator-outline"
                  size={24}
                  color={isDark ? "#4ade80" : "#16a34a"}
                />
              </View>
              <View style={styles.pointContent}>
                <Text style={[styles.pointTitle, { color: colors.text }]}>
                  Math Progress
                </Text>
                <Text
                  style={[
                    styles.pointDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  Improving steadily, though extra focus on algebra concepts is
                  recommended for the upcoming test.
                </Text>
              </View>
            </View>

            {/* Point 2 */}
            <View
              style={[
                styles.pointCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: isDark ? colors.border : "#e5e7eb",
                },
              ]}
            >
              <View
                style={[
                  styles.pointIcon,
                  {
                    backgroundColor: isDark
                      ? "rgba(59, 130, 246, 0.2)"
                      : "#dbeafe",
                  },
                ]}
              >
                <Ionicons
                  name="bus-outline"
                  size={24}
                  color={isDark ? "#60a5fa" : "#2563eb"}
                />
              </View>
              <View style={styles.pointContent}>
                <Text style={[styles.pointTitle, { color: colors.text }]}>
                  Field Trip
                </Text>
                <Text
                  style={[
                    styles.pointDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  Scheduled for next Friday. Permission slip needs to be signed
                  and returned by Wednesday.
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Items */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Action Items
          </Text>
          <View style={styles.actionItemsContainer}>
            {actionItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.actionItem,
                  {
                    backgroundColor: isDark
                      ? "transparent"
                      : item.completed
                        ? "#f9fafb"
                        : "transparent",
                  },
                ]}
                onPress={() => toggleActionItem(item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.checkboxContainer}>
                  <View
                    style={[
                      styles.checkbox,
                      {
                        backgroundColor: item.completed
                          ? "#2563eb"
                          : colors.surface,
                        borderColor: item.completed
                          ? "#2563eb"
                          : isDark
                            ? "#4b5563"
                            : "#d1d5db",
                      },
                    ]}
                  >
                    {item.completed && (
                      <Ionicons name="checkmark" size={14} color="#ffffff" />
                    )}
                  </View>
                </View>
                <Text
                  style={[
                    styles.actionItemText,
                    {
                      color: item.completed
                        ? isDark
                          ? "#6b7280"
                          : "#9ca3af"
                        : isDark
                          ? "#d1d5db"
                          : "#374151",
                      textDecorationLine: item.completed
                        ? "line-through"
                        : "none",
                    },
                  ]}
                >
                  {item.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Full Transcript */}
        <View style={styles.section}>
          <TouchableOpacity
            style={[
              styles.accordionHeader,
              {
                backgroundColor: colors.surface,
                borderColor: isDark ? colors.border : "#e5e7eb",
              },
            ]}
            onPress={() => setShowTranscript(!showTranscript)}
            activeOpacity={0.7}
          >
            <Text style={[styles.accordionTitle, { color: colors.text }]}>
              Full Transcript
            </Text>
            <Ionicons
              name={showTranscript ? "chevron-up" : "chevron-down"}
              size={20}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {showTranscript && (
            <View
              style={[
                styles.transcriptContent,
                {
                  backgroundColor: colors.surface,
                  borderColor: isDark ? colors.border : "#e5e7eb",
                },
              ]}
            >
              {transcriptMessages.map((msg) => (
                <View key={msg.id} style={styles.transcriptMessage}>
                  <View
                    style={[
                      styles.speakerAvatar,
                      {
                        backgroundColor:
                          msg.speaker === "Teacher"
                            ? isDark
                              ? "rgba(168, 85, 247, 0.2)"
                              : "#f3e8ff"
                            : isDark
                              ? "rgba(59, 130, 246, 0.2)"
                              : "#dbeafe",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.speakerInitial,
                        {
                          color:
                            msg.speaker === "Teacher"
                              ? isDark
                                ? "#c084fc"
                                : "#7c3aed"
                              : isDark
                                ? "#60a5fa"
                                : "#2563eb",
                        },
                      ]}
                    >
                      {msg.speaker[0]}
                    </Text>
                  </View>
                  <View style={styles.messageContent}>
                    <Text style={[styles.speakerName, { color: colors.text }]}>
                      {msg.speaker}
                    </Text>
                    <Text
                      style={[
                        styles.messageText,
                        { color: isDark ? "#d1d5db" : "#4b5563" },
                      ]}
                    >
                      {msg.message}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Sticky Footer */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.surface,
            borderTopColor: isDark ? colors.border : "#e5e7eb",
          },
        ]}
      >
        {/* Audio Player */}
        <View style={styles.audioPlayer}>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => setIsPlaying(!isPlaying)}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={20}
              color="#ffffff"
            />
          </TouchableOpacity>

          {/* Waveform */}
          <View style={styles.waveform}>
            {[
              3, 5, 4, 6, 8, 5, 3, 4, 2, 4, 6, 3, 2, 4, 2, 5, 3, 2, 4, 6, 3, 2,
              4, 5, 3,
            ].map((height, index) => (
              <View
                key={index}
                style={[
                  styles.waveformBar,
                  {
                    height: height * 3,
                    backgroundColor:
                      index < 8 ? "#2563eb" : isDark ? "#4b5563" : "#e5e7eb",
                  },
                ]}
              />
            ))}
          </View>

          <Text
            style={[styles.duration, { color: isDark ? "#9ca3af" : "#6b7280" }]}
          >
            03:14
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: isDark ? colors.border : "#f3f4f6",
              },
            ]}
          >
            <Ionicons name="download-outline" size={20} color={colors.text} />
            <Text style={[styles.actionButtonText, { color: colors.text }]}>
              PDF
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton}>
            <Ionicons name="chatbubble-outline" size={20} color="#ffffff" />
            <Text style={styles.primaryButtonText}>Ask Follow-up</Text>
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
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(37, 99, 235, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  aiBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2563eb",
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomWidth: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "700",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 200,
  },
  disclaimerContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  disclaimer: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  disclaimerIcon: {
    marginTop: 2,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  pointsContainer: {
    gap: 12,
  },
  pointCard: {
    flexDirection: "row",
    gap: 16,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  pointIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  pointContent: {
    flex: 1,
    gap: 4,
  },
  pointTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  pointDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  actionItemsContainer: {
    gap: 8,
  },
  actionItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    padding: 12,
    borderRadius: 8,
  },
  checkboxContainer: {
    paddingTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  actionItemText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  accordionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  accordionTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  transcriptContent: {
    marginTop: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    gap: 12,
  },
  transcriptMessage: {
    flexDirection: "row",
    gap: 12,
  },
  speakerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  speakerInitial: {
    fontSize: 12,
    fontWeight: "700",
  },
  messageContent: {
    flex: 1,
    gap: 2,
  },
  speakerName: {
    fontSize: 12,
    fontWeight: "700",
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 5,
  },
  audioPlayer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  waveform: {
    flex: 1,
    height: 32,
    flexDirection: "row",
    alignItems: "center",
    gap: 1,
  },
  waveformBar: {
    flex: 1,
    borderRadius: 2,
  },
  duration: {
    fontSize: 12,
    fontWeight: "500",
    width: 40,
    textAlign: "right",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
  primaryButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "#2563eb",
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
});
