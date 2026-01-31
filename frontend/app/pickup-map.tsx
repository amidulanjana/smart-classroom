import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Platform,
  Alert,
  Linking,
  StatusBar,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from "react-native-maps";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

// Sample locations in Sri Lanka
const CHILD_LOCATION = {
  latitude: 6.9271, // Colombo - School location
  longitude: 79.8612,
};

const PARENT_LOCATION = {
  latitude: 6.9542, // Sarah's location - 500m from previous position
  longitude: 79.8581,
};

export default function PickupMapScreen() {
  const router = useRouter();
  const [region] = useState({
    latitude: (CHILD_LOCATION.latitude + PARENT_LOCATION.latitude) / 2,
    longitude: (CHILD_LOCATION.longitude + PARENT_LOCATION.longitude) / 2,
    latitudeDelta: 0.04,
    longitudeDelta: 0.04,
  });

  const mapRef = React.useRef<MapView>(null);

  useEffect(() => {
    // Fit map to show both markers
    setTimeout(() => {
      mapRef.current?.fitToCoordinates([PARENT_LOCATION, CHILD_LOCATION], {
        edgePadding: { top: 200, right: 50, bottom: 400, left: 50 },
        animated: true,
      });
    }, 500);
  }, []);

  const calculateDistance = () => {
    // Simple distance calculation (in km)
    const R = 6371;
    const dLat =
      ((PARENT_LOCATION.latitude - CHILD_LOCATION.latitude) * Math.PI) / 180;
    const dLon =
      ((PARENT_LOCATION.longitude - CHILD_LOCATION.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((CHILD_LOCATION.latitude * Math.PI) / 180) *
        Math.cos((PARENT_LOCATION.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance.toFixed(1);
  };

  const calculateETA = () => {
    const distance = parseFloat(calculateDistance());
    const avgSpeed = 30; // km/h
    const timeInHours = distance / avgSpeed;
    const timeInMinutes = Math.round(timeInHours * 60);
    return timeInMinutes;
  };

  const handleCall = () => {
    Linking.openURL("tel:+94123456789");
  };

  const handleMessage = () => {
    Alert.alert("Message", "Opening message app...");
  };

  const handleArrived = () => {
    Alert.alert(
      "Notify Parent",
      "Notify parent when child arrives home safely?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes, Notify",
          onPress: () => {
            Alert.alert(
              "Notification Sent",
              "Parent will be notified when child arrives home!",
            );
          },
        },
      ],
    );
  };

  const handleRecenter = () => {
    mapRef.current?.fitToCoordinates([PARENT_LOCATION, CHILD_LOCATION], {
      edgePadding: { top: 200, right: 50, bottom: 400, left: 50 },
      animated: true,
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={region}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {/* Navigation Route Line */}
        <Polyline
          coordinates={[PARENT_LOCATION, CHILD_LOCATION]}
          strokeColor="#2463EB"
          strokeWidth={5}
          lineCap="round"
          lineJoin="round"
        />

        {/* Parent Location Marker (Current Position) */}
        <Marker coordinate={PARENT_LOCATION} anchor={{ x: 0.5, y: 0.5 }}>
          <View style={styles.currentLocationMarker}>
            <View style={styles.currentLocationDot} />
          </View>
        </Marker>

        {/* Child/School Location Marker */}
        <Marker coordinate={CHILD_LOCATION} anchor={{ x: 0.5, y: 1 }}>
          <View style={styles.destinationMarker}>
            <View style={styles.destinationPin} />
          </View>
        </Marker>
      </MapView>

      {/* Top Controls */}
      <View style={styles.topControls}>
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#111" />
          </TouchableOpacity>

          <View style={styles.topRightControls}>
            <View style={styles.statusPill}>
              <Ionicons name="checkmark-circle" size={18} color="#10B981" />
              <Text style={styles.statusText}>Teacher Notified</Text>
            </View>

            <View style={styles.mapControls}>
              <TouchableOpacity style={styles.mapControlButton}>
                <Ionicons name="layers-outline" size={20} color="#374151" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.mapControlButton}
                onPress={handleRecenter}
              >
                <Ionicons name="locate" size={20} color="#374151" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ETA Card */}
        <View style={styles.etaCard}>
          <View style={styles.etaContent}>
            <Text style={styles.etaTime}>
              {calculateETA()} <Text style={styles.etaUnit}>min</Text>
            </Text>
            <Text style={styles.etaDetails}>
              {calculateDistance()} km •{" "}
              {new Date(Date.now() + calculateETA() * 60000).toLocaleTimeString(
                "en-US",
                { hour: "numeric", minute: "2-digit" },
              )}
            </Text>
          </View>
          <View style={styles.etaDivider} />
          <Ionicons name="car" size={24} color="#10B981" />
        </View>
      </View>

      {/* Bottom Sheet */}
      <View style={styles.bottomSheet}>
        {/* Drag Handle */}
        <View style={styles.dragHandle} />

        {/* Student Info Header */}
        <View style={styles.studentHeader}>
          <View style={styles.studentInfo}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>DP</Text>
              </View>
              <View style={styles.gradeBadge}>
                <Text style={styles.gradeText}>3rd</Text>
              </View>
            </View>
            <View>
              <Text style={styles.pickupLabel}>SARAH IS PICKING UP</Text>
              <Text style={styles.studentName}>Dimeth Perera</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.iconButton} onPress={handleCall}>
            <Ionicons name="call" size={24} color="#374151" />
            <Text style={styles.iconButtonLabel}>Call</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconButton} onPress={handleMessage}>
            <Ionicons name="chatbubble" size={24} color="#374151" />
            <Text style={styles.iconButtonLabel}>Message</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleArrived}
          >
            <Text style={styles.primaryButtonText}>Notify When Home</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Info Banner */}
        {/* <View style={styles.infoBanner}>
          <Ionicons name="information-circle" size={20} color="#2463EB" />
          <Text style={styles.infoBannerText}>
            Please use <Text style={styles.infoBold}>Gate B</Text> for pickup
            today due to construction on Main St.
          </Text>
        </View> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F6F8",
  },
  map: {
    flex: 1,
  },
  // Custom Markers
  currentLocationMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  currentLocationDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#2463EB",
  },
  destinationMarker: {
    alignItems: "center",
  },
  destinationPin: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#2463EB",
    borderWidth: 3,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  // Top Controls
  topControls: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: Platform.OS === "ios" ? 50 : 20,
    paddingHorizontal: 16,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  topRightControls: {
    alignItems: "flex-end",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111",
  },
  mapControls: {
    marginTop: 12,
    gap: 8,
  },
  mapControlButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  // ETA Card
  etaCard: {
    position: "absolute",
    top: Platform.OS === "ios" ? 130 : 100,
    left: 16,
    backgroundColor: "#1F2937",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
    maxWidth: 200,
  },
  etaContent: {
    flex: 1,
  },
  etaTime: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFF",
    lineHeight: 24,
  },
  etaUnit: {
    fontSize: 14,
    fontWeight: "normal",
    color: "#D1D5DB",
  },
  etaDetails: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "500",
    marginTop: 2,
  },
  etaDivider: {
    width: 1,
    height: 32,
    backgroundColor: "#374151",
  },
  // Bottom Sheet
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === "ios" ? 34 : 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
  dragHandle: {
    width: 48,
    height: 6,
    backgroundColor: "#D1D5DB",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 16,
  },
  studentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  studentInfo: {
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
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2463EB",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2463EB",
  },
  gradeBadge: {
    position: "absolute",
    bottom: -4,
    right: -4,
    backgroundColor: "#2463EB",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#FFF",
  },
  gradeText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#FFF",
  },
  pickupLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  studentName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111",
  },
  parentInfo: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
  pickupCodeContainer: {
    alignItems: "flex-end",
  },
  pickupCodeLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 4,
  },
  pickupCode: {
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  pickupCodeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2463EB",
    letterSpacing: 4,
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
  },
  // Action Buttons
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  iconButton: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 80,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
  },
  iconButtonLabel: {
    fontSize: 10,
    fontWeight: "500",
    color: "#374151",
  },
  primaryButton: {
    flex: 2,
    backgroundColor: "#2463EB",
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    paddingVertical: 16,
    shadowColor: "#2463EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },
  // Info Banner
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 12,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 12,
    color: "#1E40AF",
    lineHeight: 16,
  },
  infoBold: {
    fontWeight: "bold",
  },
});
