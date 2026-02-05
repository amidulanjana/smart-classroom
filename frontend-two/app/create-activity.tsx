import React, { useState, useEffect } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, Alert, TextInput, View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useThemeColor } from '@/hooks/use-theme-color';
import api from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

export default function CreateActivityScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [classId, setClassId] = useState<string | null>(null);

  useEffect(() => {
    fetchClass();
  }, [user]);

  const fetchClass = async () => {
    if (!user) return;
    try {
      const classesResp = await api.getTeacherClasses(user.id);
      if (classesResp.success && classesResp.data && classesResp.data.length > 0) {
        setClassId(classesResp.data[0]._id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }
    if (!classId) {
      Alert.alert('Error', 'No class found for teacher');
      return;
    }

    setLoading(true);
    try {
      const resp = await api.createActivity({
        title,
        description,
        type: 'other', // Changed from 'general' to match enum
        classId
      });

      if (resp.success && resp.data) {
        // Navigate to evaluation screen with new activity ID
        router.replace({ pathname: '/evaluation/[id]', params: { id: resp.data._id } });
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
        <ThemedText type="subtitle">New Evaluation</ThemedText>
        <View style={{ width: 40 }} /> 
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Title</ThemedText>
          <TextInput
            style={[styles.input, { color: textColor, borderColor: '#ddd' }]}
            placeholder="e.g. Weekly Hygiene Check"
            placeholderTextColor="#999"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Description (Optional)</ThemedText>
          <TextInput
            style={[styles.input, { color: textColor, borderColor: '#ddd', height: 100 }]}
            placeholder="Add details..."
            placeholderTextColor="#999"
            multiline
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />
        </View>

        <TouchableOpacity 
          style={[styles.createButton, loading && styles.disabledButton]} 
          onPress={handleCreate}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <ThemedText style={styles.buttonText}>Create & Add Students</ThemedText>}
        </TouchableOpacity>
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
  backButton: { padding: 8 },
  content: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  label: { marginBottom: 8, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff', // Or themed
  },
  createButton: {
    backgroundColor: '#0a7ea4',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  disabledButton: { opacity: 0.7 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});
