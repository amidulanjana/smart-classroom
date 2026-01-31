import { useState, useCallback, useRef } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { useAIContext } from '@/components/copilot-provider';

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
  const [status, setStatus] = useState<RecordingStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [transcribedText, setTranscribedText] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const startRecording = useCallback(async () => {
    try {
      console.log('🎤 Requesting microphone permission...');
      setError(null);
      setTranscribedText(null);

      // Request permissions
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        throw new Error('Microphone permission denied');
      }

      // Set audio mode for recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log('🎤 Creating recording...');
      
      // Create recording with preset
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      recordingRef.current = recording;
      setStatus('recording');
      console.log('✅ Recording started!');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      console.error('❌ Recording error:', errorMessage);
      setError(errorMessage);
      setStatus('error');
    }
  }, []);

  const stopRecording = useCallback(async () => {
    try {
      const recording = recordingRef.current;
      if (!recording) {
        console.log('⚠️ No active recording to stop');
        return;
      }

      console.log('⏹️ Stopping recording...');
      setStatus('processing');
      
      // Stop recording
      await recording.stopAndUnloadAsync();
      
      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      // Get the URI
      const uri = recording.getURI();
      console.log('📁 Recording saved to:', uri);
      recordingRef.current = null;

      if (!uri) {
        throw new Error('No recording URI available');
      }

      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(uri);
      console.log('📊 File info:', fileInfo);
      
      if (!fileInfo.exists) {
        throw new Error('Recording file not found');
      }

      // Transcribe the audio
      console.log('🔄 Transcribing audio...');
      const transcription = await transcribeAudio(uri);
      console.log('📝 Transcription:', transcription);
      
      // Translate if needed
      if (transcription) {
        const finalText = await translateIfNeeded(transcription);
        console.log('✨ Final text:', finalText);
        setTranscribedText(finalText);
      }
      
      setStatus('idle');

      // Clean up the audio file
      try {
        await FileSystem.deleteAsync(uri, { idempotent: true });
        console.log('🗑️ Audio file cleaned up');
      } catch {
        // Ignore cleanup errors
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to process recording';
      console.error('❌ Error:', errorMessage);
      setError(errorMessage);
      setStatus('idle');
    }
  }, [apiKey, targetLanguage]);

  const transcribeAudio = async (uri: string): Promise<string> => {
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Create form data for upload
    const formData = new FormData();
    
    // For React Native, append file as object with uri, type, name
    const audioFile = {
      uri,
      type: 'audio/m4a',
      name: 'recording.m4a',
    } as any;

    formData.append('file', audioFile);
    formData.append('model', 'whisper-1');
    formData.append('language', targetLanguage === 'si' ? 'si' : 'en');

    console.log('📤 Sending to Whisper API...');
    
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Whisper API error:', errorText);
      throw new Error(`Transcription failed: ${response.status}`);
    }

    const data = await response.json();
    return data.text || '';
  };

  const translateIfNeeded = async (text: string): Promise<string> => {
    if (!apiKey || !text) return text;

    // Detect if translation is needed based on target language
    // For simplicity, we'll skip translation for now since Whisper handles it
    // The language parameter we sent to Whisper should give us the right language
    return text;
  };

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
