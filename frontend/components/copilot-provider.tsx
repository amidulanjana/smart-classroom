import React, { createContext, useContext, ReactNode } from 'react';
import Constants from 'expo-constants';

interface AIContextType {
  apiKey: string | undefined;
}

const AIContext = createContext<AIContextType>({ apiKey: undefined });

export function useAIContext() {
  return useContext(AIContext);
}

interface CopilotProviderProps {
  children: ReactNode;
}

export function CopilotProvider({ children }: CopilotProviderProps) {
  // Get OpenAI API key from environment
  const apiKey = Constants.expoConfig?.extra?.openaiApiKey || 
                 process.env.EXPO_PUBLIC_OPENAI_API_KEY;

  return (
    <AIContext.Provider value={{ apiKey }}>
      {children}
    </AIContext.Provider>
  );
}
