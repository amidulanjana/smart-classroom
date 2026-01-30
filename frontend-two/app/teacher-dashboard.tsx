import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import apiService from '@/services/api';
import type { EmergencyPickup } from '@/services/api';

interface ClassInfo {
  _id: string;
  name: string;
  grade: string;
  section: string;
  studentCount?: number;
}

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [selectedClass, setSelectedClass] = useState<ClassInfo | null>(null);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activePickups, setActivePickups] = useState<EmergencyPickup[]>([]);

  useEffect(() => {
    if (user?.role === 'teacher') {
      loadTeacherData();
    }
  }, [user]);

  const loadTeacherData = async () => {
    try {
      setLoading(true);
      
      // Try to load teacher's classes from API
      try {
        const classesResponse = await apiService.getTeacherClasses(user!.id);
        if (classesResponse.success && classesResponse.data) {
          setClasses(classesResponse.data);
        }
      } catch (apiError) {
        // Use mock data if API fails
        console.log('Using mock class data (backend not available)');
        setClasses([
          {
            _id: '1',
            name: 'Mathematics',
            grade: '5',
            section: 'A',
            studentCount: 25,
          },
          {
            _id: '2',
            name: 'Science',
            grade: '5',
            section: 'B',
            studentCount: 28,
          },
          {
            _id: '3',
            name: 'English',
            grade: '6',
            section: 'A',
            studentCount: 22,
          },
        ]);
      }

      // Try to load active pickups
      try {
        const pickupsResponse = await apiService.getActivePickupsForTeacher(user!.id);
        if (pickupsResponse.success && pickupsResponse.data) {
          setActivePickups(pickupsResponse.data);
        }
      } catch (apiError) {
        // No mock pickups - just empty array
        setActivePickups([]);
      }
    } catch (error) {
      console.error('Error loading teacher data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTeacherData();
    setRefreshing(false);
  };

  const handleStopClassEarly = async () => {
    if (!selectedClass) {
      Alert.alert('Error', 'Please select a class');
      return;
    }

    if (!reason.trim()) {
      Alert.alert('Error', 'Please provide a reason for early dismissal');
      return;
    }

    Alert.alert(
      'Confirm Early Dismissal',
      `Are you sure you want to stop ${selectedClass.name} early and notify all parents?\n\nReason: ${reason}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Yes, Stop Class',
          style: 'destructive',
          onPress: initiateEmergencyPickup,
        },
      ]
    );
  };

  const initiateEmergencyPickup = async () => {
    try {
      setLoading(true);

      const response = await apiService.initiateEmergencyPickup(
        selectedClass!._id,
        user!.id,
        reason
      );

      if (response.success) {
        Alert.alert(
          'Success',
          `Emergency pickup initiated for ${selectedClass!.name}. All parents have been notified.`,
          [
            {
              text: 'OK',
              onPress: () => {
                setReason('');
                setSelectedClass(null);
                loadTeacherData();
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', response.message || 'Failed to initiate emergency pickup');
      }
    } catch (error) {
      console.error('Error initiating pickup:', error);
      Alert.alert('Error', 'Failed to initiate emergency pickup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getPickupStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#4CAF50';
      case 'primary_notified':
      case 'secondary_notified':
        return '#FF9800';
      case 'backup_notified':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  if (user?.role !== 'teacher') {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.errorText}>Access denied. Teacher role required.</Text>
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
          <Text style={styles.title}>Teacher Dashboard</Text>
          <Text style={styles.subtitle}>Welcome, {user.name}</Text>
        </View>

        {/* Stop Class Early Section */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🚨 Stop Class Early</Text>
          <Text style={styles.cardSubtitle}>
            Send emergency pickup notification to all parents
          </Text>

          {/* Class Selection */}
          <Text style={styles.label}>Select Class:</Text>
          {classes.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>📚 No classes found</Text>
              <Text style={styles.emptyStateSubtext}>
                {loading ? 'Loading...' : 'Please contact admin to assign classes'}
              </Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.classScroll}>
              {classes.map((cls) => (
                <TouchableOpacity
                  key={cls._id}
                  style={[
                    styles.classChip,
                    selectedClass?._id === cls._id && styles.classChipSelected,
                  ]}
                  onPress={() => setSelectedClass(cls)}
                >
                  <Text
                    style={[
                      styles.classChipText,
                      selectedClass?._id === cls._id && styles.classChipTextSelected,
                    ]}
                  >
                    {cls.name}
                  </Text>
                  <Text
                    style={[
                      styles.classChipSubtext,
                      selectedClass?._id === cls._id && styles.classChipSubtextSelected,
                    ]}
                  >
                    Grade {cls.grade}-{cls.section} ({cls.studentCount || 0} students)
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          {/* Reason Input */}
          <Text style={styles.label}>Reason for Early Dismissal:</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., Teacher emergency, weather conditions, etc."
            value={reason}
            onChangeText={setReason}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.button, (!selectedClass || !reason.trim() || loading) && styles.buttonDisabled]}
            onPress={handleStopClassEarly}
            disabled={!selectedClass || !reason.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Stop Class & Notify Parents</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Active Emergency Pickups */}
        {activePickups.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>📋 Active Emergency Pickups</Text>
            {activePickups.map((pickup) => (
              <View key={pickup._id} style={styles.pickupCard}>
                <View style={styles.pickupHeader}>
                  <Text style={styles.pickupClass}>
                    {(pickup as any).classId?.name || 'Unknown Class'}
                  </Text>
                  <View style={[styles.statusBadge, { backgroundColor: getPickupStatusColor(pickup.status) }]}>
                    <Text style={styles.statusText}>{pickup.status}</Text>
                  </View>
                </View>
                <Text style={styles.pickupReason}>Reason: {pickup.reason}</Text>
                <Text style={styles.pickupTime}>
                  Initiated: {new Date(pickup.newPickupTime).toLocaleTimeString()}
                </Text>

                {/* Student Status */}
                <View style={styles.studentList}>
                  <Text style={styles.studentListTitle}>Student Status:</Text>
                  {pickup.studentPickups.map((sp, index) => {
                    const student = (sp as any).studentId;
                    const confirmedBy = (sp as any).confirmedBy;
                    
                    return (
                      <View key={index} style={styles.studentItem}>
                        <View style={styles.studentInfo}>
                          <Text style={styles.studentName}>
                            {student?.name || 'Unknown Student'}
                          </Text>
                          <Text style={styles.studentStatus}>{sp.status}</Text>
                        </View>
                        {confirmedBy && (
                          <Text style={styles.confirmedText}>
                            ✓ {confirmedBy.name} ({sp.confirmedByRole})
                          </Text>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Info Section */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ How it works:</Text>
          <Text style={styles.infoText}>1. Select the class you want to dismiss early</Text>
          <Text style={styles.infoText}>2. Provide a clear reason for early dismissal</Text>
          <Text style={styles.infoText}>3. System will notify primary parents first</Text>
          <Text style={styles.infoText}>4. If no response, escalates to secondary parents</Text>
          <Text style={styles.infoText}>5. If still no response, notifies backup circle</Text>
          <Text style={styles.infoText}>6. You can track pickup status in real-time</Text>
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
  card: {
    backgroundColor: '#fff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  classScroll: {
    marginBottom: 16,
  },
  classChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 12,
    minWidth: 120,
  },
  classChipSelected: {
    backgroundColor: '#2196F3',
  },
  classChipText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  classChipTextSelected: {
    color: '#fff',
  },
  classChipSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  classChipSubtextSelected: {
    color: '#fff',
  },
  textInput: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#F44336',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pickupCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  pickupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  pickupClass: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  pickupReason: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  pickupTime: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  studentList: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 12,
  },
  studentListTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  studentItem: {
    marginBottom: 8,
  },
  studentInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  studentName: {
    fontSize: 14,
    color: '#333',
  },
  studentStatus: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  confirmedText: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 2,
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 32,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976D2',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#1565C0',
    marginBottom: 6,
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 50,
  },
  emptyState: {
    backgroundColor: '#f5f5f5',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
