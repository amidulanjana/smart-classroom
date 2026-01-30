import { useState, useCallback } from 'react';
import { useAIContext } from '@/components/copilot-provider';

export function useCopilotChat() {
  const { apiKey } = useAIContext();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const callOpenAI = useCallback(async (prompt: string): Promise<string> => {
    if (!apiKey) {
      throw new Error('OpenAI API key not configured. Please add EXPO_PUBLIC_OPENAI_API_KEY to your .env file');
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
            content: 'You are a helpful teacher assistant that generates professional messages for parent-teacher communication. Be polite, clear, and concise. Support both English and Sinhala languages.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }, [apiKey]);

  const generateMessage = useCallback(async (
    messageType: string,
    language: string,
    additionalDetails?: string
  ) => {
    if (!apiKey) {
      setError('OpenAI API key not configured. Please add EXPO_PUBLIC_OPENAI_API_KEY to your .env file');
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      const prompt = `Generate a professional parent-teacher message about "${messageType}" in ${language}${additionalDetails ? ` with these details: ${additionalDetails}` : ''}. Format it properly with a greeting, body, and closing signature.`;
      
      const result = await callOpenAI(prompt);
      setGeneratedContent(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate message';
      setError(errorMessage);
      console.error('Error generating message:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [apiKey, callOpenAI]);

  const translateMessage = useCallback(async (
    message: string,
    targetLanguage: string
  ) => {
    if (!apiKey) {
      setError('OpenAI API key not configured. Please add EXPO_PUBLIC_OPENAI_API_KEY to your .env file');
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      const prompt = `Translate this message to ${targetLanguage}, maintaining a professional and polite tone suitable for parent-teacher communication:\n\n${message}`;
      
      const result = await callOpenAI(prompt);
      setGeneratedContent(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to translate message';
      setError(errorMessage);
      console.error('Error translating message:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [apiKey, callOpenAI]);

  return {
    isGenerating,
    generatedContent,
    error,
    generateMessage,
    translateMessage,
  };
}
