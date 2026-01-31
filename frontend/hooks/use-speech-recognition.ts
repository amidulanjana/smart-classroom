import { useState, useCallback } from 'react';
import { Alert } from 'react-native';

// NOTE: expo-speech-recognition requires a development build
// It's not available in Expo Go
// To use: run `npx expo prebuild` then build with EAS or locally

type RecognitionStatus = 'idle' | 'listening' | 'processing' | 'error';

interface UseSpeechRecognitionResult {
  status: RecognitionStatus;
  isListening: boolean;
  error: string | null;
  transcript: string;
  interimTranscript: string;
  startListening: () => Promise<void>;
  stopListening: () => void;
  clearTranscript: () => void;
}

export function useSpeechRecognition(language: 'en' | 'si'): UseSpeechRecognitionResult {
  const [status, setStatus] = useState<RecognitionStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const startListening = useCallback(async () => {
    Alert.alert(
      'Feature Unavailable',
      'Real-time speech recognition requires a development build and is not available in Expo Go. To enable this feature:\n\n1. Run: npx expo prebuild\n2. Build with EAS or run locally\n\nFor now, you can type messages manually.',
      [{ text: 'OK' }]
    );
    setError('Speech recognition requires development build');
    setStatus('error');
  }, []);

  const stopListening = useCallback(() => {
    setStatus('idle');
  }, []);

  const clearTranscript = useCallback(() => {
    // No-op for now
  }, []);

  return {
    status,
    isListening: status === 'listening',
    error,
    transcript: '',
    interimTranscript: '',
    startListening,
    stopListening,
    clearTranscript,
  };
}
