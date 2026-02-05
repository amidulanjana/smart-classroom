import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login, setUser } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      
      // Navigate based on role after successful login
      // The user role is now available in auth context
      router.replace('/(tabs)' as any);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role: 'teacher' | 'parent') => {
    try {
      setLoading(true);
      const email = role === 'teacher' ? 'teacher@school.com' : 'parent@school.com';
      const password = 'password123';
      
      await login(email, password);
      
      // Navigate is handled by the user state change or we can do it here
      router.replace('/(tabs)' as any);
    } catch (error: any) {
      Alert.alert('Quick Login Failed', error.message || 'Could not login with test credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.logo}>🏫</Text>
          <Text style={styles.title}>Smart Classroom</Text>
          <Text style={styles.subtitle}>Emergency Pickup System</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            editable={!loading}
          />

          <Text style={styles.label}>Password:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>Quick Login (Demo)</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.quickLogin}>
          <TouchableOpacity
            style={[styles.quickButton, styles.teacherButton]}
            onPress={() => handleQuickLogin('teacher')}
            disabled={loading}
          >
            <Text style={styles.quickButtonEmoji}>👨‍🏫</Text>
            <Text style={styles.quickButtonText}>Login as Teacher</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.quickButton, styles.parentButton]}
            onPress={() => handleQuickLogin('parent')}
            disabled={loading}
          >
            <Text style={styles.quickButtonEmoji}>👨‍👩‍👧</Text>
            <Text style={styles.quickButtonText}>Login as Parent</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.infoText}>
          Use quick login buttons above to test the app with different roles
        </Text>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
    color: '#999',
  },
  quickLogin: {
    gap: 12,
  },
  quickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 12,
  },
  teacherButton: {
    backgroundColor: '#4CAF50',
  },
  parentButton: {
    backgroundColor: '#FF9800',
  },
  quickButtonEmoji: {
    fontSize: 24,
  },
  quickButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  infoText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    marginTop: 20,
  },
});
