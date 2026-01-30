# Quick Setup Guide - AI Chat Integration

## 🚀 Quick Start (5 minutes)

### Step 1: Get OpenAI API Key
1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Click "Create new secret key"
4. Copy your **API key** (starts with `sk-`)

### Step 2: Configure Your App
```bash
cd frontend
cp .env.example .env
```

Edit `.env`:
```env
EXPO_PUBLIC_OPENAI_API_KEY=sk-your_key_here
```

### Step 3: Run the App
```bash
npm start
```

### Step 4: Use the Chat
1. Open the app
2. Navigate to the "Messages" tab
3. **Text Generation**: Tap any AI suggestion (e.g., "Homework Reminder")
4. **Voice Recording**: 
   - Tap and hold the mic button to record
   - Speak in English or Sinhala
   - Release to transcribe automatically
   - If you speak Sinhala while English is selected, it auto-translates to English (and vice versa)
5. Switch between English and Sinhala

## ✅ That's It!

The AI chat now uses OpenAI directly from your app. No backend setup required!

## 🎙️ Voice Recording Features

- **Speech-to-Text**: Record your voice and convert to text using OpenAI Whisper
- **Auto-Translation**: Speak in one language, get text in another
  - Speak Sinhala → Get English text (when English is selected)
  - Speak English → Get Sinhala text (when Sinhala is selected)
- **Smart Language Detection**: Automatically detects the spoken language
- **Real-time Feedback**: Visual indicators show recording and processing status

## 📖 Need More Details?

See [CHAT_INTEGRATION.md](./CHAT_INTEGRATION.md) for:
- Detailed features
- Customization options
- Adding custom AI actions
- Troubleshooting

## 🎯 What You Get

- **AI-Powered Messages**: Professional parent-teacher communication using OpenAI
- **Multi-Language**: English ↔ Sinhala translation
- **Smart Suggestions**: Quick message templates
- **Simple Integration**: Direct OpenAI API integration

## 💡 Pro Tips

1. **Voice Recording**: Hold your device 6-12 inches from your mouth for best results
2. **Cross-Language**: Speak Sinhala to get English text (and vice versa) automatically
3. **Quiet Environment**: Record in quiet spaces for better accuracy
4. **Review First**: Always review AI-generated or transcribed content before sending
5. **Custom Templates**: Add your own suggestion chips in `app/(tabs)/chat.tsx`

## 🔧 Troubleshooting

**Chat not working?**
1. Check your API key is correct in `.env`
2. Restart Expo: `npm start -- --clear`
3. Check you have internet connection
4. Verify your OpenAI account has credits

**"API key not configured" error?**
1. Make sure `.env` file exists in the `frontend` folder
2. Verify the key starts with `sk-`
3. Restart the dev server after changing `.env`

**Need help?**
- OpenAI Docs: https://platform.openai.com/docs
- OpenAI Help: https://help.openai.com
