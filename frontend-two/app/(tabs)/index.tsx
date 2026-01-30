import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    // Auto-redirect if user is already logged in
    if (user) {
      if (user.role === 'teacher') {
        router.replace('/teacher-dashboard' as any);
      } else if (user.role === 'parent') {
        router.replace('/parent-dashboard' as any);
      }
    }
  }, [user]);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.logo}>🏫</ThemedText>
        <ThemedText type="title" style={styles.title}>Smart Classroom</ThemedText>
        <ThemedText style={styles.subtitle}>Emergency Pickup System</ThemedText>
        
        <View style={styles.features}>
          <ThemedText style={styles.featureTitle}>Features:</ThemedText>
          <ThemedText style={styles.feature}>✓ Early class dismissal notifications</ThemedText>
          <ThemedText style={styles.feature}>✓ Cascading parent notification system</ThemedText>
          <ThemedText style={styles.feature}>✓ Backup circle for emergencies</ThemedText>
          <ThemedText style={styles.feature}>✓ Real-time pickup status tracking</ThemedText>
        </View>

        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => router.push('/login' as any)}
        >
          <ThemedText style={styles.loginButtonText}>Get Started</ThemedText>
        </TouchableOpacity>

        <View style={styles.quickAccess}>
          <ThemedText style={styles.quickAccessTitle}>Quick Access:</ThemedText>
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => router.push('/teacher-dashboard' as any)}
          >
            <ThemedText style={styles.linkText}>→ Teacher Dashboard</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => router.push('/parent-dashboard' as any)}
          >
            <ThemedText style={styles.linkText}>→ Parent Dashboard</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.linkButton}
            onPress={() => router.push('/backup-circle' as any)}
          >
            <ThemedText style={styles.linkText}>→ Backup Circle</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontSize: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 40,
    textAlign: 'center',
    opacity: 0.7,
  },
  features: {
    marginBottom: 40,
    width: '100%',
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  feature: {
    fontSize: 16,
    marginBottom: 8,
    paddingLeft: 8,
  },
  loginButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 32,
    minWidth: 200,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  quickAccess: {
    width: '100%',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  quickAccessTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 12,
    opacity: 0.7,
  },
  linkButton: {
    paddingVertical: 8,
  },
  linkText: {
    fontSize: 16,
    color: '#2196F3',
  },
});
