# Guardian Chain Notification System

## Overview

The Guardian Chain Notification System automatically detects when a parent cannot pick up their child and intelligently activates a sequential notification chain through configured guardians. The system uses AI to analyze parent messages and manages the entire escalation process automatically.

## How It Works

### 🔗 The Chain Process

```
Parent Message: "I won't be able to pickup my kid today"
        ↓
AI Analysis: Pickup issue detected
        ↓
Confirmation Dialog
        ↓
[Parent Confirms] → Create Pickup Session
        ↓
Notify Primary Guardian (Priority 1)
        ↓
┌─────────────┐
│ Guardian 1  │ → Accept? ✅ DONE! Notify parent of success
└─────────────┘
       ↓ Decline/Timeout
┌─────────────┐
│ Guardian 2  │ → Accept? ✅ DONE! Notify parent of success
└─────────────┘
       ↓ Decline/Timeout
┌─────────────┐
│ Backup 1    │ → Accept? ✅ DONE! Notify parent of success
└─────────────┘
       ↓ All Decline
Notify Parent: No guardian available
```

## Features

### 🤖 AI-Powered Detection

The system automatically detects pickup issues in parent messages:

**✅ Detected as Pickup Issues:**
- "I won't be able to pickup my kid today"
- "Running late, can someone else get Emma?"
- "Emergency at work, need backup for pickup"
- "Can my mother pick up Sarah instead?"
- "Won't make it by 3 PM"
- "Stuck in traffic, need help with pickup"

**❌ NOT Detected as Pickup Issues:**
- "What time is pickup tomorrow?"
- "Can we schedule a meeting next week?"
- "Thanks for the update"
- General conversation

### 👥 Guardian Hierarchy

Guardians are prioritized in this order:

1. **Primary Guardian** (Priority 1)
   - Usually the other parent
   - First to be notified

2. **Secondary Guardian** (Priority 2)
   - Grandparent, aunt/uncle, etc.
   - Notified if primary declines/timeout

3. **Backup Circle** (Priority 3+)
   - Pre-approved trusted parents
   - Up to 3 backup contacts
   - Last resort before returning to parent

### ⏱️ Session Management

Each pickup request creates a **session** that:
- Has a unique session ID
- Tracks all guardian responses
- Manages timeouts (default 5 minutes per guardian)
- Records timestamps
- Maintains current state
- Automatically escalates or resolves

### 📱 Notification Flow

**For Parents:**
```
1. Send message mentioning pickup issue
2. AI detects and shows confirmation dialog
3. Confirm to activate guardian chain
4. Receive updates as guardians respond
5. Get final notification when resolved
```

**For Guardians:**
```
1. Receive push notification: "[Parent] needs help picking up [Child]"
2. Tap notification to see details
3. Choose: Accept or Decline
4. If Accept: Confirmation sent to parent, other guardians notified (cancelled)
5. If Decline: Next guardian in chain is notified
```

## Technical Implementation

### Frontend Components

#### 1. AI Message Analysis

**File**: `hooks/use-copilot-chat.ts`

```typescript
const analyzeParentMessage = async (message: string) => {
  // Returns:
  {
    isPickupIssue: boolean,
    reason: string,
    urgency: 'high' | 'medium' | 'low',
    suggestedAction: string
  }
}
```

#### 2. Pickup Session Hook

**File**: `hooks/use-pickup-session.ts`

```typescript
const {
  createSession,      // Start new pickup session
  handleGuardianResponse, // Process guardian accept/decline
  getSession,         // Get session details
  getActiveSessions,  // List all active sessions
} = usePickupSession();
```

#### 3. Chat Screen Integration

**File**: `app/(tabs)/chat.tsx`

```typescript
// Detects user role and routes accordingly
if (userRole === 'parent') {
  await handleParentMessage(); // Pickup detection flow
} else {
  await handleTeacherMessage(); // Standard notification flow
}
```

### Backend API Endpoints

Your backend needs these endpoints:

#### GET `/api/students/:studentId/guardians`

Get guardian hierarchy for a student.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "guardian_1",
      "name": "John Smith",
      "phone": "+1234567890",
      "type": "primary",
      "priority": 1,
      "notificationToken": "ExponentPushToken[...]"
    },
    {
      "id": "guardian_2",
      "name": "Mary Johnson",
      "phone": "+1234567891",
      "type": "secondary",
      "priority": 2,
      "notificationToken": "ExponentPushToken[...]"
    }
  ]
}
```

#### POST `/api/pickup-sessions`

Create new pickup session.

**Request:**
```json
{
  "studentId": "student_123",
  "studentName": "Emma Johnson",
  "parentId": "parent_456",
  "parentName": "Sarah Johnson",
  "reason": "Emergency preventing pickup",
  "originalMessage": "I won't be able to pickup my kid today",
  "guardians": ["guardian_1", "guardian_2", "guardian_3"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "session_789",
    "status": "pending",
    "currentGuardian": "guardian_1"
  }
}
```

#### POST `/api/notifications/pickup-request`

Send notification to guardian.

**Request:**
```json
{
  "sessionId": "session_789",
  "guardianId": "guardian_1",
  "guardianToken": "ExponentPushToken[...]",
  "studentName": "Emma Johnson",
  "parentName": "Sarah Johnson",
  "reason": "Emergency preventing pickup",
  "urgency": "high"
}
```

#### PUT `/api/pickup-sessions/:sessionId`

Update session state.

**Request:**
```json
{
  "status": "accepted",
  "currentGuardianIndex": 1,
  "responses": [
    {
      "guardianId": "guardian_1",
      "guardianName": "John Smith",
      "response": "accepted",
      "timestamp": "2026-01-31T10:30:00Z",
      "message": "On my way!"
    }
  ]
}
```

#### POST `/api/notifications/pickup-resolution`

Notify parent of resolution.

**Request:**
```json
{
  "parentId": "parent_456",
  "resolution": {
    "status": "accepted",
    "studentName": "Emma Johnson",
    "guardianName": "John Smith",
    "guardianPhone": "+1234567890",
    "message": "On my way!"
  }
}
```

## Database Schema

### pickup_sessions Table

```sql
CREATE TABLE pickup_sessions (
  id VARCHAR(255) PRIMARY KEY,
  student_id VARCHAR(255) NOT NULL,
  student_name VARCHAR(255) NOT NULL,
  parent_id VARCHAR(255) NOT NULL,
  parent_name VARCHAR(255) NOT NULL,
  reason TEXT NOT NULL,
  original_message TEXT NOT NULL,
  status ENUM('pending', 'accepted', 'declined', 'timeout', 'completed') DEFAULT 'pending',
  current_guardian_index INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP NULL,
  FOREIGN KEY (student_id) REFERENCES students(id),
  FOREIGN KEY (parent_id) REFERENCES users(id)
);
```

### guardians Table

```sql
CREATE TABLE guardians (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  student_id VARCHAR(255) NOT NULL,
  type ENUM('primary', 'secondary', 'backup') NOT NULL,
  priority INT NOT NULL,
  relationship VARCHAR(100),
  notification_token VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (student_id) REFERENCES students(id),
  UNIQUE KEY unique_priority (student_id, priority)
);
```

### pickup_responses Table

```sql
CREATE TABLE pickup_responses (
  id VARCHAR(255) PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  guardian_id VARCHAR(255) NOT NULL,
  response ENUM('accepted', 'declined', 'timeout') NOT NULL,
  message TEXT,
  responded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES pickup_sessions(id),
  FOREIGN KEY (guardian_id) REFERENCES guardians(id)
);
```

## Usage Examples

### Parent Scenario 1: Emergency

```
Parent: "Emergency at work! Can't pick up Emma today"

System: 🚨 Pickup Issue Detected
        "Emergency preventing pickup"
        Urgency: HIGH
        
        Would you like to automatically notify your emergency 
        contacts (guardians) to help with pickup?
        
        [No, just send message] [Yes, notify guardians]

Parent: [Taps Yes]

System: ✅ Guardian Chain Activated
        Your emergency contacts are being notified one by one.
        You'll receive updates as they respond.
        
        Session ID: abc12345

--- 2 minutes later ---

Notification: 📧 John Smith accepted pickup for Emma!
              He will arrive by 3:30 PM
              Contact: +1234567890
```

### Parent Scenario 2: Running Late

```
Parent: "Stuck in traffic, running 30 mins late"

System: 🚨 Pickup Issue Detected
        "Delayed by traffic"
        Urgency: MEDIUM
        
Parent: [Confirms]

--- Guardian Chain Activates ---

Primary Guardian (John): [Declines - at work]
Secondary Guardian (Mary): [Accepts!]

Notification: ✅ Mary Johnson will pick up Emma!
              Arrives by 3:15 PM
              Phone: +1234567891
```

### Parent Scenario 3: All Decline

```
Parent: "Won't make pickup today"

--- All guardians decline or timeout ---

Notification: ⚠️ No Guardian Available
              All emergency contacts declined or didn't respond.
              
              Please contact the school directly:
              📞 (555) 123-4567
              
              Session: abc12345 (for reference)
```

## Configuration

### Environment Variables

```env
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key
EXPO_PUBLIC_API_URL=your_backend_url
```

### Guardian Setup (Backend)

Parents should configure their guardian hierarchy:

```json
{
  "studentId": "student_123",
  "guardians": [
    {
      "userId": "user_456",
      "name": "John Smith",
      "phone": "+1234567890",
      "relationship": "Father",
      "type": "primary",
      "priority": 1
    },
    {
      "userId": "user_789",
      "name": "Mary Johnson",
      "phone": "+1234567891",
      "relationship": "Grandmother",
      "type": "secondary",
      "priority": 2
    },
    {
      "userId": "user_012",
      "name": "Sarah Lee",
      "phone": "+1234567892",
      "relationship": "Family Friend",
      "type": "backup",
      "priority": 3
    }
  ]
}
```

## Timeout Handling

Default timeout per guardian: **5 minutes**

```typescript
// Pseudo-code for timeout handling
setTimeout(() => {
  if (guardian.response === null) {
    // Mark as timeout
    handleGuardianResponse(sessionId, guardianId, false);
    
    // Move to next guardian
    notifyNextGuardian(sessionId);
  }
}, 5 * 60 * 1000); // 5 minutes
```

## Notifications

### For Guardians

**Title**: "🚨 Pickup Help Needed"

**Body**: "[Parent Name] needs help picking up [Child Name] from school today. [Reason]"

**Actions**:
- ✅ Accept Pickup
- ❌ Cannot Help

### For Parents (Resolution)

**Success:**
```
Title: "✅ Pickup Arranged!"
Body: "[Guardian Name] will pick up [Child] today.
       Contact: [Phone]
       Message: [Optional guardian message]"
```

**Failure:**
```
Title: "⚠️ No Guardian Available"
Body: "All emergency contacts declined or didn't respond.
       Please contact school directly."
```

## Benefits

### For Parents
- ✅ Instant emergency backup system
- ✅ No manual calling needed
- ✅ Automatic escalation
- ✅ Real-time updates
- ✅ Peace of mind

### For Schools
- ✅ Reduced emergency calls
- ✅ Better pickup management
- ✅ Clear communication chain
- ✅ Audit trail of responses

### For Guardians
- ✅ Clear notification when needed
- ✅ Easy accept/decline
- ✅ Knows parent's situation
- ✅ Can coordinate with others

## Cost Analysis

**Per Pickup Session:**
- AI message analysis: ~150 tokens (~$0.0002)
- Push notifications: 3-4 guardians (~$0.00)
- Total: ~$0.0002 per session

**Monthly estimate** (10 emergencies): ~$0.002

Very low cost for critical safety feature!

## Future Enhancements

- 🔄 Real-time chat between parent and accepting guardian
- 📍 Guardian ETA tracking
- 📊 Analytics on response times
- 🔔 Escalation to school office if all decline
- ⏰ Schedule future pickups
- 👤 Temporary guardian approval
- 🌐 Multi-language support for guardians
- 📱 SMS fallback if no app access

## Troubleshooting

### Issue: AI doesn't detect pickup problem

**Solution**: Check message clarity. Use explicit phrases like:
- "cannot pick up"
- "need help with pickup"
- "emergency preventing pickup"

### Issue: No guardians configured

**Error**: "No guardians configured for this student"

**Solution**: Configure guardians in backend first via parent portal.

### Issue: All guardians timeout

**Solution**: System automatically notifies parent. Parent should contact school directly.

### Issue: Guardian accepted but didn't show

**Solution**: Parent can create new session or contact school. System provides session ID for reference.

## Support

For technical issues:
1. Check session ID in notification
2. View session details in app
3. Contact school with session ID
4. System maintains full audit trail

Session data includes:
- All guardian responses
- Timestamps
- Messages
- Current status
- Resolution details
