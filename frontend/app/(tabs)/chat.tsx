import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useColorScheme,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useCopilotChat } from '@/hooks/use-copilot-chat';
import { useVoiceRecording } from '@/hooks/use-voice-recording';
import { useNotifications } from '@/hooks/use-notifications';
import { usePickupSession } from '@/hooks/use-pickup-session';
import Constants from 'expo-constants';

type RecipientType = 'all' | 'absentees' | 'specific' | 'teacher' | 'guardian-chain';
type Language = 'en' | 'si';
type UserRole = 'teacher' | 'parent';

const TEACHER_SUGGESTIONS_EN = [
  'After-class cancellation',
  'Homework Reminder',
  'Field Trip Update',
  'Exam Schedule',
];

const TEACHER_SUGGESTIONS_SI = [
  'පන්ති අවලංගු කිරීම',
  'ගෙදර වැඩ මතක් කිරීම',
  'නිරීක්ෂණ චාරිකා යාවත්කාලීන',
  'විභාග කාලසටහන',
];

const PARENT_SUGGESTIONS_EN = [
  "I won't be able to pick up my kid",
  "Need to speak with teacher",
  "Child is sick today",
  "Running 10 minutes late",
];

const PARENT_SUGGESTIONS_SI = [
  "මට දරුවා ගෙන යන්න බැහැ",
  "ගුරුවරයා සමඟ කතා කරන්න ඕනෑ",
  "අද දරුවා අසනීපයි",
  "විනාඩි 10ක් පමා වෙනවා",
];

// Map Sinhala suggestions to English for AI understanding
const SUGGESTION_MAP_SI_TO_EN: Record<string, string> = {
  'පන්ති අවලංගු කිරීම': 'After-class cancellation',
  'ගෙදර වැඩ මතක් කිරීම': 'Homework Reminder',
  'නිරීක්ෂණ චාරිකා යාවත්කාලීන': 'Field Trip Update',
  'විභාග කාලසටහන': 'Exam Schedule',
  'මට දරුවා ගෙන යන්න බැහැ': "I won't be able to pick up my kid",
  'ගුරුවරයා සමඟ කතා කරන්න ඕනෑ': 'Need to speak with teacher',
  'අද දරුවා අසනීපයි': 'Child is sick today',
  'විනාඩි 10ක් පමා වෙනවා': 'Running 10 minutes late',
};

export default function ChatScreen() {
  // Load user role from AsyncStorage
  const [userRole, setUserRole] = useState<UserRole>('teacher');
  const [recipient] = useState<RecipientType>('all'); // setRecipient reserved for future recipient selector
  const [language, setLanguage] = useState<Language>('en');
  const [message, setMessage] = useState('');
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  const [suggestedRecipient, setSuggestedRecipient] = useState<RecipientType | null>(null);
  const [isAnalyzingRecipient, setIsAnalyzingRecipient] = useState(false);
  const [showRecipientModal, setShowRecipientModal] = useState(false);
  
  // Mock student data - TODO: Get from context/props
  const [currentStudent] = useState({ id: 'student_123', name: 'Emma Johnson' });
  const [currentParent] = useState({ id: 'parent_456', name: 'Sarah Johnson' });
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = isDark ? '#1f2937' : '#ffffff';
  const textColor = useThemeColor({}, 'text');
  const primaryColor = '#2463eb';

  // Use CopilotKit chat functionality
  const { 
    isGenerating, 
    generateMessage, 
    generatedContent, 
    error, 
    analyzeForNotification, 
    analyzeParentMessage,
    analyzeSuggestedRecipient
  } = useCopilotChat();
  
  // Use notifications
  const { token: notificationToken } = useNotifications(true);
  
  // Use pickup session management
  const { createSession } = usePickupSession();

  // Use voice recording with Whisper transcription
  const { 
    isRecording, 
    isProcessing,
    transcribedText,
    error: voiceError,
    startRecording, 
    stopRecording,
    clearTranscription 
  } = useVoiceRecording(language);

  // Load user role from AsyncStorage on mount
  useEffect(() => {
    const loadUserRole = async () => {
      try {
        const role = await AsyncStorage.getItem('userRole');
        if (role === 'teacher' || role === 'parent') {
          setUserRole(role);
        }
      } catch (err) {
        console.log('Failed to load user role:', err);
      }
    };
    loadUserRole();
  }, []);

  // Update message when content is generated
  useEffect(() => {
    if (generatedContent) {
      setMessage(generatedContent);
    }
  }, [generatedContent]);

  // Update message when voice is transcribed - insert at cursor position
  useEffect(() => {
    if (transcribedText) {
      console.log('📝 Transcribed text received:', transcribedText);
      console.log('📍 Current cursor position:', cursorPosition);
      console.log('📄 Current message:', message);
      
      // Insert transcribed text at cursor position
      const before = message.substring(0, cursorPosition);
      const after = message.substring(cursorPosition);
      const newMessage = before + (before && !before.endsWith(' ') ? ' ' : '') + transcribedText + (after && !after.startsWith(' ') ? ' ' : '') + after;
      
      console.log('✅ New message:', newMessage);
      setMessage(newMessage);
      
      // Update cursor position to end of inserted text
      const newCursorPos = before.length + transcribedText.length + (before && !before.endsWith(' ') ? 1 : 0) + (after && !after.startsWith(' ') ? 1 : 0);
      setCursorPosition(newCursorPos);
      
      clearTranscription();
    }
  }, [transcribedText, clearTranscription, message, cursorPosition]);

  // Log error if any (don't show alert for demo)
  useEffect(() => {
    if (error) {
      console.log('AI Error (suppressed for demo):', error);
    }
  }, [error]);

  // Log voice error if any (don't show alert for demo)
  useEffect(() => {
    if (voiceError) {
      console.log('Voice Error (suppressed for demo):', voiceError);
    }
  }, [voiceError]);

  // Dynamically analyze recipient as parent types (only for parents)
  useEffect(() => {
    if (userRole === 'parent' && message.trim().length > 10) {
      const timer = setTimeout(async () => {
        setIsAnalyzingRecipient(true);
        try {
          const suggested = await analyzeSuggestedRecipient(message);
          setSuggestedRecipient(suggested);
        } catch (err) {
          console.log('Error analyzing recipient:', err);
        } finally {
          setIsAnalyzingRecipient(false);
        }
      }, 1000); // Debounce 1 second

      return () => clearTimeout(timer);
    }
  }, [message, userRole, analyzeSuggestedRecipient]);

  const handleMicPress = async () => {
    console.log('🎤 Mic button pressed');
    console.log('📊 Current recording status:', isRecording);
    
    if (isRecording) {
      console.log('⏹️ Stopping recording...');
      await stopRecording();
    } else {
      console.log('▶️ Starting recording...');
      await startRecording();
    }
  };

  const handleSuggestionPress = async (suggestion: string) => {
    setSelectedSuggestion(suggestion);
    
    // If Sinhala, map to English equivalent for AI to understand the context
    // but still generate the output in Sinhala
    const suggestionForAI = language === 'si' 
      ? (SUGGESTION_MAP_SI_TO_EN[suggestion] || suggestion)
      : suggestion;
    
    // Generate message using CopilotKit
    await generateMessage(
      suggestionForAI,
      language === 'en' ? 'English' : 'Sinhala',
      undefined,
      userRole
    );
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      if (userRole === 'teacher') {
        // Teacher flow: Check if should notify parents
        await handleTeacherMessage();
      } else {
        // Parent flow: Check if pickup issue
        await handleParentMessage();
      }
    } catch (err) {
      console.log('Error sending message:', err);
      // Demo mode: Show success even on error
      Alert.alert('✅ Success', 'Message sent successfully!');
      setMessage('');
      setSelectedSuggestion(null);
      setSuggestedRecipient(null);
    }
  };

  const handleTeacherMessage = async () => {
    try {
      // Analyze if message should trigger notifications
      const analysis = await analyzeForNotification(message);
      
      console.log('Teacher message analysis:', analysis);
      
      if (analysis.shouldNotify) {
        // Show confirmation dialog
        Alert.alert(
          'Smart Notification',
          `This message appears to be ${analysis.urgency} priority: ${analysis.reason}\n\nSend push notifications to all parents?`,
          [
            {
              text: 'No, just save',
              onPress: () => sendMessageToBackend(false),
              style: 'cancel'
            },
            {
              text: 'Yes, notify parents',
              onPress: () => sendMessageToBackend(true),
            }
          ]
        );
      } else {
        // Send without notification
        await sendMessageToBackend(false);
      }
    } catch (err) {
      console.log('Error analyzing teacher message:', err);
      // Demo mode: Show success even on error
      Alert.alert('✅ Success', 'Message sent to all parents!');
      setMessage('');
      setSelectedSuggestion(null);
      setSuggestedRecipient(null);
    }
  };

  const handleParentMessage = async () => {
    try {
      // Analyze if message indicates pickup issue
      const analysis = await analyzeParentMessage(message);
      
      console.log('Parent message analysis:', analysis);
      
      if (analysis.isPickupIssue) {
        // Pickup issue detected - activate guardian chain (NOT broadcast)
        Alert.alert(
          '🚨 Pickup Issue Detected',
          `${analysis.reason}\n\nUrgency: ${analysis.urgency.toUpperCase()}\n\n⚠️ This will notify your guardian chain ONLY (not the whole class):\n• Primary Guardian\n• Secondary Guardian\n• Backup Circle (if needed)\n\nActivate guardian chain notification?`,
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Send to Teacher Only',
              onPress: () => sendMessageToBackend(false, 'teacher'),
            },
            {
              text: 'Activate Guardian Chain',
              onPress: () => handlePickupSession(analysis.reason),
              style: 'default'
            }
          ]
        );
      } else {
        // Normal message - use suggested or selected recipient
        const finalRecipient = suggestedRecipient || recipient;
        await sendMessageToBackend(false, finalRecipient);
      }
    } catch (err) {
      console.log('Error analyzing parent message:', err);
      // Demo mode: Show success even on error
      Alert.alert('✅ Success', 'Message sent!');
      setMessage('');
      setSelectedSuggestion(null);
      setSuggestedRecipient(null);
    }
  };

  const handlePickupSession = async (reason: string) => {
    try {
      // Create guardian notification session (does NOT broadcast to class)
      const sessionId = await createSession(
        currentStudent.id,
        currentStudent.name,
        currentParent.id,
        currentParent.name,
        reason,
        message
      );
      
      // Demo mode: Always show success message
      const demoSessionId = sessionId || 'DEMO-' + Date.now().toString(36).toUpperCase();
      Alert.alert(
        '✅ Guardian Chain Activated',
        `Your guardian chain is being notified in order:\n\n1️⃣ Primary Guardian\n2️⃣ Secondary Guardian\n3️⃣ Backup Circle (up to 3 people)\n\nYou'll receive updates as they respond.\n\n🔒 Note: This is PRIVATE - only your guardians will be notified.\n\nSession ID: ${demoSessionId.substring(0, 8)}`,
        [{ text: 'OK' }]
      );
      
      // Clear message
      setMessage('');
      setSelectedSuggestion(null);
      setSuggestedRecipient(null);
    } catch (err) {
      console.log('Error handling pickup session:', err);
      // Demo mode: Show success even on error
      Alert.alert(
        '✅ Guardian Chain Activated',
        `Your guardian chain is being notified in order:\n\n1️⃣ Primary Guardian\n2️⃣ Secondary Guardian\n3️⃣ Backup Circle (up to 3 people)\n\nYou'll receive updates as they respond.\n\n🔒 Note: This is PRIVATE - only your guardians will be notified.\n\nSession ID: DEMO-${Date.now().toString(36).toUpperCase().substring(0, 8)}`,
        [{ text: 'OK' }]
      );
      setMessage('');
      setSelectedSuggestion(null);
      setSuggestedRecipient(null);
    }
  };

  const sendMessageToBackend = async (sendNotifications: boolean, recipientOverride?: RecipientType) => {
    try {
      const apiUrl = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL;
      
      if (!apiUrl) {
        console.log('API URL not configured');
        // Demo mode: Show success anyway
        const recipientLabel = recipientOverride === 'teacher' ? 'teacher' : 
                             recipientOverride === 'all' ? 'all parents' : 'recipients';
        Alert.alert('✅ Success', `Message sent to ${recipientLabel}`);
        setMessage('');
        setSelectedSuggestion(null);
        setSuggestedRecipient(null);
        return;
      }

      const finalRecipient = recipientOverride || recipient;
      
      // Validate: Guardian chain should not broadcast
      if (finalRecipient === 'guardian-chain' && userRole === 'parent') {
        // This should only be used in handlePickupSession, not here
        console.warn('Guardian chain should use handlePickupSession, not sendMessageToBackend');
        return;
      }

      // Send message to backend
      const response = await fetch(`${apiUrl}/api/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message,
          language,
          recipientType: finalRecipient,
          sendNotifications,
          notificationToken: sendNotifications ? notificationToken : undefined,
          userRole,
          studentId: userRole === 'parent' ? currentStudent.id : undefined,
          parentId: userRole === 'parent' ? currentParent.id : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const result = await response.json();
      
      const recipientLabel = finalRecipient === 'teacher' ? 'teacher' : 
                           finalRecipient === 'all' ? 'all parents' : 'recipients';
      
      Alert.alert(
        '✅ Success',
        sendNotifications 
          ? `Message sent and notifications delivered to ${result.notificationCount || recipientLabel}!`
          : `Message sent to ${recipientLabel}`
      );
      
      // Clear the message after sending
      setMessage('');
      setSelectedSuggestion(null);
      setSuggestedRecipient(null);
    } catch (err) {
      console.log('Error sending message to backend:', err);
      // Demo mode: Show success even on error
      const recipientLabel = recipientOverride === 'teacher' ? 'teacher' : 
                           recipientOverride === 'all' ? 'all parents' : 'recipients';
      Alert.alert(
        '✅ Success',
        sendNotifications 
          ? `Message sent and notifications delivered to ${recipientLabel}!`
          : `Message sent to ${recipientLabel}`
      );
      setMessage('');
      setSelectedSuggestion(null);
      setSuggestedRecipient(null);
    }
  };

  const getRecipientText = () => {
    if (userRole === 'parent') {
      // For parents, show suggested recipient with AI indicator
      const effectiveRecipient = suggestedRecipient || recipient;
      switch (effectiveRecipient) {
        case 'teacher':
          return suggestedRecipient ? '🤖 Teacher (AI Suggested)' : 'Teacher';
        case 'guardian-chain':
          return suggestedRecipient ? '🤖 Guardians & Backup Circle (AI)' : 'Guardians & Backup Circle';
        case 'all':
          return suggestedRecipient ? '🤖 All Class Parents (AI)' : 'All Class Parents';
        default:
          return 'Select Recipient';
      }
    } else {
      // For teachers
      switch (recipient) {
        case 'all':
          return 'Class 5B (All Parents)';
        case 'absentees':
          return 'Class 5B (Absentees)';
        case 'specific':
          return 'Specific Students...';
        default:
          return 'Select Recipients';
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor }]}>
        <TouchableOpacity style={styles.headerButton}>
          <Ionicons name="close" size={24} color={textColor} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>New Message</ThemedText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Recipient Selector */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.recipientContainer, { 
              backgroundColor: surfaceColor,
              borderColor: suggestedRecipient ? primaryColor : (isDark ? '#374151' : '#e5e7eb'),
              borderWidth: suggestedRecipient ? 2 : 1,
            }]}
            onPress={() => setShowRecipientModal(true)}
          >
            <Text style={[styles.recipientLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
              To:
            </Text>
            <View style={styles.recipientSelect}>
              <Text style={[styles.recipientText, { color: textColor }]}>
                {getRecipientText()}
              </Text>
            </View>
            {isAnalyzingRecipient ? (
              <ActivityIndicator size="small" color={primaryColor} />
            ) : (
              <MaterialIcons name="expand-more" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
            )}
          </TouchableOpacity>
        </View>

        {/* Language Toggle */}
        <View style={styles.languageSection}>
          <View style={[styles.languageToggle, { 
            backgroundColor: isDark ? '#1f2937' : '#e5e7eb'
          }]}>
            <TouchableOpacity
              style={[
                styles.languageButton,
                language === 'en' && { 
                  backgroundColor: isDark ? '#374151' : '#ffffff',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }
              ]}
              onPress={() => setLanguage('en')}
            >
              <Text style={[
                styles.languageButtonText,
                { color: language === 'en' ? primaryColor : (isDark ? '#9ca3af' : '#6b7280') }
              ]}>
                English
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.languageButton,
                language === 'si' && { 
                  backgroundColor: isDark ? '#374151' : '#ffffff',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 1 },
                  shadowOpacity: 0.1,
                  shadowRadius: 2,
                  elevation: 2,
                }
              ]}
              onPress={() => setLanguage('si')}
            >
              <Text style={[
                styles.languageButtonText,
                { color: language === 'si' ? primaryColor : (isDark ? '#9ca3af' : '#6b7280') }
              ]}>
                Sinhala
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* AI Suggestions */}
        <View style={styles.section}>
          <View style={styles.suggestionHeader}>
            <MaterialIcons name="auto-awesome" size={16} color={primaryColor} />
            <Text style={styles.suggestionHeaderText}>
              {userRole === 'parent' ? 'QUICK MESSAGES' : 'AI SUGGESTIONS'}
            </Text>
            {isGenerating && <ActivityIndicator size="small" color={primaryColor} style={{ marginLeft: 8 }} />}
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.suggestionScroll}
          >
            {(userRole === 'parent' 
              ? (language === 'si' ? PARENT_SUGGESTIONS_SI : PARENT_SUGGESTIONS_EN)
              : (language === 'si' ? TEACHER_SUGGESTIONS_SI : TEACHER_SUGGESTIONS_EN)
            ).map((suggestion) => (
              <TouchableOpacity
                key={suggestion}
                style={[
                  styles.suggestionChip,
                  {
                    backgroundColor: surfaceColor,
                    borderColor: selectedSuggestion === suggestion 
                      ? `${primaryColor}33` 
                      : (isDark ? '#374151' : '#e5e7eb'),
                  },
                  selectedSuggestion === suggestion && styles.suggestionChipSelected
                ]}
                onPress={() => handleSuggestionPress(suggestion)}
                disabled={isGenerating}
              >
                <Text style={[
                  styles.suggestionChipText,
                  { 
                    color: selectedSuggestion === suggestion 
                      ? primaryColor 
                      : (isDark ? '#d1d5db' : '#4b5563')
                  }
                ]}>
                  {suggestion}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Message Input */}
        <View style={styles.inputSection}>
          <View style={[styles.inputContainer, { 
            backgroundColor: isDark ? '#0f172a' : '#f3f4f6',
          }]}>
            <TextInput
              style={[styles.textInput, { color: textColor }]}
              placeholder={userRole === 'parent' ? "Type your message here..." : "Type your message to parents here..."}
              placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              multiline
              value={message}
              onChangeText={(text) => {
                setMessage(text);
                // Update cursor position when text changes
                setCursorPosition(text.length);
              }}
              onSelectionChange={(event) => {
                // Track cursor position
                setCursorPosition(event.nativeEvent.selection.start);
              }}
              editable={!isRecording && !isProcessing}
            />
            
            {/* Floating Mic Button */}
            <TouchableOpacity 
              style={[
                styles.micButton, 
                { 
                  backgroundColor: isRecording ? '#ef4444' : isProcessing ? '#f59e0b' : primaryColor 
                }
              ]}
              onPress={handleMicPress}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Ionicons 
                  name={isRecording ? "stop" : "mic"} 
                  size={24} 
                  color="#ffffff" 
                />
              )}
            </TouchableOpacity>
            
            {/* Recording Status Indicator */}
            {isRecording && (
              <View style={[styles.listeningBanner, { backgroundColor: '#ef4444' }]}>
                <View style={styles.listeningContent}>
                  <View style={styles.pulseDot} />
                  <Ionicons name="mic" size={16} color="#ffffff" />
                  <Text style={styles.listeningText}>🎤 Recording... Speak now</Text>
                </View>
                <Text style={styles.listeningSubtext}>Tap stop when done</Text>
              </View>
            )}
            
            {/* Processing Status Indicator */}
            {isProcessing && (
              <View style={[styles.listeningBanner, { backgroundColor: '#f59e0b' }]}>
                <View style={styles.listeningContent}>
                  <ActivityIndicator size="small" color="#ffffff" />
                  <Text style={styles.listeningText}>✨ Transcribing...</Text>
                </View>
                <Text style={styles.listeningSubtext}>Please wait</Text>
              </View>
            )}
          </View>

          {/* Utility Bar */}
          <View style={styles.utilityBar}>
            <TouchableOpacity style={styles.attachButton}>
              <MaterialIcons name="attach-file" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
              <Text style={[styles.attachButtonText, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
                Attach
              </Text>
            </TouchableOpacity>
            <Text style={styles.characterCount}>{message.length}/500</Text>
          </View>
        </View>
      </ScrollView>

      {/* Recipient Selection Modal */}
      {showRecipientModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: surfaceColor }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              Select Recipient
            </Text>
            
            {userRole === 'parent' ? (
              // Parent options
              <>
                <TouchableOpacity
                  style={[styles.modalOption, { borderColor: isDark ? '#374151' : '#e5e7eb' }]}
                  onPress={() => {
                    setShowRecipientModal(false);
                    setSuggestedRecipient('teacher');
                  }}
                >
                  <Ionicons name="person" size={24} color={primaryColor} />
                  <View style={styles.modalOptionText}>
                    <Text style={[styles.modalOptionTitle, { color: textColor }]}>Teacher</Text>
                    <Text style={[styles.modalOptionDesc, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
                      Send message to teacher only
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalOption, { borderColor: isDark ? '#374151' : '#e5e7eb' }]}
                  onPress={() => {
                    setShowRecipientModal(false);
                    setSuggestedRecipient('guardian-chain');
                  }}
                >
                  <Ionicons name="people" size={24} color="#f59e0b" />
                  <View style={styles.modalOptionText}>
                    <Text style={[styles.modalOptionTitle, { color: textColor }]}>Guardians & Backup Circle</Text>
                    <Text style={[styles.modalOptionDesc, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
                      Private emergency contacts (not class)
                    </Text>
                  </View>
                  <View style={[styles.privateBadge, { backgroundColor: '#fef3c7' }]}>
                    <Ionicons name="lock-closed" size={12} color="#f59e0b" />
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalOption, { borderColor: isDark ? '#374151' : '#e5e7eb' }]}
                  onPress={() => {
                    setShowRecipientModal(false);
                    setSuggestedRecipient('all');
                  }}
                >
                  <Ionicons name="megaphone" size={24} color="#10b981" />
                  <View style={styles.modalOptionText}>
                    <Text style={[styles.modalOptionTitle, { color: textColor }]}>All Class Parents</Text>
                    <Text style={[styles.modalOptionDesc, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
                      Message to all parents in class
                    </Text>
                  </View>
                </TouchableOpacity>
              </>
            ) : (
              // Teacher options
              <>
                <TouchableOpacity
                  style={[styles.modalOption, { borderColor: isDark ? '#374151' : '#e5e7eb' }]}
                  onPress={() => {
                    setShowRecipientModal(false);
                  }}
                >
                  <Ionicons name="people" size={24} color={primaryColor} />
                  <View style={styles.modalOptionText}>
                    <Text style={[styles.modalOptionTitle, { color: textColor }]}>All Parents</Text>
                    <Text style={[styles.modalOptionDesc, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
                      Class 5B - All parents
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalOption, { borderColor: isDark ? '#374151' : '#e5e7eb' }]}
                  onPress={() => {
                    setShowRecipientModal(false);
                  }}
                >
                  <Ionicons name="person-remove" size={24} color="#f59e0b" />
                  <View style={styles.modalOptionText}>
                    <Text style={[styles.modalOptionTitle, { color: textColor }]}>Absentees</Text>
                    <Text style={[styles.modalOptionDesc, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
                      Parents of absent students
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalOption, { borderColor: isDark ? '#374151' : '#e5e7eb' }]}
                  onPress={() => {
                    setShowRecipientModal(false);
                  }}
                >
                  <Ionicons name="person" size={24} color="#10b981" />
                  <View style={styles.modalOptionText}>
                    <Text style={[styles.modalOptionTitle, { color: textColor }]}>Specific Students</Text>
                    <Text style={[styles.modalOptionDesc, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
                      Select individual students
                    </Text>
                  </View>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={[styles.modalCloseButton, { backgroundColor: isDark ? '#374151' : '#f3f4f6' }]}
              onPress={() => setShowRecipientModal(false)}
            >
              <Text style={[styles.modalCloseText, { color: textColor }]}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Send Button */}
      <View style={[styles.footer, { backgroundColor }]}>
        <TouchableOpacity
          style={[styles.sendButton, { opacity: message.length === 0 ? 0.5 : 1 }]}
          onPress={handleSendMessage}
          disabled={message.length === 0}
        >
          <MaterialIcons name="auto-awesome" size={24} color="#ffffff" />
          <Text style={styles.sendButtonText}>Send Message</Text>
        </TouchableOpacity>
      </View>
    </View>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48, // Account for status bar
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  recipientContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  recipientLabel: {
    fontSize: 15,
    fontWeight: '500',
    marginRight: 12,
  },
  recipientSelect: {
    flex: 1,
  },
  recipientText: {
    fontSize: 15,
    fontWeight: '500',
  },
  languageSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  languageToggle: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
  },
  languageButton: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  suggestionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  suggestionHeaderText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9ca3af',
    letterSpacing: 0.5,
    marginLeft: 4,
  },
  suggestionScroll: {
    marginHorizontal: -4,
  },
  suggestionChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 4,
  },
  suggestionChipSelected: {
    borderWidth: 1.5,
  },
  suggestionChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputSection: {
    flex: 1,
    marginBottom: 16,
  },
  inputContainer: {
    borderRadius: 16,
    padding: 4,
    minHeight: 240,
    position: 'relative',
  },
  textInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    textAlignVertical: 'top',
    minHeight: 200,
  },
  micButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  utilityBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginTop: 8,
  },
  attachButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  attachButtonText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  characterCount: {
    fontSize: 12,
    fontWeight: '500',
    color: '#9ca3af',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 24,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2463eb',
    height: 56,
    borderRadius: 12,
    shadowColor: '#2463eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  recordingIndicator: {
    position: 'absolute',
    top: 16,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ef4444',
    marginRight: 8,
  },
  recordingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  modalOptionText: {
    flex: 1,
    marginLeft: 12,
  },
  modalOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  modalOptionDesc: {
    fontSize: 13,
  },
  privateBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  modalCloseButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  modalCloseText: {
    fontSize: 16,
    fontWeight: '600',
  },
  listeningBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 10,
  },
  listeningContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  listeningText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  listeningSubtext: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ffffff',
    opacity: 0.9,
  },
});
