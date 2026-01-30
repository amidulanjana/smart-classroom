# API Design - AI Message Classification System

## Overview
RESTful API endpoints for the AI-powered message classification and emergency pickup system.

## Base URL
```
/api/v1
```

## Endpoints

### 1. Messages

#### Send Message
```http
POST /api/v1/messages
```

**Request Body:**
```json
{
  "sender_id": 1,
  "student_id": 5,
  "content": "After-class soccer practice cancelled today due to weather"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message_id": 123,
    "classification": {
      "category": "after_class_cancellation",
      "confidence_score": 0.95
    },
    "workflow_triggered": "emergency_pickup",
    "notifications_sent": 1
  }
}
```

#### Get Message History
```http
GET /api/v1/messages?student_id=5&limit=20
```

### 2. Classifications

#### Get Message Classification
```http
GET /api/v1/classifications/:message_id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message_id": 123,
    "category": "after_class_cancellation",
    "confidence_score": 0.95,
    "classified_at": "2026-01-30T10:30:00Z"
  }
}
```

### 3. Notifications

#### Get Notifications
```http
GET /api/v1/notifications?recipient_id=10&status=sent
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 456,
      "message_id": 123,
      "type": "emergency_pickup",
      "status": "delivered",
      "sent_at": "2026-01-30T10:30:05Z",
      "timeout_at": "2026-01-30T10:35:05Z"
    }
  ]
}
```

#### Mark Notification as Read
```http
PATCH /api/v1/notifications/:id/read
```

### 4. Pickup Confirmations

#### Respond to Pickup Request
```http
POST /api/v1/pickup-confirmations
```

**Request Body:**
```json
{
  "notification_id": 456,
  "guardian_id": 10,
  "response": "accepted"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "confirmation_id": 789,
    "notification_id": 456,
    "response": "accepted",
    "responded_at": "2026-01-30T10:32:00Z",
    "escalation_stopped": true
  }
}
```

### 5. Guardians

#### Get Student Guardians
```http
GET /api/v1/students/:student_id/guardians
```

**Response:**
```json
{
  "success": true,
  "data": {
    "primary": {
      "id": 10,
      "name": "John Doe",
      "phone": "+1234567890",
      "email": "john@example.com"
    },
    "secondary": {
      "id": 11,
      "name": "Jane Doe",
      "phone": "+1234567891"
    },
    "backup_circle": [
      {
        "id": 12,
        "name": "Uncle Bob",
        "priority_order": 1
      }
    ]
  }
}
```

#### Update Guardian Priority
```http
PATCH /api/v1/guardians/:id
```

**Request Body:**
```json
{
  "priority": "secondary",
  "is_active": true
}
```

### 6. Students

#### Get Student Details
```http
GET /api/v1/students/:id
```

#### Create Backup Circle
```http
POST /api/v1/students/:student_id/backup-circle
```

**Request Body:**
```json
{
  "guardian_id": 15,
  "priority_order": 1
}
```

## Webhook Events

### Classification Complete
```json
{
  "event": "message.classified",
  "data": {
    "message_id": 123,
    "category": "after_class_cancellation",
    "timestamp": "2026-01-30T10:30:00Z"
  }
}
```

### Pickup Confirmed
```json
{
  "event": "pickup.confirmed",
  "data": {
    "message_id": 123,
    "guardian_id": 10,
    "student_id": 5,
    "timestamp": "2026-01-30T10:32:00Z"
  }
}
```

### Emergency Escalation
```json
{
  "event": "pickup.escalated",
  "data": {
    "message_id": 123,
    "level": "backup_circle",
    "timestamp": "2026-01-30T10:40:00Z"
  }
}
```

## Error Responses

```json
{
  "success": false,
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Student ID is required"
  }
}
```

## Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error
