import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import api, { Student } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export default function EvaluationScreen() {
  const router = useRouter();
  const { user } = useAuth(); // Assuming useAuth gives us the teacher's info
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');

  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<Student[]>([]);
  const [title, setTitle] = useState(''); // Activity Title
  const [description, setDescription] = useState('');
  const [results, setResults] = useState<{ [key: string]: 'good' | 'bad' | 'neutral' }>({});

  const [classId, setClassId] = useState<string | null>(null);

  // Computed summary
  const goodCount = Object.values(results).filter(s => s === 'good').length;
  const badCount = Object.values(results).filter(s => s === 'bad').length;
  const neutralCount = Object.values(results).filter(s => s === 'neutral').length;

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    if (!user) return;
    setLoading(true);
    try {
       const classesResp = await api.getTeacherClasses(user.id);
       if (classesResp.success && classesResp.data && classesResp.data.length > 0) {
          const firstClass = classesResp.data[0];
          setClassId(firstClass._id);
          const studentsResp = await api.getStudentsByClass(firstClass._id);
          if (studentsResp.success && studentsResp.data) {
             setStudents(studentsResp.data);
             // Initialize results
             const initialResults: any = {};
             studentsResp.data.forEach(s => initialResults[s._id] = 'neutral');
             setResults(initialResults);
          }
       } else {
         Alert.alert('Error', 'No classes found for this teacher');
       }
    } catch (e) {
      console.log(e);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const setStatus = (studentId: string, status: 'good' | 'bad' | 'neutral') => {
    setResults(prev => ({
      ...prev,
      [studentId]: prev[studentId] === status ? 'neutral' : status
    }));
  };

  const markAll = (status: 'good' | 'bad' | 'neutral') => {
    const newResults: any = { ...results };
    students.forEach(s => {
      newResults[s._id] = status;
    });
    setResults(newResults);
  };

  const saveEvaluation = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter an activity title');
      return;
    }
    if (!classId) return;

    setLoading(true);
    try {
      // 1. Create Activity
      const activityResp = await api.createActivity({
        title,
        description,
        type: 'participation', // Default for this demo
        classId
      });

      if (activityResp.success && activityResp.data) {
        const activityId = activityResp.data._id;
        
        // 2. Save Results
        const resultsParams = Object.keys(results).map(studentId => ({
          studentId,
          status: results[studentId]
        }));

        const saveResp = await api.saveActivityResults(activityId, resultsParams);
        if (saveResp.success) {
          Alert.alert('Success', 'Evaluation saved successfully!', [
            { text: 'OK', onPress: () => router.back() }
          ]);
        } else {
           Alert.alert('Error', 'Failed to save results');
        }
      } else {
         Alert.alert('Error', 'Failed to create activity');
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <ThemedText type="subtitle">Student Evaluation</ThemedText>
        <TouchableOpacity onPress={saveEvaluation} style={styles.saveButton}>
          <ThemedText style={styles.saveButtonText}>Save</ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.inputContainer}>
          <ThemedText style={styles.dateLabel}>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</ThemedText>
        </View>

        <View style={styles.statsContainer}>
          <View style={[styles.statItem, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="thumbs-up" size={16} color="#34C759" />
            <ThemedText style={[styles.statText, { color: '#34C759' }]}>{goodCount}</ThemedText>
          </View>
          <View style={[styles.statItem, { backgroundColor: '#FFEBEE' }]}>
             <Ionicons name="thumbs-down" size={16} color="#FF3B30" />
            <ThemedText style={[styles.statText, { color: '#FF3B30' }]}>{badCount}</ThemedText>
          </View>
           <View style={[styles.statItem, { backgroundColor: '#F5F5F5' }]}>
             <Ionicons name="remove-circle-outline" size={16} color="#888" />
            <ThemedText style={[styles.statText, { color: '#888' }]}>{neutralCount}</ThemedText>
          </View>
        </View>

        <View style={styles.listHeader}>
          <ThemedText style={styles.sectionTitle}>Students ({students.length})</ThemedText>
          <TouchableOpacity onPress={() => markAll('good')}>
            <ThemedText style={styles.markAllText}>Mark all Good</ThemedText>
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <ActivityIndicator size="large" color={Colors.light.tint} />
        ) : (
          students.map(student => (
            <View key={student._id} style={styles.studentRow}>
              <View style={styles.studentInfo}>
                <ThemedText type="defaultSemiBold">{student.name}</ThemedText>
                <ThemedText style={styles.gradeText}>{student.grade}</ThemedText>
              </View>
              
              <View style={styles.actions}>
                <TouchableOpacity 
                  onPress={() => setStatus(student._id, 'good')}
                  style={[
                    styles.actionButton, 
                    results[student._id] === 'good' && styles.goodActive
                  ]}
                >
                  <Ionicons 
                    name="thumbs-up" 
                    size={20} 
                    color={results[student._id] === 'good' ? '#fff' : '#ccc'} 
                  />
                </TouchableOpacity>

                <TouchableOpacity 
                   onPress={() => setStatus(student._id, 'bad')}
                   style={[
                    styles.actionButton, 
                    results[student._id] === 'bad' && styles.badActive
                  ]}
                >
                  <Ionicons 
                    name="thumbs-down" 
                    size={20} 
                    color={results[student._id] === 'bad' ? '#fff' : '#ccc'} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 100 }} /> 
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  saveButton: {
    padding: 8,
    backgroundColor: '#0a7ea4',
    borderRadius: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    marginBottom: 8,
    opacity: 0.7,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
  },
  dateLabel: {
    marginTop: 8,
    fontSize: 12,
    opacity: 0.5,
    textAlign: 'right',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  statText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  markAllText: {
    color: '#0a7ea4',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  studentInfo: {
    flex: 1,
  },
  gradeText: {
    fontSize: 12,
    opacity: 0.5,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  goodActive: {
    backgroundColor: '#34C759', // Green
  },
  badActive: {
    backgroundColor: '#FF3B30', // Red
  }
});
