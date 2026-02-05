import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, Alert, View, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import api, { Student } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export default function ActivityEvaluationScreen() {
  const { id } = useLocalSearchParams(); // Activity ID
  const router = useRouter();
  const { user } = useAuth();
  const textColor = useThemeColor({}, 'text');

  const [activity, setActivity] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<Student[]>([]); // All class students
  const [participants, setParticipants] = useState<any[]>([]); // Students added to activity (ActivityLogs)
  const [evaluations, setEvaluations] = useState<{ [key: string]: 'good' | 'bad' | 'neutral' }>({});
  
  // Selection mode for adding students
  const [isAddingStudents, setIsAddingStudents] = useState(false);
  const [selectedForAdd, setSelectedForAdd] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Get Activity Details
      const actResp = await api.getActivity(id as string);
      if (actResp.success) {
        setActivity(actResp.data);
        
        // 2. Get Activity Results (Participants)
        const resultsResp = await api.getActivityResults(id as string);
        if (resultsResp.success && resultsResp.data) {
          setParticipants(resultsResp.data);
          // Load existing evaluations
          const initials: any = {};
          resultsResp.data.forEach((p: any) => {
             initials[p.studentId._id] = p.status;
          });
          setEvaluations(initials);
        }

        // 3. Get All Class Students (for adding)
        if (actResp.data.classId) {
           const classResp = await api.getStudentsByClass(actResp.data.classId);
           if (classResp.success) setStudents(classResp.data);
        }
      } else {
        Alert.alert('Error', 'Activity not found');
        router.back();
      }
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // --- Adding Students Logic ---

  const toggleStudentSelection = (studentId: string) => {
    if (selectedForAdd.includes(studentId)) {
      setSelectedForAdd(prev => prev.filter(id => id !== studentId));
    } else {
      setSelectedForAdd(prev => [...prev, studentId]);
    }
  };

  const handleAddStudents = async () => {
    if (selectedForAdd.length === 0) {
      setIsAddingStudents(false);
      return;
    }
    setLoading(true);
    try {
      const resp = await api.addStudentsToActivity(id as string, selectedForAdd);
      if (resp.success) {
        setIsAddingStudents(false);
        setSelectedForAdd([]);
        loadData(); // Reload to see new participants
      } else {
        Alert.alert('Error', 'Failed to add students');
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to add students');
    } finally {
      setLoading(false);
    }
  };

  const selectAllClass = () => {
    // Select all students not already participating
    const currentParticipantIds = participants.map(p => p.studentId._id);
    const available = students.filter(s => !currentParticipantIds.includes(s._id));
    setSelectedForAdd(available.map(s => s._id));
  };

  // --- Evaluation Logic ---

  const setStatus = (studentId: string, status: 'good' | 'bad' | 'neutral') => {
    setEvaluations(prev => ({
      ...prev,
      [studentId]: prev[studentId] === status ? 'neutral' : status
    }));
  };

  const saveEvaluations = async () => {
    setLoading(true);
    try {
      const resultsToSave = Object.keys(evaluations).map(sid => ({
        studentId: sid,
        status: evaluations[sid]
      }));
      
      const resp = await api.saveActivityResults(id as string, resultsToSave);
      if (resp.success) {
        Alert.alert('Success', 'Evaluations saved');
      } else {
        Alert.alert('Error', 'Failed to save');
      }
    } catch (e) {
       Alert.alert('Error', 'Failed to save');
    } finally {
      setLoading(false);
    }
  };

  // --- Render ---

  if (loading && !activity) {
    return <ThemedView style={{flex:1, justifyContent:'center'}}><ActivityIndicator /></ThemedView>;
  }

  // "Add Students" View
  if (isAddingStudents) {
    const currentParticipantIds = participants.map(p => p.studentId._id);
    const availableStudents = students.filter(s => !currentParticipantIds.includes(s._id));
    
    return (
      <ThemedView style={styles.container}>
         <View style={styles.header}>
            <TouchableOpacity onPress={() => setIsAddingStudents(false)} style={styles.backButton}>
              <Ionicons name="close" size={24} color={textColor} />
            </TouchableOpacity>
            <ThemedText type="subtitle">Add Students</ThemedText>
            <TouchableOpacity onPress={handleAddStudents}>
              <ThemedText type="defaultSemiBold" style={{color: '#0a7ea4'}}>Done</ThemedText>
            </TouchableOpacity>
        </View>
        <View style={styles.subHeader}>
           <TouchableOpacity onPress={selectAllClass}>
             <ThemedText style={{color: '#0a7ea4'}}>Select All Remaining</ThemedText>
           </TouchableOpacity>
        </View>
        <ScrollView style={styles.content}>
           {availableStudents.length === 0 ? (
             <ThemedText style={{textAlign:'center', marginTop: 20, opacity:0.5}}>No more students to add.</ThemedText>
           ) : (
             availableStudents.map(s => (
               <TouchableOpacity 
                  key={s._id} 
                  style={[styles.studentRow, selectedForAdd.includes(s._id) && styles.selectedRow]}
                  onPress={() => toggleStudentSelection(s._id)}
               >
                  <ThemedText>{s.name}</ThemedText>
                  {selectedForAdd.includes(s._id) && <Ionicons name="checkmark-circle" size={20} color="#0a7ea4" />}
               </TouchableOpacity>
             ))
           )}
        </ScrollView>
      </ThemedView>
    );
  }

  // "Evaluation" View
  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <View>
          <ThemedText type="subtitle" style={{fontSize: 16}}>{activity?.title}</ThemedText>
          <ThemedText style={{fontSize: 12, opacity: 0.5}}>
             {participants.length} Students
          </ThemedText>
        </View>
        <TouchableOpacity onPress={saveEvaluations} style={styles.saveButton}>
          <ThemedText style={styles.saveButtonText}>Save</ThemedText>
        </TouchableOpacity>
      </View>

      <View style={styles.actionHeader}>
         <TouchableOpacity style={styles.addStudentButton} onPress={() => setIsAddingStudents(true)}>
             <Ionicons name="person-add" size={16} color="white" />
             <ThemedText style={{color:'white', fontWeight:'600'}}>Add Students</ThemedText>
         </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {participants.length === 0 ? (
          <View style={styles.emptyState}>
            <ThemedText style={{marginBottom: 10}}>No students added to this evaluation yet.</ThemedText>
            <TouchableOpacity onPress={() => setIsAddingStudents(true)}>
              <ThemedText style={{color: '#0a7ea4'}}>+ Add Students</ThemedText>
            </TouchableOpacity>
          </View>
        ) : (
          participants.map((p: any) => {
            // p is ActivityLog (populated studentId)
            const student = p.studentId; 
            const status = evaluations[student._id] || 'neutral';
            
            return (
              <View key={p._id} style={styles.evalRow}>
                <View style={{flex: 1}}>
                  <ThemedText type="defaultSemiBold">{student.name}</ThemedText>
                  <ThemedText style={{fontSize: 12, opacity: 0.5}}>{student.grade}-{student.section}</ThemedText>
                </View>
                
                <View style={styles.actions}>
                  <TouchableOpacity 
                    onPress={() => setStatus(student._id, 'good')}
                    style={[styles.actionBtn, status === 'good' && styles.goodActive]}
                  >
                    <Ionicons name="thumbs-up" size={18} color={status === 'good' ? '#fff' : '#ccc'} />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={() => setStatus(student._id, 'bad')}
                    style={[styles.actionBtn, status === 'bad' && styles.badActive]}
                  >
                     <Ionicons name="thumbs-down" size={18} color={status === 'bad' ? '#fff' : '#ccc'} />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
        <View style={{height: 100}} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  subHeader: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    alignItems: 'flex-end',
  },
  backButton: { padding: 8 },
  saveButton: { padding: 8, backgroundColor: '#0a7ea4', borderRadius: 8 },
  saveButtonText: { color: 'white', fontWeight: 'bold' },
  content: { flex: 1, padding: 16 },
  
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    paddingBottom: 0,
  },
  addStudentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 6,
  },
  
  emptyState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.7,
  },
  
  // Lists
  studentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'center',
  },
  selectedRow: {
    backgroundColor: '#effbfe',
  },
  
  // Evaluation Row
  evalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actions: { flexDirection: 'row', gap: 12 },
  actionBtn: { padding: 10, borderRadius: 20, backgroundColor: '#f5f5f5' },
  goodActive: { backgroundColor: '#34C759' },
  badActive: { backgroundColor: '#FF3B30' },
});
