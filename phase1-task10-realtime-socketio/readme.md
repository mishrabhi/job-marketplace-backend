# Real-Time with Socket.io

This module establishes the real-time communication layer for PlaceMux using Socket.io, providing authenticated WebSocket connections, targeted user notifications, room-based event broadcasting, and reconnect-aware event delivery.

# Core Architecture

The real-time layer focuses on four primary responsibilities:

- **JWT Authentication** — Validates user identity before establishing a Socket.io connection.
- **Direct Notifications** — Sends targeted events to individual connected users.
- **Room Multicasting** — Broadcasts events to all clients subscribed to a specific placement drive room.
- **Reconnect Buffering** — Supports reliable event delivery across temporary client disconnections.

```text
Client
  │
  ▼
Socket.io Connection
  │
  ▼
JWT Authentication
  │
  ├── Invalid Token ──► Connection Rejected
  │
  └── Valid Token
          │
          ▼
    Authenticated Socket
          │
      ┌───┴────────────┐
      │                │
      ▼                ▼
 Direct Events     Room Events
      │                │
      ▼                ▼
 Individual User   Drive Room
```

# Authentication Principles

## JWT-Protected Socket Connection

Clients must provide a valid JWT token before connecting to the Socket.io server.

A test token can be generated using:

```bash
node -e "const jwt = require('jsonwebtoken'); console.log(jwt.sign({ userId: 'user-101', email: 'aarav@university.edu', role: 'STUDENT' }, 'super_secret_jwt_encryption_key_2026_placemux', { expiresIn: '1h' }))"
```

The generated token is then provided to the browser test client before establishing the connection.

```text
JWT Token
   │
   ▼
Socket.io Connection
   │
   ▼
Token Verification
   │
   ├── Invalid ──► Reject Connection
   │
   └── Valid
         │
         ▼
   Authenticated Client
```

# Real-Time Event Model

## Direct Notifications

Direct events target a specific user rather than broadcasting to every connected client.

```text
Backend
   │
   ▼
user-101
   │
   ▼
Connected Socket
   │
   ▼
DIRECT_EVENT
```

## Drive Rooms

Clients can subscribe to a placement drive room.

For example:

```text
drive-google-2026
```

Once subscribed, the client receives events broadcast to that room.

```text
Drive Update
     │
     ▼
drive-google-2026
     │
 ┌───┼────┐
 ▼   ▼    ▼
User A User B User C
```

# Verification Guide

## Step 1 — Open the Test Client

Start the application and open the Socket.io test client:

```text
http://localhost:3000/test-client.html
```

The browser client provides the interface required to authenticate, establish the Socket.io connection, subscribe to drive rooms, and observe incoming events.

# Step 2 — Generate a Test JWT Token

Generate a JWT token using the Node.js command:

```bash
node -e "const jwt = require('jsonwebtoken'); console.log(jwt.sign({ userId: 'user-101', email: 'aarav@university.edu', role: 'STUDENT' }, 'super_secret_jwt_encryption_key_2026_placemux', { expiresIn: '1h' }))"
```

Copy the generated token.

Paste it into the browser test client and click:

```text
Connect
```

### Expected Result

The client establishes an authenticated Socket.io connection.

The JWT contains:

```json
{
  "userId": "user-101",
  "email": "aarav@university.edu",
  "role": "STUDENT"
}
```

# Step 3 — Emit a Direct Notification Event

Send a targeted notification to `user-101`.

```bash
curl -X POST "http://localhost:3000/api/v1/notifications/direct" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user-101",
    "title": "Application Shortlisted!",
    "message": "Congratulations Aarav, you have been shortlisted for Google India!"
  }'
```

### Expected Result

The notification should appear immediately in the connected browser client under:

```text
DIRECT_EVENT
```

Expected event flow:

```text
POST /notifications/direct
          │
          ▼
      user-101
          │
          ▼
   Socket.io Delivery
          │
          ▼
    Browser Client
          │
          ▼
     DIRECT_EVENT
```

# Step 4 — Subscribe to Drive Room & Push Update

In the browser test client, enter:

```text
drive-google-2026
```

Then click:

```text
Subscribe to Drive Room
```

The client is now subscribed to the corresponding Socket.io room.

Trigger a drive update from the terminal:

```bash
curl -X POST "http://localhost:3000/api/v1/notifications/drive-update" \
  -H "Content-Type: application/json" \
  -d '{
    "drive_id": "drive-google-2026",
    "new_status": "ROUND_1_STARTED",
    "announcement": "Online coding assessment is now live. Please start your tests."
  }'
```

### Expected Result

The connected browser clients subscribed to `drive-google-2026` should receive the drive update in real time.

Expected event data:

```json
{
  "drive_id": "drive-google-2026",
  "new_status": "ROUND_1_STARTED",
  "announcement": "Online coding assessment is now live. Please start your tests."
}
```

# Room-Based Event Workflow

```text
POST /notifications/drive-update
              │
              ▼
        Drive Identifier
              │
              ▼
     drive-google-2026 Room
              │
       ┌──────┼──────┐
       ▼      ▼      ▼
    Client  Client  Client
       │      │      │
       └──────┼──────┘
              ▼
       Real-Time Update
```

# Direct vs Room Notifications

| Event Type | Target | Use Case |
| ---------- | ------ | -------- |
| Direct Event | Individual user | Application notifications |
| Room Event | Socket.io room | Placement drive announcements |

# Real-Time Connection Workflow

```text
Browser Client
      │
      ▼
Generate / Provide JWT
      │
      ▼
Socket.io Connect
      │
      ▼
JWT Authentication
      │
      ▼
Authenticated Socket
      │
      ├──────────────► Direct Notification
      │
      ├──────────────► Subscribe to Drive Room
      │
      └──────────────► Receive Room Updates
```

# API Endpoints

| Method | Endpoint | Purpose |
| ------ | -------- | ------- |
| `POST` | `/api/v1/notifications/direct` | Send a targeted real-time notification |
| `POST` | `/api/v1/notifications/drive-update` | Broadcast a placement drive update to subscribed clients |

# Test Client

| Resource | Purpose |
| -------- | ------- |
| `/test-client.html` | Browser-based Socket.io connection and event testing client |

The module provides the foundation for authenticated real-time communication across PlaceMux, allowing individual users and placement-drive participants to receive application and workflow updates without polling the backend repeatedly.