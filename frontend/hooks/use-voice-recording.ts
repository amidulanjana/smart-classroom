import { useState, useCallback } from 'react';
import { useAudioRecorder, AudioModule } from 'expo-audio';
import { AudioQuality, IOSOutputFormat } from 'expo-audio/build/RecordingConstants';
import { useAIContext } from '@/components/copilot-provider';
import * as FileSystem from 'expo-file-system';

type RecordingStatus = 'idle' | 'recording' | 'processing' | 'error';

interface UseVoiceRecordingResult {
  status: RecordingStatus;
  isRecording: boolean;
  isProcessing: boolean;
  error: string | null;
  transcribedText: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  clearTranscription: () => void;
}

export function useVoiceRecording(targetLanguage: 'en' | 'si'): UseVoiceRecordingResult {
  const { apiKey } = useAIContext();
  const audioRecorder = useAudioRecorder({
    extension: '.m4a',
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
    ios: {
      audioQuality: AudioQuality.HIGH,
      outputFormat: IOSOutputFormat.MPEG4AAC,
    },
    android: {
      outputFormat: 'mpeg4',
      audioEncoder: 'aac',
    },
    web: {
      mimeType: 'audio/webm',
      bitsPerSecond: 128000,
    },
  });
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [transcribedText, setTranscribedText] = useState<string | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setTranscribedText(null);

      // Request permissions
      const permission = await AudioModule.requestRecordingPermissionsAsync();
      if (!permission.granted) {
        throw new Error('Permission to access microphone is required');
      }

      // Start recording
      await audioRecorder.record();
      setStatus('recording');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      setError(errorMessage);
      setStatus('error');
      console.error('Error starting recording:', err);
    }
  }, [audioRecorder]);

  const transcribeAudio = useCallback(async (uri: string): Promise<string> => {
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Read the audio file
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      throw new Error('Audio file not found');
    }

    // Create form data
    const formData = new FormData();
    
    // For React Native, we need to create a blob-like object
    const audioFile = {
      uri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    } as any;

    formData.append('file', audioFile);
    formData.append('model', 'whisper-1');
    formData.append('language', targetLanguage === 'si' ? 'si' : 'en');

    // Call OpenAI Whisper API
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Transcription failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.text || '';
  }, [apiKey, targetLanguage]);

  const translateText = useCallback(async (text: string, detectedLanguage: string): Promise<string> => {
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Determine if translation is needed
    const needsTranslation = 
      (detectedLanguage.includes('sin') || detectedLanguage.includes('si')) && targetLanguage === 'en' ||
      (detectedLanguage.includes('en') || detectedLanguage.includes('eng')) && targetLanguage === 'si';

    if (!needsTranslation) {
      return text; // No translation needed
    }

    const targetLangName = targetLanguage === 'en' ? 'English' : 'Sinhala';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a translator. Translate the following text to ${targetLangName}. Only return the translated text, nothing else.`,
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Translation failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || text;
  }, [apiKey, targetLanguage]);

  const detectLanguage = useCallback(async (text: string): Promise<string> => {
    if (!apiKey) {
      return 'en'; // Default to English
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Detect the language of the following text. Reply with only the language code: "en" for English or "si" for Sinhala.',
          },
          {
            role: 'user',
            content: text,
          },
        ],
        temperature: 0,
        max_tokens: 10,
      }),
    });

    if (!response.ok) {
      return 'en'; // Default to English on error
    }

    const data = await response.json();
    const detectedLang = data.choices[0]?.message?.content?.toLowerCase().trim() || 'en';
    return detectedLang;
  }, [apiKey]);

  const stopRecording = useCallback(async () => {
    if (!audioRecorder.isRecording) {
      return;
    }

    try {
      setStatus('processing');
      
      // Stop the recording
      await audioRecorder.stop();
      
      // Get the URI from the recorder object
      const uri = audioRecorder.uri;
      
      if (!uri) {
        throw new Error('No recording URI available');
      }

      // Transcribe the audio
      const transcription = await transcribeAudio(uri);
      
      // Detect language of transcription
      const detectedLang = await detectLanguage(transcription);
      
      // Translate if needed
      const finalText = await translateText(transcription, detectedLang);
      
      setTranscribedText(finalText);
      setStatus('idle');

      // Clean up the audio file
      await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process recording';
      setError(errorMessage);
      setStatus('error');
      console.error('Error processing recording:', err);
    }
  }, [audioRecorder, transcribeAudio, detectLanguage, translateText]);

  const clearTranscription = useCallback(() => {
    setTranscribedText(null);
    setError(null);
    setStatus('idle');
  }, []);

  return {
    status,
    isRecording: status === 'recording',
    isProcessing: status === 'processing',
    error,
    transcribedText,
    startRecording,
    stopRecording,
    clearTranscription,
  };
}
