# Quick Start Guide - Testing the Application

**Last Updated**: 2026-04-23
**Status**: Phase 1 Complete ✅

---

## 🚀 Running the Application

### Backend
```bash
cd be
npm install
npm run dev
# Backend runs on http://localhost:3000
```

### Frontend
```bash
cd web
npm install
npm run dev
# Frontend runs on http://localhost:5173
```

---

## 🧪 Testing Checklist

### 1. Registration & Email Verification ✅
1. Go to http://localhost:5173/register
2. Fill in: Name, Email, Password
3. Click "Sign Up"
4. **Expected**: Redirected to `/verify-otp` page
5. Check email for 6-digit code
6. Enter code
7. **Expected**: Redirected to dashboard with verified email

**Backend Flow**:
- POST `/auth/register` → Returns `verification_id`
- Email sent with code
- POST `/auth/verify` with `type: 'email'` → Returns JWT token

---

### 2. Login Verification (New Device) ✅
1. Open **incognito/private window**
2. Go to http://localhost:5173/login
3. Login with existing account
4. **Expected**: Redirected to `/verify-otp` page (if new IP/UserAgent)
5. Check email for 6-digit code
6. Enter code
7. **Expected**: Redirected to dashboard

**Backend Flow**:
- POST `/auth/login` → Detects new device → Returns `verification_id`
- Email sent with warning + code
- POST `/auth/verify` with `type: 'login'` → Returns JWT token

---

### 3. Two-Factor Authentication (2FA) ✅

#### Setup 2FA
1. Login to dashboard
2. Go to Profile → Security Settings
3. Toggle "Configure 2FA" switch
4. **Expected**: Modal opens with QR code
5. Scan QR with Google Authenticator or Authy
6. Enter 6-digit TOTP code
7. **Expected**: Backup codes displayed
8. **IMPORTANT**: Save backup codes!
9. Click "Done"

#### Test 2FA Login
1. Logout
2. Login again
3. **Expected**: Redirected to `/verify-otp` page with 2FA prompt
4. Open authenticator app
5. Enter current 6-digit TOTP code
6. **Expected**: Redirected to dashboard

**Backend Flow**:
- POST `/auth/login` → Returns `temp_token` (not full JWT)
- POST `/auth/2fa` with `temp_token` + TOTP code → Returns JWT token

---

### 4. Password Change ✅
1. Go to Profile → Personal Info
2. Scroll to "Change Password" section
3. Enter: Current Password, New Password, Confirm Password
4. Click "Update Password"
5. **Expected**: Modal opens asking for verification code
6. Check email for 6-digit code
7. Enter code
8. **Expected**: Password changed, modal closes

**Backend Flow**:
- POST `/users/me/change-password/check` → Validates current password
- POST `/users/me/change-password/send-code` → Sends verification code
- POST `/users/me/change-password` → Changes password

---

### 5. Forgot Password ✅
1. Go to http://localhost:5173/login
2. Click "Forgot Password?"
3. Enter email
4. Click "Send Reset Link"
5. Check email for 6-digit code
6. Enter code + new password
7. **Expected**: Password reset, redirected to login

**Backend Flow**:
- POST `/auth/forgot-password` → Sends code
- POST `/auth/reset-password` → Resets password + invalidates sessions

---

### 6. Bank Accounts Management ✅
1. Go to Dashboard → Bank
2. Click "Add Bank"
3. Fill in: Bank, Account Number, Password
4. Click "Save"
5. **Expected**: Bank account created, API token displayed
6. Click "Edit" on any account
7. Modify details
8. Click "Save"
9. **Expected**: Account updated
10. Click "Delete" (trash icon)
11. Confirm deletion
12. **Expected**: Account deleted

---

### 7. Transactions Page ✅
1. Go to Dashboard → Transactions (or `/transactions`)
2. Select a bank account from dropdown
3. **Expected**: Transactions list displayed
4. Try filters: Type (IN/OUT), Amount range
5. Try search
6. Click "Export CSV"
7. **Expected**: CSV file downloaded

---

### 8. Webhooks ✅
1. Go to Dashboard → Webhook
2. Click "Add Webhook"
3. Fill in: URL, select bank account, events
4. Click "Save"
5. Go to "Event Logs" tab
6. Click on any log row
7. **Expected**: Modal opens with request/response details

---

### 9. Support Tickets ✅
1. Go to Dashboard → Support
2. Click "Create Ticket"
3. Fill in: Subject, Category, Description
4. Click "Submit"
5. Click on the ticket row
6. **Expected**: Modal opens with ticket details
7. Type a reply in the text area
8. Click "Send"
9. **Expected**: Reply added to ticket

---

### 10. Notifications ✅
1. Look at top-right corner of dashboard
2. **Expected**: Bell icon with unread count badge
3. Click bell icon
4. **Expected**: Dropdown opens with notifications
5. Click "Mark all as read"
6. **Expected**: Badge disappears

---

## ⚠️ Features Using MOCK Data

These features work in UI but don't persist to backend:

### 1. Notification Settings
**Location**: Profile → Notification Settings
**Status**: Changes not saved (local state only)
**Impact**: Low - Secondary feature

### 2. Login History
**Location**: Profile → Security Settings → Login History
**Status**: Shows static data
**Impact**: Low - Informational only

### 3. Trusted Devices
**Location**: Profile → Security Settings → Trusted Devices
**Status**: Shows static data, delete doesn't work
**Impact**: Low - Informational only

### 4. Linked Accounts
**Location**: Profile → Linked Accounts
**Status**: UI only, no OAuth integration
**Impact**: Low - Future feature

**See `BACKEND_API_NEEDED.md` for API specifications to implement these.**

---

## 🐛 Troubleshooting

### "Network Error" or "Failed to fetch"
- ✅ Check backend is running on http://localhost:3000
- ✅ Check `VITE_API_BASE_URL` in `web/.env`
- ✅ Check browser console for CORS errors

### "Invalid verification code"
- ✅ Check email for latest code (codes expire in 15 minutes)
- ✅ Ensure you're entering 6 digits
- ✅ Try resending code

### 2FA code not working
- ✅ Ensure device time is synced (TOTP requires accurate time)
- ✅ Check you're using the correct account in authenticator app
- ✅ Try using backup codes if available

### Email not received
- ✅ Check spam folder
- ✅ Check backend logs for email queue errors
- ✅ Verify email service is configured in backend `.env`

### Build errors
- ✅ Run `npm install` in both `be/` and `web/`
- ✅ Check Node.js version (should be 18+)
- ✅ Clear `node_modules` and reinstall if needed

---

## 📊 Test Results Template

Use this to track your testing:

```
## Test Results - [Date]

### Registration & Email Verification
- [ ] Registration form works
- [ ] Email received
- [ ] Code verification works
- [ ] Redirected to dashboard

### Login Verification
- [ ] New device detected
- [ ] Email received
- [ ] Code verification works
- [ ] Redirected to dashboard

### 2FA
- [ ] QR code displays
- [ ] Authenticator app scans successfully
- [ ] TOTP code enables 2FA
- [ ] Backup codes displayed
- [ ] 2FA login works
- [ ] Disable 2FA works

### Password Change
- [ ] Current password validated
- [ ] Verification code sent
- [ ] Password changed successfully

### Forgot Password
- [ ] Email sent
- [ ] Code verification works
- [ ] Password reset successfully

### Bank Accounts
- [ ] Create works
- [ ] Edit works
- [ ] Delete works
- [ ] API token displayed

### Transactions
- [ ] List displays
- [ ] Filters work
- [ ] Search works
- [ ] Export CSV works

### Webhooks
- [ ] Create works
- [ ] Edit works
- [ ] Delete works
- [ ] Logs display
- [ ] Log detail modal works

### Support Tickets
- [ ] Create works
- [ ] List displays
- [ ] Detail modal works
- [ ] Reply works

### Notifications
- [ ] Bell icon shows count
- [ ] Dropdown opens
- [ ] Mark as read works
- [ ] Auto-refresh works

### Issues Found
1. [Describe issue]
2. [Describe issue]
```

---

## 🎯 Success Criteria

Application is ready for production when:

- ✅ All verification flows work end-to-end
- ✅ 2FA setup and login work correctly
- ✅ No console errors in browser
- ✅ No TypeScript compilation errors
- ✅ All CRUD operations work
- ✅ Email delivery is reliable
- ✅ Responsive on mobile devices

---

## 📞 Need Help?

### Documentation
- `plan.md` - Complete project roadmap
- `FRONTEND_STATUS.md` - Detailed status report
- `BACKEND_API_NEEDED.md` - Missing API specifications
- `SESSION_SUMMARY.md` - Latest changes summary

### Common Issues
- Check browser console (F12) for errors
- Check backend logs for API errors
- Check network tab for failed requests
- Verify environment variables are set

---

**Happy Testing! 🚀**

If you find any issues, document them with:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser console errors
5. Network request/response
