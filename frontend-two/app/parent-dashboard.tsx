import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Image,
  Modal,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import apiService from '@/services/api';

interface PendingPickup {
  _id: string;
  emergencyPickupId: string;
  studentId: {
    _id: string;
    name: string;
    profilePhoto?: string;
    grade: string;
    section: string;
    homeLocation?: {
      latitude: number;
      longitude: number;
      address: string;
    };
  };
  classId: {
    name: string;
  };
  reason: string;
  newPickupTime: Date;
  recipientRole: 'primary' | 'secondary' | 'backup';
  status: string;
  userResponse?: 'pending' | 'accepted' | 'declined';
  teacherName: string;
}

export default function ParentDashboard() {
  const router = useRouter();
  const { user } = useAuth();
  const [pendingPickups, setPendingPickups] = useState<PendingPickup[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  
  // Map State (Moved to separate page, keeping here just in case needed for inline preview)
  const [mapVisible, setMapVisible] = useState(false);
  const [mapLocation, setMapLocation] = useState<{latitude: number; longitude: number; title: string} | null>(null);

  useEffect(() => {
    if (user?.role === 'parent') {
      loadPendingPickups();
    }
  }, [user]);

  const loadPendingPickups = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPendingPickups(user!.id);
      
      if (response.success && response.data) {
        setPendingPickups(response.data);
      }
    } catch (error) {
      console.error('Error loading pending pickups:', error);
      // Just set empty array if API fails (backend not running)
      setPendingPickups([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPendingPickups();
    setRefreshing(false);
  };

  const handleResponse = async (
    pickup: PendingPickup,
    response: 'accepted' | 'declined'
  ) => {
    const actionText = response === 'accepted' ? 'accept' : 'decline';
    
    Alert.alert(
      `Confirm ${actionText === 'accept' ? 'Pickup' : 'Decline'}`,
      response === 'accepted'
        ? `Are you sure you can pick up ${pickup.studentId.name} from ${pickup.classId.name}?`
        : `Are you sure you cannot pick up ${pickup.studentId.name}? The system will notify backup parents.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: `Yes, ${actionText}`,
          onPress: () => submitResponse(pickup, response),
        },
      ]
    );
  };

  const openMapPage = (studentId: any) => {
    const location = studentId.homeLocation?.latitude ? studentId.homeLocation : {
       // Default fallback if missing 
       latitude: 37.78825,
       longitude: -122.4324,
       address: 'Location Unavailable'
    };

    router.push({
      pathname: '/pickup-map',
      params: {
        latitude: location.latitude,
        longitude: location.longitude,
        studentName: studentId.name,
        address: location.address
      }
    } as any);
  };

  const submitResponse = async (
    pickup: PendingPickup,
    response: 'accepted' | 'declined'
  ) => {
    try {
      setRespondingTo(pickup._id);

      const result = await apiService.respondToPickup(
        pickup.emergencyPickupId,
        pickup.studentId._id,
        user!.id,
        response
      );

      if (result.success) {
        if (response === 'accepted') {
          Alert.alert(
            'Pickup Confirmed',
            `Thank you! Please pick up ${pickup.studentId.name}. Redirecting to map...`,
            [
              {
                text: 'OK',
                onPress: () => {
                   loadPendingPickups(); // Refresh list to show "View in Map" button
                   openMapPage(pickup.studentId);
                },
              },
            ]
          );
        } else {
          Alert.alert(
            'Response Recorded',
            'Your response has been recorded.',
            [
              {
                text: 'OK',
                onPress: () => loadPendingPickups(),
              },
            ]
          );
        }
      } else {
        Alert.alert('Error', result.message || 'Failed to submit response');
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      Alert.alert('Error', 'Failed to submit response. Please try again.');
    } finally {
      setRespondingTo(null);
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'primary':
        return '#4CAF50';
      case 'secondary':
        return '#FF9800';
      case 'backup':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'primary':
        return 'Primary Guardian';
      case 'secondary':
        return 'Secondary Guardian';
      case 'backup':
        return 'Backup Circle';
      default:
        return role;
    }
  };

  if (user?.role !== 'parent') {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Access denied. Parent role required.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Parent Dashboard</Text>
          <Text style={styles.subtitle}>Welcome, {user.name}</Text>
        </View>

        {/* Pending Pickup Requests */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {pendingPickups.length > 0 ? '🚨 Urgent Pickup Requests' : '✅ No Pending Requests'}
          </Text>

          {loading && !refreshing ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2196F3" />
              <Text style={styles.loadingText}>Loading pickup requests...</Text>
            </View>
          ) : pendingPickups.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No emergency pickup requests at the moment.</Text>
              <Text style={styles.emptySubtext}>
                You'll be notified here when your child needs to be picked up early.
              </Text>
            </View>
          ) : (
            pendingPickups.map((pickup) => (
              <View key={pickup._id} style={styles.pickupCard}>
                {/* Student Info */}
                <View style={styles.studentHeader}>
                  {pickup.studentId.profilePhoto ? (
                    <Image
                      source={{ uri: pickup.studentId.profilePhoto }}
                      style={styles.studentPhoto}
                    />
                  ) : (
                    <View style={styles.studentPhotoPlaceholder}>
                      <Text style={styles.studentInitial}>
                        {pickup.studentId.name.charAt(0)}
                      </Text>
                    </View>
                  )}
                  <View style={styles.studentInfo}>
                    <Text style={styles.studentName}>{pickup.studentId.name}</Text>
                    <Text style={styles.classInfo}>
                      {pickup.classId.name} - Grade {pickup.studentId.grade}
                      {pickup.studentId.section}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.roleBadge,
                      { backgroundColor: getRoleColor(pickup.recipientRole) },
                    ]}
                  >
                    <Text style={styles.roleText}>{getRoleText(pickup.recipientRole)}</Text>
                  </View>
                </View>

                {/* Alert Message */}
                <View style={styles.alertBox}>
                  <Text style={styles.alertIcon}>⚠️</Text>
                  <View style={styles.alertContent}>
                    <Text style={styles.alertTitle}>Class Dismissed Early</Text>
                    <Text style={styles.alertText}>
                      Reason: {pickup.reason}
                    </Text>
                    <Text style={styles.alertText}>
                      Pickup Time: {new Date(pickup.newPickupTime).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                    {pickup.teacherName && (
                      <Text style={styles.alertText}>
                        Teacher: {pickup.teacherName}
                      </Text>
                    )}
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  {(pickup.userResponse === 'accepted' || pickup.status === 'read' && !pickup.userResponse) ? (
                    <TouchableOpacity
                      style={[styles.button, { backgroundColor: '#2196F3' }]}
                      onPress={() => openMapPage(pickup.studentId)}
                    >
                      <Text style={styles.buttonText}>📍 View in Map</Text>
                    </TouchableOpacity>
                  ) : (
                    <>
                      <TouchableOpacity
                        style={[styles.button, styles.acceptButton]}
                        onPress={() => handleResponse(pickup, 'accepted')}
                        disabled={respondingTo === pickup._id}
                      >
                        {respondingTo === pickup._id ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <>
                            <Text style={styles.buttonText}>✓ I Can Pick Up</Text>
                          </>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.button, styles.declineButton]}
                        onPress={() => handleResponse(pickup, 'declined')}
                        disabled={respondingTo === pickup._id}
                      >
                        <Text style={styles.buttonText}>✗ I Cannot</Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>

                {/* Help Text */}
                {pickup.recipientRole === 'backup' && (
                  <View style={styles.helpBox}>
                    <Text style={styles.helpText}>
                      ℹ️ You're receiving this as a backup contact. The primary and secondary
                      guardians were unable to pick up.
                    </Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        {/* Info Section */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ How to respond:</Text>
          <Text style={styles.infoText}>
            • <Text style={styles.bold}>I Can Pick Up:</Text> Confirm you'll pick up your child. The
            teacher will be notified immediately.
          </Text>
          <Text style={styles.infoText}>
            • <Text style={styles.bold}>I Cannot:</Text> Let the system know you're unavailable. It
            will automatically notify backup contacts.
          </Text>
          <Text style={styles.infoText}>
            • Please respond as quickly as possible to ensure your child's safety.
          </Text>
        </View>
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  emptyState: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  pickupCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  studentPhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  studentPhotoPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  studentInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  classInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  roleText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  alertBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF3E0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  alertIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100',
    marginBottom: 4,
  },
  alertText: {
    fontSize: 14,
    color: '#E65100',
    marginBottom: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  acceptButton: {
    backgroundColor: '#4CAF50',
  },
  declineButton: {
    backgroundColor: '#9E9E9E',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  helpBox: {
    backgroundColor: '#E3F2FD',
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  helpText: {
    fontSize: 13,
    color: '#1565C0',
  },
  infoCard: {
    backgroundColor: '#E8F5E9',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#388E3C',
    marginBottom: 8,
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 50,
  },
});
