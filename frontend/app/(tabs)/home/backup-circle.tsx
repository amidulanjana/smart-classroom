import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

type ContactRelation =
  | "Partner"
  | "Spouse"
  | "Parent"
  | "Grandparent"
  | "Neighbor"
  | "Nanny";

interface Contact {
  id: number;
  name: string;
  relation: ContactRelation;
  priority: "Primary" | "Secondary" | "Tertiary";
  verified: boolean;
  initials: string;
}

export default function BackupCircleScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();

  const [autoNotify, setAutoNotify] = useState(true);
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: 1,
      name: "Sarah Miller",
      relation: "Parent",
      priority: "Primary",
      verified: true,
      initials: "SM",
    },
    {
      id: 2,
      name: "David Chen",
      relation: "Parent",
      priority: "Secondary",
      verified: false,
      initials: "DC",
    },
  ]);

  const handleAddContact = () => {
    console.log("Add contact pressed");
  };

  const handleTestConnection = (contactId: number) => {
    console.log("Test connection for contact:", contactId);
  };

  const handleResendInvite = (contactId: number) => {
    console.log("Resend invite for contact:", contactId);
  };

  const handleSaveAndActivate = () => {
    console.log("Save and activate circle");
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View
            style={[
              styles.heroCard,
              {
                backgroundColor: colors.primary,
              },
            ]}
          >
            <View style={styles.heroContent}>
              <View
                style={[
                  styles.networkBadge,
                  { backgroundColor: `${colors.white}33` },
                ]}
              >
                <Ionicons name="share-social" size={16} color={colors.white} />
                <Text
                  style={[styles.networkBadgeText, { color: colors.white }]}
                >
                  Network Active
                </Text>
              </View>
              <Text style={[styles.heroTitle, { color: colors.white }]}>
                Your Safety Net
              </Text>
              <Text style={[styles.heroDescription, { color: colors.white }]}>
                Who can we contact if we cant reach you? Setup your trusted
                emergency circle below.
              </Text>
            </View>
            <View style={styles.heroDecoration}>
              <Ionicons
                name="git-network"
                size={60}
                color={`${colors.white}4D`}
              />
            </View>
          </View>
        </View>

        {/* Trusted Contacts Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Trusted Contacts
            </Text>
            <View
              style={[
                styles.filledBadge,
                { backgroundColor: `${colors.primary}1A` },
              ]}
            >
              <Text style={[styles.filledBadgeText, { color: colors.primary }]}>
                {contacts.length}/3 Filled
              </Text>
            </View>
          </View>

          <View style={styles.contactsList}>
            {/* Contact Cards */}
            {contacts.map((contact, index) => (
              <View
                key={contact.id}
                style={[
                  styles.contactCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.contactCardHeader}>
                  <View style={styles.contactInfo}>
                    <View style={styles.avatarContainer}>
                      <View
                        style={[
                          styles.avatar,
                          {
                            backgroundColor:
                              index === 0 ? colors.primary : colors.orange,
                          },
                        ]}
                      >
                        <Text
                          style={[styles.avatarText, { color: colors.white }]}
                        >
                          {contact.initials}
                        </Text>
                      </View>
                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: contact.verified
                              ? colors.green
                              : colors.orange,
                            borderColor: colors.surface,
                          },
                        ]}
                      >
                        <Ionicons
                          name={contact.verified ? "checkmark" : "warning"}
                          size={10}
                          color={colors.white}
                        />
                      </View>
                    </View>
                    <View style={styles.contactDetails}>
                      <Text
                        style={[styles.contactName, { color: colors.text }]}
                      >
                        {contact.name}
                      </Text>
                      <View style={styles.relationRow}>
                        <View
                          style={[
                            styles.relationPicker,
                            {
                              backgroundColor:
                                colorScheme === "dark"
                                  ? `${colors.text}10`
                                  : colors.blueLight,
                              borderColor: colors.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.relationText,
                              { color: colors.textSecondary },
                            ]}
                          >
                            {contact.relation}
                          </Text>
                          <Ionicons
                            name="chevron-down"
                            size={12}
                            color={colors.textSecondary}
                          />
                        </View>
                        <Text
                          style={[
                            styles.priorityText,
                            { color: colors.textSecondary },
                          ]}
                        >
                          • {contact.priority}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.menuButton}>
                    <Ionicons
                      name="ellipsis-vertical"
                      size={20}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                </View>

                <View
                  style={[
                    styles.contactCardFooter,
                    { borderTopColor: colors.border },
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { backgroundColor: `${colors.primary}10` },
                    ]}
                    onPress={() =>
                      contact.verified
                        ? handleTestConnection(contact.id)
                        : handleResendInvite(contact.id)
                    }
                  >
                    <Ionicons
                      name={contact.verified ? "cellular" : "notifications"}
                      size={18}
                      color={colors.primary}
                    />
                    <Text
                      style={[
                        styles.actionButtonText,
                        { color: colors.primary },
                      ]}
                    >
                      {contact.verified ? "Test Connection" : "Resend Invite"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            {/* Add Contact Card */}
            {contacts.length < 3 && (
              <TouchableOpacity
                style={[styles.addContactCard, { borderColor: colors.border }]}
                onPress={handleAddContact}
              >
                <View
                  style={[
                    styles.addContactIcon,
                    { backgroundColor: `${colors.text}10` },
                  ]}
                >
                  <Ionicons name="add" size={24} color={colors.textSecondary} />
                </View>
                <View style={styles.addContactContent}>
                  <Text
                    style={[styles.addContactTitle, { color: colors.text }]}
                  >
                    Add Backup Contact
                  </Text>
                  <Text
                    style={[
                      styles.addContactSubtitle,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Tertiary emergency contact
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Emergency Protocol Section */}
        <View style={[styles.section, { marginBottom: 100 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Emergency Protocol
          </Text>
          <View
            style={[
              styles.protocolCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.protocolContent}>
              <View style={styles.protocolHeader}>
                <Ionicons name="git-compare" size={20} color={colors.primary} />
                <Text style={[styles.protocolTitle, { color: colors.text }]}>
                  Auto-notify Circle
                </Text>
              </View>
              <Text
                style={[
                  styles.protocolDescription,
                  { color: colors.textSecondary },
                ]}
              >
                AI will automatically contact your circle if you dont respond to
                urgent school alerts within{" "}
                <Text style={[styles.protocolBold, { color: colors.text }]}>
                  5 minutes
                </Text>
                .
              </Text>
            </View>
            <Switch
              value={autoNotify}
              onValueChange={setAutoNotify}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>
          <View style={styles.protocolHint}>
            <Ionicons
              name="information-circle"
              size={16}
              color={colors.textSecondary}
            />
            <Text
              style={[styles.protocolHintText, { color: colors.textSecondary }]}
            >
              Contacts will be called in order of priority: Primary → Secondary
              → Tertiary.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Footer */}
      <View
        style={[
          styles.footer,
          {
            backgroundColor:
              colorScheme === "dark"
                ? `${colors.background}E6`
                : `${colors.white}E6`,
            borderTopColor: colors.border,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.primary }]}
          onPress={handleSaveAndActivate}
        >
          <Ionicons name="save" size={20} color={colors.white} />
          <Text style={[styles.saveButtonText, { color: colors.white }]}>
            Save & Activate Circle
          </Text>
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
    paddingBottom: 20,
  },
  heroSection: {
    padding: 16,
  },
  heroCard: {
    borderRadius: 16,
    minHeight: 220,
    padding: 20,
    position: "relative",
    overflow: "hidden",
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  heroContent: {
    zIndex: 10,
  },
  networkBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  networkBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  heroDescription: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
    maxWidth: 280,
    opacity: 0.9,
  },
  heroDecoration: {
    position: "absolute",
    top: 16,
    right: 16,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  filledBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  filledBadgeText: {
    fontSize: 12,
    fontWeight: "600",
  },
  contactsList: {
    gap: 16,
  },
  contactCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  contactCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  contactInfo: {
    flexDirection: "row",
    gap: 16,
    flex: 1,
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
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
  },
  statusBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
  },
  contactDetails: {
    flex: 1,
    paddingTop: 4,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  relationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  relationPicker: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
  },
  relationText: {
    fontSize: 12,
  },
  priorityText: {
    fontSize: 12,
  },
  menuButton: {
    padding: 4,
  },
  contactCardFooter: {
    paddingTop: 12,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  addContactCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: "dashed",
    padding: 24,
  },
  addContactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  addContactContent: {
    flex: 1,
  },
  addContactTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  addContactSubtitle: {
    fontSize: 12,
  },
  protocolCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginTop: 12,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  protocolContent: {
    flex: 1,
  },
  protocolHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  protocolTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  protocolDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  protocolBold: {
    fontWeight: "700",
  },
  protocolHint: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
    paddingHorizontal: 4,
  },
  protocolHintText: {
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderTopWidth: 1,
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: Colors.light.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
