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
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { useCopilotChat } from '@/hooks/use-copilot-chat';
import { useVoiceRecording } from '@/hooks/use-voice-recording';

type RecipientType = 'all' | 'absentees' | 'specific';
type Language = 'en' | 'si';

const AI_SUGGESTIONS = [
  'After-class cancellation',
  'Homework Reminder',
  'Field Trip Update',
  'Exam Schedule',
];

export default function ChatScreen() {
  const [recipient, setRecipient] = useState<RecipientType>('all'); // TODO: Add recipient selector functionality
  const [language, setLanguage] = useState<Language>('en');
  const [message, setMessage] = useState('');
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);
  
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = isDark ? '#1f2937' : '#ffffff';
  const textColor = useThemeColor({}, 'text');
  const primaryColor = '#2463eb';

  // Use CopilotKit chat functionality
  const { isGenerating, generateMessage, generatedContent, error } = useCopilotChat();

  // Use voice recording with auto-translation
  const { 
    isRecording, 
    isProcessing, 
    transcribedText, 
    error: voiceError,
    startRecording, 
    stopRecording,
    clearTranscription 
  } = useVoiceRecording(language);

  // Update message when content is generated
  useEffect(() => {
    if (generatedContent) {
      setMessage(generatedContent);
    }
  }, [generatedContent]);

  // Update message when voice is transcribed
  useEffect(() => {
    if (transcribedText) {
      setMessage(transcribedText);
      clearTranscription();
    }
  }, [transcribedText, clearTranscription]);

  // Show error if any
  useEffect(() => {
    if (error) {
      console.error('AI Error:', error);
      Alert.alert('Error', error);
    }
  }, [error]);

  // Show voice error if any
  useEffect(() => {
    if (voiceError) {
      console.error('Voice Error:', voiceError);
      Alert.alert('Voice Recording Error', voiceError);
    }
  }, [voiceError]);

  const handleMicPress = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const handleSuggestionPress = async (suggestion: string) => {
    setSelectedSuggestion(suggestion);
    // Generate message using CopilotKit
    await generateMessage(
      suggestion,
      language === 'en' ? 'English' : 'Sinhala'
    );
  };

  const handleSendMessage = () => {
    // Send the message (integrate with your backend/notification system)
    console.log('Sending message:', { recipient, language, message });
    // Clear the message after sending
    setMessage('');
    setSelectedSuggestion(null);
  };

  const getRecipientText = () => {
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
          <View style={[styles.recipientContainer, { 
            backgroundColor: surfaceColor,
            borderColor: isDark ? '#374151' : '#e5e7eb'
          }]}>
            <Text style={[styles.recipientLabel, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
              To:
            </Text>
            <TouchableOpacity style={styles.recipientSelect}>
              <Text style={[styles.recipientText, { color: textColor }]}>
                {getRecipientText()}
              </Text>
            </TouchableOpacity>
            <MaterialIcons name="expand-more" size={24} color={isDark ? '#9ca3af' : '#6b7280'} />
          </View>
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
            <Text style={styles.suggestionHeaderText}>AI SUGGESTIONS</Text>
            {isGenerating && <ActivityIndicator size="small" color={primaryColor} style={{ marginLeft: 8 }} />}
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.suggestionScroll}
          >
            {AI_SUGGESTIONS.map((suggestion) => (
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
              placeholder="Type your message to parents here..."
              placeholderTextColor={isDark ? '#6b7280' : '#9ca3af'}
              multiline
              value={message}
              onChangeText={setMessage}
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
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <Text style={styles.recordingText}>Recording...</Text>
              </View>
            )}
            
            {/* Processing Status Indicator */}
            {isProcessing && (
              <View style={styles.recordingIndicator}>
                <ActivityIndicator size="small" color={primaryColor} />
                <Text style={styles.recordingText}>Processing audio...</Text>
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
});
