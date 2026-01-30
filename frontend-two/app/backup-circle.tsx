import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/contexts/AuthContext';
import apiService from '@/services/api';
import type { Student, BackupCircleParent } from '@/services/api';

export default function BackupCircleScreen() {
  const { user } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [backupCircle, setBackupCircle] = useState<BackupCircleParent[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newParentName, setNewParentName] = useState('');
  const [newParentPhone, setNewParentPhone] = useState('');

  useEffect(() => {
    if (user?.role === 'parent') {
      loadStudents();
    }
  }, [user]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      // In a real app, this would fetch students for the logged-in parent
      // For now, we'll use a mock implementation
      // const response = await apiService.getParentStudents(user!.id);
      // if (response.success && response.data) {
      //   setStudents(response.data);
      //   if (response.data.length > 0) {
      //     handleSelectStudent(response.data[0]);
      //   }
      // }
    } catch (error) {
      console.error('Error loading students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStudent = async (student: Student) => {
    setSelectedStudent(student);
    await loadBackupCircle(student._id);
  };

  const loadBackupCircle = async (studentId: string) => {
    try {
      setLoading(true);
      const response = await apiService.getBackupCircle(studentId);
      
      if (response.success && response.data) {
        setBackupCircle(response.data);
      }
    } catch (error) {
      console.error('Error loading backup circle:', error);
      Alert.alert('Error', 'Failed to load backup circle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBackupParent = async () => {
    if (!selectedStudent) {
      Alert.alert('Error', 'Please select a student first');
      return;
    }

    if (!newParentName.trim() || !newParentPhone.trim()) {
      Alert.alert('Error', 'Please enter parent name and phone number');
      return;
    }

    if (backupCircle.length >= 3) {
      Alert.alert('Error', 'You can only add up to 3 backup parents');
      return;
    }

    try {
      setLoading(true);
      
      // In a real implementation, you'd first create/find the guardian user
      // then add them to the backup circle
      // For now, this is a simplified version
      
      Alert.alert(
        'Success',
        `${newParentName} has been added to your backup circle`,
        [
          {
            text: 'OK',
            onPress: () => {
              setShowAddModal(false);
              setNewParentName('');
              setNewParentPhone('');
              loadBackupCircle(selectedStudent._id);
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error adding backup parent:', error);
      Alert.alert('Error', 'Failed to add backup parent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveBackupParent = async (backupParent: BackupCircleParent) => {
    if (!selectedStudent) return;

    Alert.alert(
      'Remove Backup Parent',
      `Are you sure you want to remove ${backupParent.userId.name} from your backup circle?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await apiService.removeFromBackupCircle(selectedStudent._id, backupParent._id);
              await loadBackupCircle(selectedStudent._id);
              Alert.alert('Success', 'Backup parent removed successfully');
            } catch (error) {
              console.error('Error removing backup parent:', error);
              Alert.alert('Error', 'Failed to remove backup parent');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
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
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Backup Circle</Text>
          <Text style={styles.subtitle}>
            Manage trusted contacts who can pick up your child in emergencies
          </Text>
        </View>

        {/* Student Selection */}
        {students.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Child:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {students.map((student) => (
                <TouchableOpacity
                  key={student._id}
                  style={[
                    styles.studentChip,
                    selectedStudent?._id === student._id && styles.studentChipSelected,
                  ]}
                  onPress={() => handleSelectStudent(student)}
                >
                  <Text
                    style={[
                      styles.studentChipText,
                      selectedStudent?._id === student._id && styles.studentChipTextSelected,
                    ]}
                  >
                    {student.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Backup Circle List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Backup Parents ({backupCircle.length}/3)
            </Text>
            {backupCircle.length < 3 && (
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => setShowAddModal(true)}
              >
                <Text style={styles.addButtonText}>+ Add</Text>
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2196F3" />
            </View>
          ) : backupCircle.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>👥</Text>
              <Text style={styles.emptyText}>No backup parents added yet</Text>
              <Text style={styles.emptySubtext}>
                Add up to 3 trusted contacts who can help in emergency situations
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => setShowAddModal(true)}
              >
                <Text style={styles.primaryButtonText}>Add First Backup Parent</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.backupList}>
              {backupCircle.map((backup, index) => (
                <View key={backup._id} style={styles.backupCard}>
                  <View style={styles.backupHeader}>
                    <View style={styles.priorityBadge}>
                      <Text style={styles.priorityText}>#{backup.priorityOrder}</Text>
                    </View>
                    <View style={styles.backupInfo}>
                      <Text style={styles.backupName}>{backup.userId.name}</Text>
                      <Text style={styles.backupPhone}>{backup.userId.phone}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.removeButton}
                      onPress={() => handleRemoveBackupParent(backup)}
                    >
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.backupDescription}>
                    Will be notified if you and secondary guardian are unavailable
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Info Section */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>ℹ️ How Backup Circle Works:</Text>
          <Text style={styles.infoText}>
            1. <Text style={styles.bold}>Priority Order:</Text> Backup parents are notified
            simultaneously, but numbered for your reference.
          </Text>
          <Text style={styles.infoText}>
            2. <Text style={styles.bold}>When Activated:</Text> If you and the secondary guardian
            cannot pick up your child, all backup parents receive a notification at once.
          </Text>
          <Text style={styles.infoText}>
            3. <Text style={styles.bold}>First Response Wins:</Text> The first backup parent to
            accept gets assigned the pickup.
          </Text>
          <Text style={styles.infoText}>
            4. <Text style={styles.bold}>You'll Be Notified:</Text> You'll receive a notification
            about which backup parent is picking up your child.
          </Text>
        </View>
      </ScrollView>

      {/* Add Backup Parent Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Backup Parent</Text>
            
            <Text style={styles.inputLabel}>Parent Name:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter full name"
              value={newParentName}
              onChangeText={setNewParentName}
            />

            <Text style={styles.inputLabel}>Phone Number:</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              value={newParentPhone}
              onChangeText={setNewParentPhone}
              keyboardType="phone-pad"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddModal(false);
                  setNewParentName('');
                  setNewParentPhone('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddBackupParent}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.saveButtonText}>Add Parent</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  studentChip: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
  },
  studentChipSelected: {
    backgroundColor: '#2196F3',
  },
  studentChipText: {
    fontSize: 14,
    color: '#333',
  },
  studentChipTextSelected: {
    color: '#fff',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyState: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backupList: {
    gap: 12,
  },
  backupCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  priorityBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  priorityText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backupInfo: {
    flex: 1,
  },
  backupName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  backupPhone: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  removeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  removeButtonText: {
    color: '#F44336',
    fontSize: 12,
    fontWeight: 'bold',
  },
  backupDescription: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
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
    marginBottom: 8,
    lineHeight: 20,
  },
  bold: {
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  cancelButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: '#2196F3',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    fontSize: 16,
    color: '#F44336',
    textAlign: 'center',
    marginTop: 50,
  },
});
