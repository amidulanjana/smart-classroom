# Voice Recording & Transcription Feature

## 🎙️ How It Works

The chat interface now includes voice recording with automatic transcription and translation powered by OpenAI's Whisper API.

## Features

### 1. **Speech-to-Text**
- Tap the microphone button to start recording
- Speak your message naturally
- Tap the stop button to finish recording
- Audio is automatically transcribed to text

### 2. **Auto-Translation**
The system intelligently handles language mismatches:

**Scenario 1: Speaking Sinhala with English Selected**
- You: Select "English" language
- You: Record voice in Sinhala
- System: Transcribes Sinhala audio → Detects language → Translates to English
- Result: English text appears in the message box

**Scenario 2: Speaking English with Sinhala Selected**
- You: Select "Sinhala" language
- You: Record voice in English
- System: Transcribes English audio → Detects language → Translates to Sinhala
- Result: Sinhala text appears in the message box

**Scenario 3: Matching Language**
- If you speak the same language as selected, no translation occurs
- Text appears directly in the message box

### 3. **Visual Feedback**

**Recording State:**
- 🔴 Red microphone button
- "Recording..." indicator with pulsing dot
- Message input is disabled

**Processing State:**
- 🟡 Orange microphone button with spinner
- "Processing audio..." indicator
- Transcription and translation in progress

**Ready State:**
- 🔵 Blue microphone button
- Ready to record or type

## Usage Instructions

### Basic Voice Recording

1. **Start Recording:**
   ```
   Tap the microphone button
   ```

2. **Speak Your Message:**
   ```
   Speak clearly into your device's microphone
   Example: "Dear parents, tomorrow's class is cancelled due to..."
   ```

3. **Stop Recording:**
   ```
   Tap the stop button (same button, now shows stop icon)
   ```

4. **Wait for Processing:**
   ```
   System transcribes → Detects language → Translates if needed
   Usually takes 2-5 seconds
   ```

5. **Review & Edit:**
   ```
   Transcribed text appears in the message box
   Edit if needed before sending
   ```

### Cross-Language Recording

**Example: Teacher speaks Sinhala, wants English message**

1. Select **English** from language toggle
2. Tap microphone button
3. Speak in Sinhala: "හෙට පන්ති අවලංගු කරනවා"
4. System:
   - Transcribes: "හෙට පන්ති අවලංගු කරනවා"
   - Detects: Sinhala
   - Translates: "Tomorrow's class is cancelled"
5. Result: English text ready to send

## Technical Details

### APIs Used

1. **OpenAI Whisper API** (`/v1/audio/transcriptions`)
   - Converts audio to text
   - Supports multiple languages including Sinhala
   - High accuracy speech recognition

2. **OpenAI GPT-3.5 Turbo** (`/v1/chat/completions`)
   - Language detection
   - Translation when needed
   - Maintains professional tone

### Audio Format

- **Format:** M4A (AAC)
- **Quality:** High quality recording
- **Sample Rate:** 44.1 kHz
- **Channels:** Mono

### Permissions Required

- **Microphone Access:** Required for recording
- First-time users will see a permission prompt
- Can be managed in device settings

## Troubleshooting

### "Permission to access microphone is required"

**Solution:**
1. Go to device Settings
2. Find your app
3. Enable Microphone permission
4. Restart the app

### "OpenAI API key not configured"

**Solution:**
1. Check `.env` file exists in `frontend` folder
2. Verify `EXPO_PUBLIC_OPENAI_API_KEY` is set
3. Restart Expo dev server: `npm start -- --clear`

### Recording doesn't start

**Possible causes:**
1. Microphone permission not granted
2. Another app is using the microphone
3. Device doesn't have a microphone

**Solution:**
- Close other apps using microphone
- Check permissions
- Try restarting the device

### Transcription is inaccurate

**Tips for better accuracy:**
1. Speak clearly and at moderate pace
2. Reduce background noise
3. Hold device 6-12 inches from mouth
4. Use in quiet environment
5. Speak in complete sentences

### Translation doesn't occur

**This is expected when:**
- You speak in the same language as selected
- Example: Select English, speak English → No translation needed

**Check if:**
- You're speaking in a different language than selected
- OpenAI API has sufficient credits
- Internet connection is stable

### Processing takes too long

**Normal processing time:** 2-5 seconds
**If longer than 10 seconds:**
1. Check internet connection
2. OpenAI API might be experiencing high load
3. Try recording a shorter message
4. Check OpenAI status: https://status.openai.com/

## Cost Considerations

### OpenAI API Costs (as of 2024)

**Whisper API:**
- $0.006 per minute of audio
- 1-minute message ≈ $0.006
- 100 messages/day ≈ $0.60/day

**GPT-3.5 Turbo (for translation):**
- Very low cost for short translations
- ~$0.0005 per translation
- 100 translations/day ≈ $0.05/day

**Total estimated cost:**
- Heavy usage (100 voice messages/day): ~$0.65/day or $20/month
- Moderate usage (30 voice messages/day): ~$0.20/day or $6/month
- Light usage (10 voice messages/day): ~$0.07/day or $2/month

## Best Practices

### For Teachers

1. **Record in quiet environment** for best accuracy
2. **Speak naturally** - don't need to speak slowly
3. **Review transcription** before sending
4. **Use for longer messages** - typing might be faster for short ones
5. **Test both languages** to see which works better for you

### For Developers

1. **Monitor API usage** to control costs
2. **Set usage limits** in OpenAI dashboard
3. **Cache common translations** to reduce API calls
4. **Implement retry logic** for failed requests
5. **Add local recording limits** (max 2 minutes)

## Future Enhancements

Potential features to add:

- [ ] Save voice recordings for playback
- [ ] Support for more languages
- [ ] Offline transcription (limited)
- [ ] Voice playback before transcription
- [ ] Batch processing multiple recordings
- [ ] Custom vocabulary for educational terms
- [ ] Voice activity detection (auto-stop when silent)
- [ ] Noise cancellation
- [ ] Recording quality indicator
- [ ] Edit transcription before translation

## Support

For issues or questions:
- OpenAI Whisper Docs: https://platform.openai.com/docs/guides/speech-to-text
- OpenAI Translation: https://platform.openai.com/docs/guides/chat
- Expo AV Docs: https://docs.expo.dev/versions/latest/sdk/av/
