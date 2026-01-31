The functiohns are available in aithon-backend-functions folder. We are using firebase cloud functions. Please make sure to follow the best practices for writing cloud functions, including proper error handling, logging, and optimizing for cold starts. Ensure that the functions are modular and reusable wherever possible. Additionally, please adhere to the project's coding standards and conventions as outlined in the documentation.

The node backedn is in the aithon-backend folder. Please ensure that you follow best practices for Node.js development, including proper error handling, asynchronous programming patterns, and security considerations. Make sure to write clean, maintainable, and well-documented code. Adhere to the project's coding standards and conventions as specified in the documentation.

## Implementation History: Emergency Pickup System (Jan 2026)

### 1. Backend Architecture (Node.js/Mongoose)

**Models Modified:**
- **EmergencyPickup**: 
  - `messageId` made optional.
  - Structure relies on `studentPickups` array containing `notificationHistory` to track parent responses.
- **Student**: 
  - Added `homeLocation` schema: `{ address: String, latitude: Number, longitude: Number }`.
- **Notification**:
  - Acts as the trigger for the parent dashboard, linked to `EmergencyPickup`.

**Service Layer (`emergencyPickupService.js`):**
- **Pending Pickups Logic**: 
  - Query: Fetches Notifications with status `['sent', 'delivered', 'read']`.
  - Transformation: Deep populates `studentId` (with homeLocation), `emergencyPickupId.classId`, and `emergencyPickupId.initiatedBy`.
  - State Resolution: Maps over notifications and looks up the corresponding `notificationHistory` inside the `EmergencyPickup` document to determine if the specific user has `accepted`, `declined`, or is `pending`.

### 2. Frontend / Mobile App (React Native/Expo)

**Parent Dashboard (`parent-dashboard.tsx`):**
- Displays list of active emergency pickups.
- **State Handling**:
  - *Pending*: Shows "I Can Pick Up" (Green) / "I Cannot" (Red).
  - *Accepted*: Shows "📍 View in Map" (Blue).
- **Navigation**:
  - Accepted pickups link to the Map Screen.

**Map Feature (`pickup-map.tsx`):**
- **Library**: `react-native-maps`.
- **Functionality**: Accepts coordinates via route params and displays a marker for the student's home location.

### 3. Testing & Seeding

**Seed Script (`scripts/seedActivePickupForParent.js`):**
- **Purpose**: Generates a complete, valid emergency scenario for testing.
- **Actions**:
  1. Finds existing Parent, Teacher, Class, and Students.
  2. Updates Students with demo `homeLocation` (San Francisco coordinates).
  3. Creates `EmergencyPickup` document with `in_progress` status.
  4. Creates `Notification` documents for each student.
  5. **Critical**: Pushes initial `notificationHistory` entries into the `EmergencyPickup` document to link the notification to the pickup logic.

**Verification**:
- To test the flow, run `npm run seed:pickup` in `aithon-backend-node`.
- Restart server (`npm start`) to apply changes.