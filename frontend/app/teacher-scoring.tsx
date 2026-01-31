import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";

const initialStudents = [
  {
    id: "1",
    name: "Lucas B.",
    avatar: "https://i.pravatar.cc/150?u=lucasb",
    score: "😊",
  },
  {
    id: "2",
    name: "Emma W.",
    avatar: "https://i.pravatar.cc/150?u=emmaw",
    score: null,
  },
  {
    id: "3",
    name: "Noah G.",
    avatar: "https://i.pravatar.cc/150?u=noahg",
    score: "😐",
  },
  {
    id: "4",
    name: "Sophia C.",
    avatar: "https://i.pravatar.cc/150?u=sophiac",
    score: null,
  },
  {
    id: "5",
    name: "Oliver S.",
    avatar: "https://i.pravatar.cc/150?u=olivers",
    score: "😞",
  },
  {
    id: "6",
    name: "Mason L.",
    avatar: "https://i.pravatar.cc/150?u=masonl",
    score: null,
  },
  {
    id: "7",
    name: "Ava R.",
    avatar: "https://i.pravatar.cc/150?u=avar",
    score: null,
  },
  {
    id: "8",
    name: "Liam K.",
    avatar: "https://i.pravatar.cc/150?u=liamk",
    score: null,
  },
  {
    id: "9",
    name: "Mila D.",
    avatar: "https://i.pravatar.cc/150?u=milad",
    score: null,
  },
];

export default function TeacherScoringScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const router = useRouter();

  const [students, setStudents] = useState<any[]>(initialStudents);
  const [query, setQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [failedAvatars, setFailedAvatars] = useState<any>({});

  const markAllAsGood = () => {
    setStudents((s) => s.map((st) => ({ ...st, score: "😊" })));
  };

  const openScoring = (student: any) => {
    setSelectedStudent(student);
    setModalVisible(true);
  };

  const applyScore = (score: string) => {
    if (!selectedStudent) return;
    setStudents((s) =>
      s.map((st) => (st.id === selectedStudent.id ? { ...st, score } : st)),
    );
    setModalVisible(false);
    setSelectedStudent(null);
  };

  const filtered = students.filter((st) =>
    st.name.toLowerCase().includes(query.toLowerCase()),
  );

  const renderItem = ({ item }: { item: any }) => {
    const bg =
      item.score === "😊"
        ? styles.goodBg
        : item.score === "😐"
          ? styles.avgBg
          : item.score === "😞"
            ? styles.badBg
            : styles.neutralBg;

    return (
      <Pressable
        onLongPress={() => openScoring(item)}
        style={[styles.card, bg]}
        android_ripple={{ color: "#00000008" }}
      >
        <View style={styles.avatarWrap}>
          {item.avatar && !failedAvatars[item.id] ? (
            <Image
              source={{ uri: item.avatar }}
              style={styles.avatar}
              resizeMode="cover"
              onError={() =>
                setFailedAvatars((p) => ({ ...p, [item.id]: true }))
              }
            />
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <Text style={{ color: colors.text }}>
                {item.name.split(" ")[0][0]}
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.name, { color: colors.text }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.scoreText}>{item.score || "—"}</Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Scorings</Text>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="calendar-outline" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={styles.topActions}>
        <TouchableOpacity
          style={[styles.markAll, { backgroundColor: colors.primary }]}
          onPress={markAllAsGood}
        >
          <Ionicons name="happy-outline" size={20} color="#fff" />
          <Text style={styles.markAllText}>Mark All as Good</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchWrap}>
        <Ionicons
          name="search"
          size={18}
          color="#9CA3AF"
          style={{ marginLeft: 8 }}
        />
        <TextInput
          placeholder="Search by name or voice..."
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
        />
        <TouchableOpacity style={styles.micBtn}>
          <Ionicons name="mic-outline" size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.infoRow}>
        <View>
          <Text style={[styles.classTitle, { color: colors.text }]}>
            Class 4B • 24 Students
          </Text>
          <Text style={[styles.classDate, { color: colors.textSecondary }]}>
            Wednesday, Oct 25
          </Text>
        </View>
        <Text style={[styles.gridLabel, { color: colors.primary }]}>
          Grid View
        </Text>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(it) => it.id}
        renderItem={renderItem}
        numColumns={3}
        contentContainerStyle={styles.list}
      />

      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Assign score
            </Text>
            <View style={styles.emojiRow}>
              <TouchableOpacity
                style={styles.emojiBtn}
                onPress={() => applyScore("😊")}
              >
                <Text style={styles.emoji}>😊</Text>
                <Text style={[styles.emojiLabel, { color: "#16A34A" }]}>
                  Good
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.emojiBtn}
                onPress={() => applyScore("😐")}
              >
                <Text style={styles.emoji}>😐</Text>
                <Text style={[styles.emojiLabel, { color: "#D97706" }]}>
                  Avg
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.emojiBtn}
                onPress={() => applyScore("😞")}
              >
                <Text style={styles.emoji}>😞</Text>
                <Text style={[styles.emojiLabel, { color: "#DC2626" }]}>
                  Bad
                </Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={styles.modalClose}
            >
              <Text style={{ color: colors.primary }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    justifyContent: "space-between",
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { fontSize: 18, fontWeight: "700" },
  iconBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  topActions: { paddingHorizontal: 16, paddingVertical: 8 },
  markAll: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 14,
    borderRadius: 14,
  },
  markAllText: { color: "#fff", fontWeight: "700", marginLeft: 8 },
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    margin: 12,
    backgroundColor: "white",
    borderRadius: 12,
    height: 48,
  },
  searchInput: { flex: 1, paddingHorizontal: 8 },
  micBtn: { width: 44, alignItems: "center", justifyContent: "center" },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  classTitle: { fontWeight: "700" },
  classDate: { fontSize: 12 },
  gridLabel: { fontSize: 12, fontWeight: "600" },
  list: { paddingHorizontal: 12, paddingBottom: 140 },
  card: {
    flex: 1 / 3,
    margin: 6,
    alignItems: "center",
    padding: 10,
    borderRadius: 14,
    minWidth: 100,
  },
  avatarWrap: { marginBottom: 6 },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  avatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  name: { fontSize: 12, fontWeight: "700" },
  scoreText: { fontSize: 11, marginTop: 4 },
  neutralBg: { backgroundColor: "#fff" },
  goodBg: { backgroundColor: "#E6F4EA" },
  avgBg: { backgroundColor: "#FFF7ED" },
  badBg: { backgroundColor: "#FEECEC" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCard: {
    width: 300,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
  },
  modalTitle: { fontWeight: "700", marginBottom: 8 },
  emojiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  emojiBtn: { alignItems: "center", flex: 1 },
  emoji: { fontSize: 28 },
  emojiLabel: { fontSize: 11, fontWeight: "700", marginTop: 6 },
  modalClose: { marginTop: 12 },
});
