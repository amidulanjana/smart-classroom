# Chat Interface with CopilotKit Integration

This document explains how to use the integrated chat interface with CopilotKit Cloud for AI-powered parent-teacher communication.

## Features

- **Message Composer**: Professional UI for composing messages to parents
- **AI Suggestions**: Quick access to common message types
- **Multi-language Support**: English and Sinhala translation
- **CopilotKit Cloud Integration**: AI-powered message generation using CopilotKit's hosted LLM service
- **Voice Input**: Record messages using voice
- **File Attachments**: Attach documents to messages

## Setup Instructions

### 1. Get Your CopilotKit API Key

1. Visit [CopilotKit Cloud](https://cloud.copilotkit.ai/)
2. Sign up or log in to your account
3. Create a new project or select an existing one
4. Copy your **Public API Key**

### 2. Frontend Setup

The chat interface is already integrated into your app at `app/(tabs)/chat.tsx`.

#### Configure Environment Variables

1. Copy `.env.example` to `.env`:

```bash
cd frontend
cp .env.example .env
```

2. Edit `.env` and add your CopilotKit API key:

```env
EXPO_PUBLIC_COPILOT_KIT_PUBLIC_API_KEY=your_copilotkit_public_api_key_here
```

#### Install Dependencies (Already Done)

The required packages are already installed:
- `@copilotkit/react-core` - CopilotKit core functionality
- `@copilotkit/react-ui` - UI components for CopilotKit
- `react-native-webview` - For web-based CopilotKit features

### 3. Configure App.json (Optional)

You can also add the API key to `app.json` for better configuration management:

```json
{
  "expo": {
    "extra": {
      "copilotKitPublicApiKey": "your_copilotkit_public_api_key_here"
    }
  }
}
```

### 4. Start the App

```bash
cd frontend
npm start
```

## Using the Chat Interface

### Accessing the Chat

The chat interface is available in the "Messages" tab in your app navigation.

### Features

1. **Select Recipients**: Choose from:
   - All Parents in Class
   - Absentees Only
   - Specific Students

2. **Choose Language**: Toggle between English and Sinhala

3. **AI Suggestions**: Tap on suggestion chips to auto-generate messages:
   - After-class cancellation
   - Homework Reminder
   - Field Trip Update
   - Exam Schedule

4. **Compose Message**: Type or use voice input

5. **AI Generation**: When you tap a suggestion, CopilotKit will automatically generate a professional message

6. **Send**: Tap the "Send Message" button

## CopilotKit Integration Details

### How It Works

The integration uses **CopilotKit Cloud**, which means:
- ✅ No backend setup required
- ✅ LLM hosting handled by CopilotKit
- ✅ Automatic scaling and reliability
- ✅ Easy API key configuration
- ✅ Works directly from your frontend

### Available Actions

#### 1. Generate Message

Automatically generates professional messages based on type and language.

```typescript
await generateMessage('homework reminder', 'English', 'Math homework due Friday');
```

CopilotKit will create a well-formatted, professional message suitable for parent-teacher communication.

#### 2. Translate Message

Translates messages between English and Sinhala while maintaining professional tone.

The AI assistant can:
- Translate any message you type
- Maintain cultural and educational context
- Ensure proper formatting and politeness

### Context Provided to AI

The system provides CopilotKit with context about:
- Role: Teacher
- Context: Smart classroom parent-teacher communication
- Languages: English and Sinhala
- Capabilities: Message generation, translation, template suggestions

This ensures the AI generates appropriate, professional content for educational communication.

## Architecture

```
┌─────────────────┐
│   Chat Screen   │
│  (React Native) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  CopilotProvider│
│    (Frontend)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ CopilotKit Cloud│
│  (Hosted LLM)   │
└─────────────────┘
```

No backend required! Everything runs through CopilotKit's cloud service.

## Customization

### Add Custom AI Actions

Edit `hooks/use-copilot-chat.ts` to add more AI capabilities:

```typescript
useCopilotAction({
  name: 'checkGrammar',
  description: 'Check grammar and suggest improvements for the message',
  parameters: [
    {
      name: 'message',
      type: 'string',
      description: 'The message to check',
      required: true,
    },
  ],
  handler: async ({ message }) => {
    const prompt = `Check this message for grammar and suggest improvements: ${message}`;
    await sendMessage(prompt);
    return { success: true };
  },
});
```

### Modify AI Behavior

Update the `useCopilotReadable` context in `use-copilot-chat.ts`:

```typescript
useCopilotReadable({
  description: 'Teacher assistant context',
  value: {
    role: 'teacher',
    grade: '5B',
    subject: 'Mathematics',
    tone: 'friendly but professional',
    // Add more context
  },
});
```

### Add More Suggestion Templates

Edit the `AI_SUGGESTIONS` array in `chat.tsx`:

```typescript
const AI_SUGGESTIONS = [
  'After-class cancellation',
  'Homework Reminder',
  'Field Trip Update',
  'Exam Schedule',
  'Parent Meeting Invitation',  // New
  'Student Achievement',         // New
  'Absence Follow-up',          // New
];
```

## Troubleshooting

### CopilotKit not responding

1. **Check API Key**: Verify your API key is correctly set in `.env`
2. **Restart Expo**: After adding `.env`, restart the development server
3. **Check Console**: Look for any error messages in the Expo console

```bash
# Restart the server
cd frontend
npm start -- --clear
```

### Messages not generating

1. **API Key Valid**: Ensure your CopilotKit API key is active
2. **Network Connection**: Check your internet connection
3. **Check Logs**: Look at Metro bundler logs for errors

### Environment variable not loading

1. **File Name**: Ensure it's `.env` not `.env.txt`
2. **Location**: File should be in the `frontend` directory
3. **Restart**: Always restart Expo after changing `.env`

## Next Steps

### Enhance the Chat

1. **Message History**: Store and display sent messages
2. **Rich Text Editor**: Add formatting options (bold, italic, lists)
3. **Templates Library**: Save custom message templates
4. **Scheduled Messages**: Schedule messages to be sent later
5. **Read Receipts**: Track when parents read messages
6. **Push Notifications**: Notify parents of new messages

### Backend Integration

When you're ready to persist messages:

1. Create Firebase Firestore collections for messages
2. Add Cloud Functions to send notifications
3. Implement message delivery tracking
4. Add attachment storage to Firebase Storage

### Additional Features

- **Group Chat**: Enable parent-teacher group discussions
- **Emergency Alerts**: Priority messaging for urgent notifications
- **Translation History**: Save translation pairs for consistency
- **Message Analytics**: Track message engagement and read rates

## Resources

- [CopilotKit Documentation](https://docs.copilotkit.ai/)
- [CopilotKit Cloud Dashboard](https://cloud.copilotkit.ai/)
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Documentation](https://reactnative.dev/)

## Support

For issues with:
- **CopilotKit**: Visit [CopilotKit Discord](https://discord.gg/copilotkit)
- **This Integration**: Open an issue in your repository
- **Expo**: Check [Expo Forums](https://forums.expo.dev/)
