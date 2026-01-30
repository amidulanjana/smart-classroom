# Emergency Pickup System - Complete Implementation Guide

## 🎯 Overview

This is a complete end-to-end implementation of the **Emergency Pickup Flow** for the Smart Classroom application. When a teacher needs to dismiss class early, this system ensures every child has a confirmed pickup plan through a cascading notification system.

## 🔄 The Flow

### 1. Teacher Stops Class Early
- Teacher opens the **Teacher Dashboard**
- Selects the class to dismiss early
- Provides a reason for early dismissal
- Clicks "Stop Class & Notify Parents"
- System immediately notifies all primary parents

### 2. Primary Parent Notification
- Each student's **primary guardian** receives an urgent notification
- Options: "I Can Pick Up" or "I Cannot"
- **If "Yes"**: 
  - Pickup is confirmed
  - Teacher is notified
  - Process complete for that student
- **If "No"** or **Timeout**: 
  - System escalates to secondary guardian

### 3. Secondary Parent Notification
- **Secondary guardian** receives notification
- Same response options
- **If "Yes"**: Confirmed and complete
- **If "No"** or **Timeout**: Escalates to Backup Circle

### 4. Backup Circle Activation
- System checks if parent has configured a **Backup Circle** (up to 3 trusted parents)
- **All 3 backup parents** receive notifications **simultaneously**
- **First parent to accept** gets assigned the pickup
- Other pending requests are automatically cancelled
- System notifies:
  - The assigned backup parent
  - The original primary parent
  - The teacher

### 5. Record Keeping
- Every response is stored in the database
- Pickup assignments are tracked
- Teachers can view real-time status of all students
- Parents receive confirmation notifications

## 📁 Project Structure

### Backend (aithon-backend-node)

```
aithon-backend-node/
├── src/
│   ├── models/
│   │   ├── EmergencyPickup.js      # Tracks entire pickup workflow
│   │   ├── Student.js               # Student information
│   │   ├── Guardian.js              # Parent/Guardian relationships
│   │   ├── BackupCircle.js          # Backup parent configuration
│   │   └── Notification.js          # Notification tracking
│   ├── controllers/
│   │   └── emergencyPickupController.js  # Handles all pickup requests
│   ├── services/
│   │   └── emergencyPickupService.js     # Core business logic
│   └── routes/
│       └── emergencyPickupRoutes.js      # API endpoints
```

### Frontend (frontend-two)

```
frontend-two/
├── app/
│   ├── teacher-dashboard.tsx       # Teacher: Stop class early
│   ├── parent-dashboard.tsx        # Parent: Respond to pickup requests
│   ├── backup-circle.tsx           # Parent: Manage backup circle
│   └── login.tsx                   # Authentication
├── contexts/
│   ├── AuthContext.tsx             # User authentication state
│   └── PickupContext.tsx           # Pickup-related state management
└── services/
    └── api.ts                      # API communication layer
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- MongoDB running locally or connection string
- Expo CLI (for frontend)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd aithon-backend-node
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   Create a `.env` file:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/smart-classroom
   ```

4. **Start the server:**
   ```bash
   npm start
   ```

   Server will run on http://localhost:3000

### Frontend Setup

1. **Navigate to frontend-two directory:**
   ```bash
   cd frontend-two
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Update API URL:**
   Edit `services/api.ts` and update `API_BASE_URL` to your backend URL

4. **Start the app:**
   ```bash
   npm start
   ```

5. **Run on device/simulator:**
   - iOS: Press `i`
   - Android: Press `a`
   - Web: Press `w`

## 📱 Using the Application

### For Teachers

1. **Login as Teacher:**
   - Use the "Login as Teacher" quick button
   - Or login with teacher credentials

2. **Stop Class Early:**
   - Navigate to Teacher Dashboard
   - Select a class from the list
   - Enter reason for early dismissal
   - Click "Stop Class & Notify Parents"
   - Monitor pickup status in real-time

3. **Track Progress:**
   - View which students have confirmed pickups
   - See who is picking up each student (primary, secondary, or backup)
   - Get notified when all students are accounted for

### For Parents

1. **Login as Parent:**
   - Use the "Login as Parent" quick button
   - Or login with parent credentials

2. **Respond to Pickup Requests:**
   - Urgent notifications appear on Parent Dashboard
   - Click "I Can Pick Up" if available
   - Click "I Cannot" if unavailable (triggers backup)

3. **Manage Backup Circle:**
   - Navigate to "Backup Circle" screen
   - Add up to 3 trusted backup parents
   - Provide name and phone number
   - View and manage existing backup parents

## 🔌 API Endpoints

### Emergency Pickup

- **POST** `/api/v1/emergency-pickups`
  - Initiate emergency pickup for a class
  - Body: `{ message_id, class_id, teacher_id, reason, pickup_time }`

- **POST** `/api/v1/emergency-pickups/respond`
  - Parent responds to pickup request
  - Body: `{ emergency_pickup_id, student_id, user_id, response }`

- **GET** `/api/v1/emergency-pickups/pending/:user_id`
  - Get pending pickup requests for a parent

- **GET** `/api/v1/emergency-pickups/teacher/:teacher_id`
  - Get active pickups for a teacher

- **POST** `/api/v1/emergency-pickups/picked-up`
  - Mark student as picked up
  - Body: `{ emergency_pickup_id, student_id }`

### Backup Circle

- **GET** `/api/v1/students/:student_id/backup-circle`
  - Get backup circle for a student

- **POST** `/api/v1/students/:student_id/backup-circle`
  - Add parent to backup circle
  - Body: `{ guardian_id, priority_order }`

- **DELETE** `/api/v1/students/:student_id/backup-circle/:backup_id`
  - Remove parent from backup circle

## 🎨 Key Features

### ✅ Implemented Features

1. **Teacher Dashboard**
   - View all classes
   - Initiate early dismissal
   - Real-time pickup status tracking
   - Student-by-student status visibility

2. **Parent Dashboard**
   - Urgent pickup request notifications
   - One-click response (Accept/Decline)
   - Clear student information
   - Role indication (Primary/Secondary/Backup)

3. **Backup Circle Management**
   - Add up to 3 backup parents
   - Priority ordering
   - Easy removal
   - Visual priority indicators

4. **Smart Escalation**
   - Automatic escalation on decline/timeout
   - Simultaneous backup notifications
   - First-response assignment
   - Complete audit trail

5. **Real-time Updates**
   - Pull-to-refresh on all screens
   - Live status updates
   - Immediate notifications

## 🗃️ Database Schema

### EmergencyPickup Collection
```javascript
{
  messageId: ObjectId,
  classId: ObjectId,
  initiatedBy: ObjectId (Teacher),
  reason: String,
  newPickupTime: Date,
  status: 'initiated' | 'in_progress' | 'completed',
  studentPickups: [{
    studentId: ObjectId,
    status: String,
    confirmedBy: ObjectId,
    confirmedByRole: 'primary' | 'secondary' | 'backup',
    escalationLevel: Number
  }]
}
```

### BackupCircle Collection
```javascript
{
  studentId: ObjectId,
  guardianId: ObjectId,
  priorityOrder: Number (1-3),
  isActive: Boolean
}
```

## 🔐 Security Considerations

1. **Authentication**: All endpoints should verify user identity
2. **Authorization**: Parents can only respond for their children
3. **Data Privacy**: Student information only visible to authorized users
4. **Rate Limiting**: Prevent spam responses

## 🧪 Testing the Flow

### Test Scenario 1: Primary Parent Accepts
1. Login as teacher → Stop class early
2. Login as parent (primary) → Accept pickup
3. Verify teacher sees confirmation

### Test Scenario 2: Escalation to Backup
1. Login as teacher → Stop class early
2. Login as parent (primary) → Decline
3. Login as parent (secondary) → Decline
4. Login as backup parent → Accept
5. Verify primary parent gets notification about backup pickup

### Test Scenario 3: Manage Backup Circle
1. Login as parent
2. Navigate to Backup Circle
3. Add 3 backup parents
4. Verify they appear in order
5. Remove one, verify update

## 📝 Next Steps / Enhancements

### Recommended Additions:
- [ ] Push notifications (Firebase/OneSignal)
- [ ] SMS notifications as backup
- [ ] GPS tracking for pickup parent
- [ ] Photo verification at pickup
- [ ] Timeout configuration (currently 5 min)
- [ ] Multi-language support
- [ ] Email notifications
- [ ] Analytics dashboard for teachers
- [ ] Historical pickup reports

## 🐛 Troubleshooting

### Backend not connecting:
- Check MongoDB is running
- Verify `.env` configuration
- Check port 3000 is not in use

### Frontend not loading data:
- Verify backend is running
- Check `API_BASE_URL` in `services/api.ts`
- Check network connectivity
- View console for error logs

### Notifications not working:
- This demo uses in-app notifications only
- For real push notifications, integrate Firebase Cloud Messaging

## 📞 Support

For issues or questions:
1. Check existing logs in terminal
2. Verify database connections
3. Review API responses in network tab
4. Check authentication state

## 🎓 Learning Resources

- [Expo Router Documentation](https://docs.expo.dev/router/introduction/)
- [React Native Documentation](https://reactnative.dev/)
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/)
- [Express.js Guide](https://expressjs.com/)

## ✨ Credits

Built with:
- React Native + Expo
- Node.js + Express
- MongoDB
- TypeScript

---

**Note**: This is a complete, working implementation focusing on the core emergency pickup flow. The system is ready for demonstration and can be extended with additional features as needed.
