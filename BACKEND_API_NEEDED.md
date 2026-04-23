# Backend APIs Needed for Frontend

**Priority**: Medium
**Estimated Time**: 4-6 hours
**Status**: Frontend using MOCK data for these features

---

## 1. Login History API

### GET /users/me/login-history

**Purpose**: Fetch user's login history for security page

**Authentication**: Required (JWT)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "date": "2024-05-16T10:23:45Z",
      "ip": "192.168.1.1",
      "location": "Hanoi, Vietnam",
      "userAgent": "Mozilla/5.0...",
      "status": "success"
    }
  ]
}
```

**Implementation Notes**:
- Use existing `UserLoginHistory` model
- Format `lastSeenAt` as ISO timestamp for `date`
- Combine `city` + `country` for `location`
- Add `status` field (always "success" for now, or track failed attempts)
- Order by `lastSeenAt DESC`
- Limit to last 50 records

**Database Query**:
```typescript
const history = await prisma.userLoginHistory.findMany({
  where: { userId },
  orderBy: { lastSeenAt: 'desc' },
  take: 50,
  select: {
    id: true,
    ip: true,
    userAgent: true,
    city: true,
    country: true,
    lastSeenAt: true,
  }
});

return history.map(h => ({
  id: h.id,
  date: h.lastSeenAt.toISOString(),
  ip: h.ip || 'Unknown',
  location: [h.city, h.country].filter(Boolean).join(', ') || 'Unknown',
  userAgent: h.userAgent || 'Unknown',
  status: 'success'
}));
```

---

## 2. Trusted Devices API

### GET /users/me/trusted-devices

**Purpose**: List user's trusted devices (grouped login history)

**Authentication**: Required (JWT)

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "userAgentHash",
      "device": "MacBook Pro 16\"",
      "browser": "Chrome 120",
      "lastActive": "2024-05-16T10:23:45Z",
      "firstSeen": "2024-01-15T08:00:00Z"
    }
  ]
}
```

**Implementation Notes**:
- Group `UserLoginHistory` by `userAgentHash`
- Parse `userAgent` string to extract device and browser info
- Use library like `ua-parser-js` for parsing
- `lastActive` = most recent `lastSeenAt` for that hash
- `firstSeen` = oldest `lastSeenAt` for that hash

**Database Query**:
```typescript
const devices = await prisma.userLoginHistory.groupBy({
  by: ['userAgentHash'],
  where: { userId },
  _max: { lastSeenAt: true },
  _min: { lastSeenAt: true },
});

// For each device, get one record to extract userAgent
const deviceDetails = await Promise.all(
  devices.map(async (d) => {
    const record = await prisma.userLoginHistory.findFirst({
      where: { userId, userAgentHash: d.userAgentHash },
      select: { userAgent: true }
    });
    
    // Parse userAgent using ua-parser-js
    const parser = new UAParser(record?.userAgent);
    const result = parser.getResult();
    
    return {
      id: d.userAgentHash,
      device: `${result.device.vendor || ''} ${result.device.model || 'Unknown'}`.trim(),
      browser: `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim(),
      lastActive: d._max.lastSeenAt,
      firstSeen: d._min.lastSeenAt,
    };
  })
);
```

### DELETE /users/me/trusted-devices/:userAgentHash

**Purpose**: Remove a trusted device (delete all login history for that hash)

**Authentication**: Required (JWT)

**Response**:
```json
{
  "success": true,
  "message": "Device removed successfully"
}
```

**Implementation**:
```typescript
await prisma.userLoginHistory.deleteMany({
  where: {
    userId,
    userAgentHash: params.userAgentHash
  }
});
```

---

## 3. Notification Settings API

### GET /users/me/notification-settings

**Purpose**: Fetch user's notification preferences

**Authentication**: Required (JWT)

**Response**:
```json
{
  "success": true,
  "data": {
    "success": true,
    "failed": true,
    "dispute": true,
    "payout": false,
    "newMember": true
  }
}
```

**Implementation Options**:

**Option A: Add to User model**
```prisma
model User {
  // ... existing fields
  notifSuccess   Boolean @default(true)
  notifFailed    Boolean @default(true)
  notifDispute   Boolean @default(true)
  notifPayout    Boolean @default(false)
  notifNewMember Boolean @default(true)
}
```

**Option B: Create new model**
```prisma
model UserNotificationSettings {
  id        String  @id @default(cuid())
  userId    String  @unique
  user      User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  success   Boolean @default(true)
  failed    Boolean @default(true)
  dispute   Boolean @default(true)
  payout    Boolean @default(false)
  newMember Boolean @default(true)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

### PATCH /users/me/notification-settings

**Purpose**: Update notification preferences

**Authentication**: Required (JWT)

**Request Body**:
```json
{
  "success": true,
  "failed": false,
  "dispute": true,
  "payout": true,
  "newMember": false
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "success": true,
    "failed": false,
    "dispute": true,
    "payout": true,
    "newMember": false
  }
}
```

**Validation**:
- All fields optional
- All fields must be boolean if provided

---

## 4. Social Login (Future - Low Priority)

### GET /users/me/linked-accounts

**Purpose**: List linked social accounts

**Response**:
```json
{
  "success": true,
  "data": [
    {
      "provider": "google",
      "email": "user@gmail.com",
      "linkedAt": "2024-01-15T08:00:00Z"
    }
  ]
}
```

### POST /auth/:provider/link

**Purpose**: Link a social account (OAuth flow)

**Providers**: google, facebook, apple

**Implementation**: Requires OAuth setup with each provider

---

## Implementation Priority

1. **High Priority** (Needed for Phase 1 completion):
   - None - Phase 1 is complete with MOCK data

2. **Medium Priority** (Nice to have for Phase 2):
   - Login History API (2h)
   - Trusted Devices API (2h)
   - Notification Settings API (2h)

3. **Low Priority** (Phase 3):
   - Social Login APIs (8-12h)

---

## Testing Endpoints

After implementation, test with:

```bash
# Login History
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/users/me/login-history

# Trusted Devices
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/users/me/trusted-devices

# Delete Device
curl -X DELETE -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/users/me/trusted-devices/abc123hash

# Get Notification Settings
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/v1/users/me/notification-settings

# Update Notification Settings
curl -X PATCH -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"success":true,"failed":false}' \
  http://localhost:3000/api/v1/users/me/notification-settings
```

---

## Frontend Integration

Once APIs are ready, update these files:

1. **Login History**: `web/pages/Profile.tsx`
   - Replace `MOCK_LOGIN_HISTORY` with API call
   - Add to `profileSlice.ts` if needed

2. **Trusted Devices**: `web/pages/Profile.tsx`
   - Replace `MOCK_TRUSTED_DEVICES` with API call
   - Implement delete functionality

3. **Notification Settings**: `web/pages/Profile.tsx`
   - Replace local state with API calls
   - Add save button to persist changes

---

**Last Updated**: 2026-04-23
**Status**: Waiting for backend implementation
