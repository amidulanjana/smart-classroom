# Smart Notification System

## Overview

The smart notification system automatically analyzes teacher messages and intelligently determines when to send push notifications to parents. Using OpenAI's GPT model, it identifies important announcements that require immediate parent attention.

## Features

### 🤖 AI-Powered Analysis

When a teacher sends a message, the system:
1. Analyzes the message content using OpenAI
2. Determines if it requires urgent parent notification
3. Classifies the urgency level (high/medium/low)
4. Provides reasoning for the decision

### 🔔 Automatic Notification Triggers

The system automatically suggests notifications for:

- **Schedule Changes**
  - Early dismissals
  - Class cancellations
  - Time changes
  - After-school sessions

- **Important Announcements**
  - Upcoming events (2-3 days notice)
  - Special sessions
  - Exam schedules
  - Field trips

- **Urgent Matters**
  - Safety concerns
  - Sudden changes
  - Emergency updates

- **Time-Sensitive Information**
  - Deadlines approaching
  - Last-minute changes
  - RSVP requirements

### ⚙️ How It Works

```typescript
// Example message flow:
Teacher types: "Class will be over early today at 2 PM"

1. Message is analyzed by AI
2. AI determines: 
   {
     shouldNotify: true,
     reason: "Schedule change requiring immediate parent action",
     urgency: "high"
   }

3. Teacher is prompted:
   "This message appears to be high priority: Schedule change requiring 
    immediate parent action. Send push notifications to all parents?"

4. Teacher confirms → All parents receive push notification
5. Teacher declines → Message is saved without notifications
```

## Usage

### In Chat Screen

1. **Compose Message**: Type or use voice to create your message
2. **Press Send**: The system automatically analyzes the content
3. **Review Prompt**: If important, you'll see a notification suggestion
4. **Confirm or Decline**: Choose whether to send notifications
5. **Done**: Message is sent with or without notifications

### Example Messages

#### ✅ Will Trigger Notifications

```
"Class will be dismissed early today at 2 PM due to teacher training"
→ High priority: Schedule change

"Parent-teacher conferences scheduled for next Monday"
→ Medium priority: Important event

"After-school tutoring session tomorrow at 3 PM"
→ Medium priority: Time-sensitive information

"Reminder: Field trip permission slips due in 2 days"
→ Medium priority: Approaching deadline
```

#### ❌ Won't Trigger Notifications

```
"Great job on today's assignments, everyone!"
→ General praise, not urgent

"Remember to review chapter 5 for homework"
→ Routine homework reminder

"Looking forward to seeing everyone tomorrow"
→ Casual message
```

## Technical Implementation

### Frontend (React Native)

**File**: `hooks/use-copilot-chat.ts`

```typescript
const analyzeForNotification = useCallback(async (message: string) => {
  const prompt = `Analyze this teacher message and determine if it should 
    trigger urgent notifications to parents...`;
  
  const result = await callOpenAI(prompt);
  return {
    shouldNotify: boolean,
    reason: string,
    urgency: 'high' | 'medium' | 'low'
  };
}, [apiKey, callOpenAI]);
```

**File**: `app/(tabs)/chat.tsx`

```typescript
const handleSendMessage = async () => {
  // Analyze message
  const analysis = await analyzeForNotification(message);
  
  if (analysis.shouldNotify) {
    // Show confirmation dialog
    Alert.alert('Smart Notification', ...);
  } else {
    // Send without notification
    sendMessageToBackend(false);
  }
};
```

### Backend Integration

The message is sent to your backend with notification preferences:

```typescript
POST /api/messages
{
  content: "Class will be over early today",
  language: "en",
  recipientType: "all",
  sendNotifications: true,
  notificationToken: "ExponentPushToken[...]"
}
```

Your backend should:
1. Save the message to database
2. If `sendNotifications: true`, send push notifications to all parent devices
3. Return notification count

### Backend Response

```json
{
  "success": true,
  "messageId": "msg_123",
  "notificationCount": 25
}
```

## Configuration

### Environment Variables

```env
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key
EXPO_PUBLIC_API_URL=your_backend_url
```

### Notification Permissions

The app automatically requests notification permissions on startup via `useNotifications(true)`.

**iOS**: Configured in `app.json`
```json
{
  "ios": {
    "infoPlist": {
      "NSUserNotificationUsageDescription": "Allow notifications for important updates"
    }
  }
}
```

**Android**: Configured in `app.json`
```json
{
  "android": {
    "permissions": ["NOTIFICATIONS"]
  }
}
```

## API Costs

The smart notification feature uses OpenAI API:

- **Model**: GPT-3.5-turbo
- **Average tokens per analysis**: ~150 tokens
- **Cost per analysis**: ~$0.0002 (very low)
- **Monthly estimate** (100 messages): ~$0.02

The cost is minimal and provides significant value through intelligent notification management.

## Benefits

### For Teachers
- ✅ No manual decision-making about notifications
- ✅ Reduces notification fatigue for parents
- ✅ Ensures important messages reach parents immediately
- ✅ Saves time with AI assistance

### For Parents
- ✅ Only receive notifications for truly important messages
- ✅ Won't miss critical schedule changes
- ✅ Reduced notification noise
- ✅ Better engagement with school

### For School
- ✅ Improved parent-teacher communication
- ✅ Better attendance at events
- ✅ Reduced missed pickups due to early dismissals
- ✅ Enhanced safety through timely notifications

## Troubleshooting

### Notifications Not Triggering

1. **Check API Key**: Ensure `EXPO_PUBLIC_OPENAI_API_KEY` is set
2. **Check Permissions**: Verify notification permissions are granted
3. **Check Backend**: Ensure backend notification endpoint is working
4. **Check Token**: Verify `notificationToken` is registered

### False Positives/Negatives

The AI model is continuously learning. If you notice incorrect classifications:

1. The teacher can always override the suggestion
2. Consider adjusting the prompt in `use-copilot-chat.ts`
3. Provide feedback to improve the model

### Testing

To test the smart notification system:

```typescript
// Test messages:
const testMessages = [
  "Class will end early today",        // Should trigger
  "Great work everyone!",               // Should NOT trigger
  "Field trip tomorrow at 9 AM",       // Should trigger
  "Don't forget your homework"          // Should NOT trigger
];
```

## Future Enhancements

- 🔄 Machine learning from teacher feedback
- 📊 Analytics on notification effectiveness
- 🌐 Multi-language notification content
- ⏰ Scheduled notifications
- 👥 Targeted notifications (specific students)
- 📱 Rich notifications with action buttons

## Support

For issues or questions:
1. Check the console logs for analysis results
2. Verify API configuration
3. Test with simple messages first
4. Review the AI prompt in `use-copilot-chat.ts`
