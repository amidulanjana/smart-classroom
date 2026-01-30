# Database Schema - AI Message Classification System

## Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ MESSAGES : sends
    USERS ||--o{ NOTIFICATIONS : receives
    USERS {
        int id PK
        string name
        string email
        string phone
        enum role "teacher, parent, admin"
        datetime created_at
    }

    STUDENTS ||--o{ MESSAGES : "about"
    STUDENTS ||--o{ GUARDIANS : "has"
    STUDENTS {
        int id PK
        string name
        int class_id
        datetime created_at
    }

    MESSAGES ||--|| MESSAGE_CLASSIFICATIONS : "has"
    MESSAGES ||--o{ NOTIFICATIONS : "triggers"
    MESSAGES {
        int id PK
        int sender_id FK
        int student_id FK
        string content
        datetime sent_at
    }

    MESSAGE_CLASSIFICATIONS {
        int id PK
        int message_id FK
        enum category "after_class_cancellation, item_request, meeting_request, general_update"
        float confidence_score
        datetime classified_at
    }

    GUARDIANS ||--o{ NOTIFICATIONS : receives
    GUARDIANS ||--o{ PICKUP_CONFIRMATIONS : makes
    GUARDIANS {
        int id PK
        int user_id FK
        int student_id FK
        enum priority "primary, secondary, backup"
        int backup_order "null for primary/secondary, 1-3 for backup"
        boolean is_active
    }

    NOTIFICATIONS ||--o| PICKUP_CONFIRMATIONS : "may_have"
    NOTIFICATIONS {
        int id PK
        int message_id FK
        int recipient_id FK
        enum status "sent, delivered, read, timeout"
        enum notification_type "emergency_pickup, item_request, meeting, general"
        datetime sent_at
        datetime timeout_at
    }

    PICKUP_CONFIRMATIONS {
        int id PK
        int notification_id FK
        int guardian_id FK
        enum response "accepted, declined"
        datetime responded_at
    }

    BACKUP_CIRCLES {
        int id PK
        int student_id FK
        int guardian_id FK
        int priority_order "1-3"
        boolean is_active
    }

    STUDENTS ||--o{ BACKUP_CIRCLES : "has"
    BACKUP_CIRCLES }o--|| GUARDIANS : "includes"
```

## Entity Descriptions

### USERS
Core user table for all system users (teachers, parents, admins).

### STUDENTS
Student records linked to guardians and messages.

### MESSAGES
Teacher messages sent through the chat interface.

### MESSAGE_CLASSIFICATIONS
AI classification results for each message with category and confidence.

### GUARDIANS
Links users (parents) to students with priority hierarchy.
- **primary**: First contact
- **secondary**: Second contact if primary unavailable
- **backup**: Backup circle members (3 max)

### NOTIFICATIONS
All notifications sent to parents with status tracking.

### PICKUP_CONFIRMATIONS
Records parent responses to emergency pickup requests.

### BACKUP_CIRCLES
Pre-configured trusted parents for emergency escalation.

## Key Relationships

1. **Message Flow**: USERS → MESSAGES → MESSAGE_CLASSIFICATIONS → NOTIFICATIONS
2. **Escalation Hierarchy**: Primary Guardian → Secondary Guardian → Backup Circle
3. **Student-Guardian**: Many-to-many through GUARDIANS table with priority levels
4. **Emergency Response**: NOTIFICATIONS → PICKUP_CONFIRMATIONS

## Status Enums

### message_classifications.category
- `after_class_cancellation`
- `item_request`
- `meeting_request`
- `general_update`

### guardians.priority
- `primary`
- `secondary`
- `backup`

### notifications.status
- `sent`
- `delivered`
- `read`
- `timeout`

### pickup_confirmations.response
- `accepted`
- `declined`
