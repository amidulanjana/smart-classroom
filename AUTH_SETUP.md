# Authentication Setup

## Overview
The Smart Classroom app now has a complete authentication system with JWT tokens, allowing users to login and access protected routes.

## Backend Setup

### Environment Variables
The following variables are configured in `/aithon-backend-node/.env`:
```
JWT_SECRET=aithon_smart_classroom_jwt_secret_key_2024
JWT_EXPIRE=30d
MONGODB_URI=mongodb+srv://...
```

### Authentication Endpoints
All auth endpoints are prefixed with `/api/v1/auth`:

1. **POST /api/v1/auth/register** - Create new user account
   - Body: `{ name, email, password, phone, role }`
   - Returns: `{ user, token }`

2. **POST /api/v1/auth/login** - Login with credentials
   - Body: `{ email, password }`
   - Returns: `{ user, token }`

3. **GET /api/v1/auth/profile** - Get current user profile (protected)
   - Headers: `Authorization: Bearer <token>`
   - Returns: `{ user }`

4. **PUT /api/v1/auth/profile** - Update user profile (protected)
   - Headers: `Authorization: Bearer <token>`
   - Body: `{ name?, phone?, profilePhoto? }`
   - Returns: `{ user }`

5. **PUT /api/v1/auth/push-token** - Update push notification token (protected)
   - Headers: `Authorization: Bearer <token>`
   - Body: `{ pushToken }`
   - Returns: `{ user }`

### Test Users
Run the seed script to create test users:
```bash
cd aithon-backend-node
npm run seed:auth
```

This creates:
- **Teacher**: teacher@school.com / password123
- **Parent**: parent@school.com / password123
- **Admin**: admin@school.com / password123

### Starting the Backend
```bash
cd aithon-backend-node
npm run dev
```

Server runs on: http://localhost:3000

## Frontend Integration

### API Service
The `frontend-two/services/api.ts` file handles all authentication:

```typescript
// Login
const response = await apiService.login(email, password);
// Response: { success, data: { user, token } }

// Register
const response = await apiService.register(name, email, password, phone, role);

// Get Profile (requires login)
const response = await apiService.getProfile();

// Logout
apiService.logout();
```

### Auth Context
The `frontend-two/contexts/AuthContext.tsx` provides global user state:

```typescript
const { user, loading, login, logout } = useAuth();

// Login
await login('teacher@school.com', 'password123');

// Access current user
console.log(user.name, user.role);

// Logout
logout();
```

### Login Screen
Located at `frontend-two/app/login.tsx`:
- Email/password form
- Quick login buttons for testing
- Integrates with AuthContext

## Testing Authentication

### Test Login via curl:
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"teacher@school.com","password":"password123"}'
```

Expected Response:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "...",
      "name": "John Teacher",
      "email": "teacher@school.com",
      "phone": "+1234567890",
      "role": "teacher",
      "profilePhoto": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Test Protected Route:
```bash
TOKEN="your-jwt-token-here"

curl -X GET http://localhost:3000/api/v1/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

## Security Features

1. **Password Hashing**: Uses bcrypt with 10 salt rounds
2. **JWT Tokens**: Signed with secret key, expires in 30 days
3. **Password Hiding**: Password field has `select: false` in User model
4. **Protected Routes**: Auth middleware verifies tokens on protected endpoints
5. **Role-Based Access**: `authorize()` middleware restricts by user role

## Next Steps

### Frontend TODO:
1. Add AsyncStorage for token persistence across app restarts
2. Auto-login on app launch if token exists
3. Handle token expiration and refresh
4. Add registration screen
5. Add loading states during login

### Backend TODO:
1. Add refresh token system
2. Add password reset functionality
3. Add email verification
4. Add rate limiting on login attempts
5. Fix duplicate index warning in User model

## File Structure

### Backend:
```
aithon-backend-node/
├── src/
│   ├── models/User.js           # User model with password hashing
│   ├── controllers/authController.js  # Auth logic
│   ├── middleware/auth.js       # JWT verification middleware
│   ├── routes/authRoutes.js     # Auth endpoints
│   ├── config/config.js         # JWT secret, mongoUri
│   └── scripts/seedAuthUsers.js # Create test users
```

### Frontend:
```
frontend-two/
├── services/api.ts              # API client with auth methods
├── contexts/AuthContext.tsx     # Global user state
└── app/login.tsx                # Login screen
```

## Common Issues

### "Invalid token" error:
- Make sure JWT_SECRET is set in .env
- Check token is being sent in Authorization header
- Verify token hasn't expired

### "User not found" error:
- Run `npm run seed:auth` to create test users
- Check MongoDB connection

### Backend not starting:
- Kill process on port 3000: `lsof -ti :3000 | xargs kill -9`
- Check MongoDB URI in .env
- Run `npm install` to ensure dependencies are installed
