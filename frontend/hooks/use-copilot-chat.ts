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
    additionalDetails?: string,
    userRole: 'teacher' | 'parent' = 'teacher'
  ) => {
    if (!apiKey) {
      setError('OpenAI API key not configured. Please add EXPO_PUBLIC_OPENAI_API_KEY to your .env file');
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      let prompt: string;
      
      if (userRole === 'parent') {
        // Parents get SHORT, direct messages (1-2 sentences max)
        prompt = `Generate a brief, direct message from a parent about "${messageType}" in ${language}${additionalDetails ? ` with these details: ${additionalDetails}` : ''}. Keep it SHORT and CLEAR - maximum 1-2 sentences. No greetings, no signatures, just the essential message. Be casual and to the point.`;
      } else {
        // Teachers get concise but professional messages (3-4 sentences)
        // Teacher name is always Mrs. Perera
        prompt = `Generate a concise professional message from a teacher named Mrs. Perera to parents about "${messageType}" in ${language}${additionalDetails ? ` with these details: ${additionalDetails}` : ''}. Keep it brief but professional - 3-4 sentences maximum. Include a short greeting, the key information, and sign off as "Mrs. Perera". No lengthy explanations.`;
      }
      
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

  const analyzeForNotification = useCallback(async (message: string): Promise<{
    shouldNotify: boolean;
    reason: string;
    urgency: 'high' | 'medium' | 'low';
  }> => {
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Analyze this teacher message and determine if it should trigger urgent notifications to parents. 

Message: "${message}"

Respond ONLY with a JSON object in this exact format:
{
  "shouldNotify": true/false,
  "reason": "brief explanation",
  "urgency": "high"/"medium"/"low"
}

Trigger notifications (shouldNotify: true) for:
- Schedule changes (early dismissal, class cancellations, time changes)
- Important announcements (after-school sessions, special events, exam dates)
- Urgent matters (safety concerns, sudden changes)
- Time-sensitive information (deadlines, upcoming events in next few days)

Do NOT trigger for:
- General updates that can wait
- Routine homework reminders
- Casual conversation`;

    const result = await callOpenAI(prompt);
    
    try {
      // Extract JSON from the response
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        shouldNotify: parsed.shouldNotify || false,
        reason: parsed.reason || 'No reason provided',
        urgency: parsed.urgency || 'low',
      };
    } catch (parseError) {
      console.error('Failed to parse notification analysis:', parseError);
      return { shouldNotify: false, reason: 'Failed to analyze', urgency: 'low' };
    }
  }, [apiKey, callOpenAI]);

  const analyzeParentMessage = useCallback(async (message: string): Promise<{
    isPickupIssue: boolean;
    reason: string;
    urgency: 'high' | 'medium' | 'low';
    suggestedAction: string;
  }> => {
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Analyze this parent message and determine if it indicates a child pickup issue that requires guardian chain notification.

Message: "${message}"

Respond ONLY with a JSON object in this exact format:
{
  "isPickupIssue": true/false,
  "reason": "brief explanation of the issue",
  "urgency": "high"/"medium"/"low",
  "suggestedAction": "what should be done"
}

Classify as pickup issue (isPickupIssue: true) when parent indicates:
- Cannot pick up child today/tomorrow
- Running late for pickup
- Emergency preventing pickup
- Asking for alternate pickup arrangements
- Mentioning guardian/emergency contact needed
- Delayed by unexpected circumstances

Examples of pickup issues:
- "I won't be able to pickup my kid today"
- "Running late, can someone else get Emma?"
- "Emergency at work, need backup for pickup"
- "Can my mother pick up Sarah instead?"

Do NOT classify as pickup issue:
- General questions about pickup time
- Routine schedule discussions
- Casual conversation
- Future planning (next week, next month)`;

    const result = await callOpenAI(prompt);
    
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        isPickupIssue: parsed.isPickupIssue || false,
        reason: parsed.reason || 'No reason provided',
        urgency: parsed.urgency || 'low',
        suggestedAction: parsed.suggestedAction || 'Contact guardians',
      };
    } catch (parseError) {
      console.error('Failed to parse parent message analysis:', parseError);
      return {
        isPickupIssue: false,
        reason: 'Failed to analyze',
        urgency: 'low',
        suggestedAction: 'Manual review needed',
      };
    }
  }, [apiKey, callOpenAI]);

  const analyzeSuggestedRecipient = useCallback(async (message: string): Promise<'teacher' | 'guardian-chain' | 'all' | null> => {
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Analyze this parent message and determine the most appropriate recipient.

Message: "${message}"

Respond ONLY with a JSON object in this exact format:
{
  "recipient": "teacher" | "guardian-chain" | "all" | null,
  "confidence": 0.0-1.0
}

Recipient Guidelines:
- "guardian-chain": Pickup issues, emergencies requiring alternate guardian (NEVER broadcast to class)
- "teacher": Questions, permission requests, meeting requests, child-specific issues
- "all": General announcements that would benefit other parents (birthday invites, carpools)
- null: Unclear, let parent choose

Examples:
- "Can't pickup today" → "guardian-chain"
- "My child is sick" → "teacher"
- "Can we schedule a meeting?" → "teacher"
- "Emma's birthday party Saturday" → "all"
- "Need homework clarification" → "teacher"`;

    const result = await callOpenAI(prompt);
    
    try {
      const jsonMatch = result.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return null;
      }
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.confidence > 0.6 ? parsed.recipient : null;
    } catch (parseError) {
      console.error('Failed to parse recipient analysis:', parseError);
      return null;
    }
  }, [apiKey, callOpenAI]);

  const generateParentSuggestions = useCallback(async (context?: string): Promise<string[]> => {
    if (!apiKey) {
      return [
        'Running Late for Pickup',
        'Child is Sick',
        'Request Meeting',
        'Permission Request',
      ];
    }

    const prompt = `Generate 4 short, common parent-to-teacher message suggestions.

${context ? `Context: ${context}` : ''}

Respond ONLY with a JSON array of 4 strings:
["Suggestion 1", "Suggestion 2", "Suggestion 3", "Suggestion 4"]

Guidelines:
- Keep each under 4 words
- Cover common scenarios: pickup issues, sick child, meetings, permissions
- Be specific and actionable
- Professional and polite

Examples: "Running Late Today", "Child Has Fever", "Request Conference", "Field Trip Permission"`;

    try {
      const result = await callOpenAI(prompt);
      const jsonMatch = result.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON found');
      }
      const suggestions = JSON.parse(jsonMatch[0]);
      return Array.isArray(suggestions) ? suggestions : [];
    } catch (err) {
      console.error('Failed to generate parent suggestions:', err);
      return [
        'Running Late for Pickup',
        'Child is Sick',
        'Request Meeting',
        'Permission Request',
      ];
    }
  }, [apiKey, callOpenAI]);

  return {
    isGenerating,
    generatedContent,
    error,
    generateMessage,
    translateMessage,
    analyzeForNotification,
    analyzeParentMessage,
    analyzeSuggestedRecipient,
    generateParentSuggestions,
  };
}
