# EMS Platform — Inspect Existing Codebase and Implement Employee Reset + Temporary Password Flow

You are working on an existing EMS (Employee Management System) application.

**IMPORTANT:** Do NOT rebuild the application from scratch. Do NOT replace the existing architecture unnecessarily. First inspect and understand the existing codebase, then make targeted changes while preserving the current functionality.

## STEP 1 — FULL CODEBASE INSPECTION

Before making any changes, carefully inspect the entire project.

There are two main areas:

* `client/` — frontend
* `server/` — backend

Start by understanding:

### Frontend (`client/`)

Inspect:

* Authentication flow
* Login page/component
* Employee pages
* Employee creation form
* Employee list/table
* Employee deletion functionality
* Dashboard
* API/service files
* Authentication state/context/store
* Routing
* Protected routes
* Forms and validation
* Toast/notification system
* Modal/dialog components
* Existing password-related UI

### Backend (`server/`)

Inspect:

* Server entry point
* Routes
* Controllers
* Models/schemas
* Middleware
* Authentication/JWT implementation
* Password hashing
* Employee creation logic
* Employee deletion logic
* Employee retrieval logic
* Login logic
* Database connection
* API error handling
* Any role/permission system
* Any existing password-change functionality

## STEP 2 — UNDERSTAND THE EXISTING FLOW

Before modifying anything, trace the actual flow.

Specifically determine:

1. How an employee is created.
2. What happens when an employee is saved to the database.
3. How employee records are retrieved.
4. How employees are deleted.
5. Why deleted employees may still appear in the frontend.
6. How an employee logs in.
7. How passwords are currently generated/stored/verified.
8. How authentication tokens/session state are handled.
9. How the frontend knows which user is logged in.
10. Whether there is already a password-change mechanism.

Look for the actual cause of problems instead of creating duplicate functionality.

If there are existing functions/components that can be reused, reuse them.

---

# REQUIREMENT 1 — CLEAR ALL EXISTING EMPLOYEES

I currently have employee records that I created while testing the application.

I want the employee database to be completely clean.

### Goal

Remove ALL existing employee records from the database.

After this is done:

* Employee list should be empty.
* Employee dashboard/count should show zero employees.
* No deleted employees should continue appearing in the UI.
* No stale employee records should remain in the database.
* Employee-related statistics should update correctly.
* The application should behave as though no employees have been created yet.

### IMPORTANT

Do not simply hide the employees from the frontend.

Actually remove the existing employee records from the database.

First inspect the current employee model/collection/table and determine the safest way to clear the existing test employees.

If there are related records that reference employees, inspect those relationships before deleting anything so you don't create broken references or unintended application errors.

Also investigate why the current delete functionality is not making employees disappear.

Fix the actual deletion/data-refresh issue.

For example, determine whether the problem is caused by:

* Backend deletion not actually happening
* Incorrect employee ID being sent
* Wrong API endpoint
* Database query issue
* Frontend state not updating
* Cached/stale data
* Incorrect response handling
* React state management
* Query invalidation/refetch problem

Do NOT assume the cause. Inspect the code and determine it.

---

# REQUIREMENT 2 — TEMPORARY PASSWORD FOR NEW EMPLOYEES

When an employer/coordinator/admin creates a new employee, the system should automatically give that employee a temporary password.

### Employee creation flow

The flow should become:

```text
Employer creates employee
        ↓
System generates temporary password
        ↓
Employee account is created
        ↓
Temporary password is associated with the employee account
        ↓
Employer can see/copy the temporary password
        ↓
Employee logs in using their credentials
        ↓
System detects temporary password
        ↓
Employee is REQUIRED to change password
        ↓
Employee creates a new password
        ↓
Temporary-password status is removed
        ↓
Employee continues normally
```

## Temporary password requirements

The temporary password should:

* Be generated automatically.
* Be sufficiently random.
* Not be something predictable like `123456`.
* Never be stored as plain text in the database.
* Be hashed using the existing password hashing mechanism.
* Only the temporary password itself should be shown to the employer at the appropriate point after employee creation.

If the application already has a secure password-generation utility, reuse it where appropriate.

---

# REQUIREMENT 3 — FORCE PASSWORD CHANGE ON FIRST LOGIN

When an employee logs in for the first time using the temporary password, they MUST be required to change it.

Immediately after successful authentication, the employee should see a modal/pop-up such as:

> **Password Change Required**
>
> You're using a temporary password.
> For security, you must create a new password before continuing.

The employee should then provide:

* New password
* Confirm new password

The employee should NOT be able to simply dismiss the popup and continue using the application.

### Important

The password-change requirement must be enforced by the backend, not only by the frontend.

Do not rely solely on:

```text
if (temporaryPassword) show modal
```

in React.

An employee should not be able to bypass the requirement by manually calling another API endpoint.

The backend should know whether the employee still needs to change their temporary password.

---

# REQUIREMENT 4 — DATABASE DESIGN

Inspect the existing Employee/User model.

If there is no existing field for this functionality, add an appropriate field such as:

```js
mustChangePassword
```

or an equivalent field that fits the existing architecture.

Example concept:

```js
mustChangePassword: true
```

When the employee is first created:

```text
mustChangePassword = true
```

After the employee successfully changes their password:

```text
mustChangePassword = false
```

Use the naming/style already established in the project if another convention is being used.

Do not unnecessarily introduce duplicate fields.

---

# REQUIREMENT 5 — AUTHENTICATION FLOW

Inspect the current login implementation before changing it.

After successful login, the backend should communicate whether the employee must change their password.

For example, the authentication response may contain something equivalent to:

```json
{
  "user": {
    "...": "..."
  },
  "mustChangePassword": true
}
```

Use the existing authentication response structure if one already exists.

Do NOT blindly copy this example if it conflicts with the current architecture.

The frontend should use the actual response from the existing backend.

---

# REQUIREMENT 6 — PASSWORD CHANGE API

If the application already has a secure change-password endpoint, inspect it and modify/reuse it.

If it doesn't exist, create one following the existing route/controller architecture.

The endpoint should:

1. Verify the authenticated employee.
2. Validate the new password.
3. Validate password confirmation where appropriate.
4. Hash the new password.
5. Save the new password.
6. Set the temporary-password flag to false.
7. Return an appropriate success response.

Example conceptual endpoint:

```text
PATCH /api/auth/change-password
```

But use the existing project's API conventions if different.

---

# REQUIREMENT 7 — PREVENT BYPASSING THE PASSWORD CHANGE

This is important.

If:

```text
mustChangePassword === true
```

the employee should not be able to access normal employee functionality before changing their password.

Inspect the current authorization middleware and frontend protected-route system.

Implement the restriction using the existing architecture.

The desired flow is:

```text
Employee Login
      ↓
Authentication succeeds
      ↓
mustChangePassword = true
      ↓
Employee enters password-change flow
      ↓
New password successfully saved
      ↓
mustChangePassword = false
      ↓
Employee gets normal access
```

Do not create a confusing redirect loop.

---

# REQUIREMENT 8 — EMPLOYER EMPLOYEE CREATION UI

After an employer creates an employee successfully, show the temporary password clearly.

For example:

```text
Employee Created Successfully

Name: John Doe
Email: john@example.com

Temporary Password:
X7kP9mQ2

[Copy Password]
[Done]
```

The exact UI should match the existing application's design system.

Do not create an entirely different visual style.

If the application already has a reusable modal/dialog/toast component, use it.

The employer should have an easy way to copy the temporary password.

---

# REQUIREMENT 9 — EMPLOYEE LOGIN EXPERIENCE

When an employee logs in with their temporary password:

```text
Login
 ↓
Authentication
 ↓
Password-change requirement detected
 ↓
Password Change Required modal/page
```

The employee should see a clear message explaining why the password must be changed.

The UI should contain:

```text
New Password
Confirm New Password

[Change Password]
```

Include proper validation.

At minimum:

* Password cannot be empty.
* Confirmation cannot be empty.
* Passwords must match.
* Apply any existing password requirements in the application.

Do not weaken existing password security rules.

---

# REQUIREMENT 10 — AFTER PASSWORD CHANGE

After successfully changing the password:

* Update `mustChangePassword` to false.
* Update the authentication/user state.
* Close the modal or navigate appropriately.
* Allow the employee to continue to the normal employee dashboard.
* Do not force the employee to change the password again on the next login.

The new password should be the only password that works after the change.

The old temporary password should no longer work.

---

# REQUIREMENT 11 — DELETE EMPLOYEE BUG

There is currently a problem where employees that I delete do not disappear correctly.

Investigate this carefully.

Trace:

```text
Delete button
    ↓
Frontend handler
    ↓
API request
    ↓
Backend route
    ↓
Controller
    ↓
Database delete operation
    ↓
API response
    ↓
Frontend state update/refetch
    ↓
Employee list
```

Find exactly where the flow breaks.

Then fix it.

After deleting an employee:

```text
Database → employee is gone
Frontend → employee is removed from the list
Counts → updated
Dashboard → updated
```

Do not require a manual browser refresh to see the deletion.

---

# REQUIREMENT 12 — EMPTY STATE

Because all existing employees will be removed, make sure the employee list handles zero employees properly.

Instead of a broken/blank table, show an appropriate empty state, for example:

```text
No employees yet

Create your first employee to get started.

[Add Employee]
```

Use the application's existing design language.

---

# IMPORTANT IMPLEMENTATION RULES

## DO NOT

* Rebuild the project.
* Replace the authentication system without a reason.
* Replace the database technology.
* Rewrite unrelated components.
* Delete working functionality.
* Create duplicate authentication systems.
* Store passwords in plain text.
* Only implement the temporary-password requirement on the frontend.
* Hide employees instead of deleting them.
* Hardcode temporary passwords.
* Break existing roles/permissions.
* Break the existing employer/admin dashboard.
* Change unrelated UI unnecessarily.

## DO

* Inspect first.
* Understand the current architecture.
* Reuse existing utilities.
* Reuse existing components.
* Reuse existing authentication logic where possible.
* Follow existing naming conventions.
* Follow existing folder structure.
* Keep the implementation clean and maintainable.
* Make the smallest safe changes necessary.
* Handle errors properly.
* Validate API inputs.
* Keep frontend and backend behavior synchronized.

---

# STEP 13 — TEST EVERYTHING

After implementation, test the complete flow.

### Test 1 — Empty employee database

Confirm:

```text
Employees = 0
```

and the UI displays the correct empty state.

### Test 2 — Create employee

Create a new employee.

Confirm:

* Employee is saved.
* Temporary password is generated.
* Password is NOT stored as plain text.
* Employer can see/copy the temporary password.
* `mustChangePassword` is true.

### Test 3 — Employee login

Use:

```text
Employee email
+
Temporary password
```

Confirm login succeeds.

Confirm the password-change requirement appears immediately.

### Test 4 — Attempt to bypass password change

Try accessing normal employee functionality while:

```text
mustChangePassword = true
```

Confirm the employee cannot bypass the password-change requirement.

### Test 5 — Change password

Set a new password.

Confirm:

```text
mustChangePassword = false
```

and the employee gets normal access.

### Test 6 — Login again

Log out.

Login using the new password.

Confirm the forced password-change screen does NOT appear again.

### Test 7 — Old temporary password

Try logging in with the old temporary password.

Confirm it no longer works.

### Test 8 — Delete employee

Create an employee, then delete them.

Confirm:

* Database record is deleted.
* Employee disappears immediately from the UI.
* Employee count updates.
* No manual browser refresh is required.

---

# FINAL RESPONSE AFTER IMPLEMENTATION

When you finish, do NOT just say "done."

Give me a concise implementation summary containing:

1. What you discovered during the frontend/backend inspection.
2. The actual cause of the employee deletion problem.
3. What files you changed.
4. What was added/changed for temporary passwords.
5. How the forced password-change flow works.
6. How the backend prevents bypassing it.
7. How you cleared the existing employees.
8. What tests you ran and whether they passed.
9. Any remaining issues or things I need to configure manually.

**Most important:** Do not make assumptions about the codebase. Inspect `client` and `server` first, understand the existing flow, and then implement these requirements within the current architecture.


# EMS FEATURE — LIVE WEBCAM ATTENDANCE VERIFICATION

You are working on an existing EMS (Employee Management System) with an existing frontend and backend.

The application is already functional.

**DO NOT rebuild the EMS.**
**DO NOT replace the existing authentication or attendance architecture unless absolutely necessary.**

Your task is to first inspect the existing codebase and then add a secure **Live Webcam Attendance Verification** feature to the existing attendance system.

---

# CORE IDEA

When an employee wants to clock in, they should not simply click:

```text
Clock In
```

Instead, the employee should go through a short verification process:

```text
Employee clicks Clock In
        ↓
Attendance session is verified
        ↓
Webcam permission requested
        ↓
Camera opens
        ↓
Employee positions their face inside the camera frame
        ↓
System performs a basic live-person verification
        ↓
A verification image/frame is captured
        ↓
Employee confirms
        ↓
Backend validates the attendance request
        ↓
Attendance is recorded
        ↓
Camera immediately stops
```

The webcam should NOT remain active after verification.

This is a one-time attendance verification feature, NOT continuous employee surveillance.

---

# STEP 1 — INSPECT THE EXISTING PROJECT FIRST

Before writing code, thoroughly inspect:

## CLIENT

Inspect:

* Employee dashboard
* Attendance page
* Clock-in button
* Clock-out button
* Authentication state
* Employee context/store
* API services
* Attendance API calls
* Modal/dialog components
* Toast/notification system
* Existing permissions handling
* Existing camera/media functionality, if any
* Routing
* Protected routes
* Existing UI design system

## SERVER

Inspect:

* Attendance routes
* Attendance controllers
* Attendance model/schema
* Employee/User model
* Authentication middleware
* JWT/session implementation
* Organization/company structure
* Existing attendance validation
* Database structure
* File/image upload system, if any
* Existing audit logging
* Existing notification system

## IMPORTANT

Trace the current attendance flow completely:

```text
Employee
   ↓
Frontend Clock-In
   ↓
API Request
   ↓
Authentication
   ↓
Attendance Controller
   ↓
Database
   ↓
Response
   ↓
Frontend State
```

Understand this before making modifications.

Do not create a second attendance system.

---

# STEP 2 — ATTENDANCE SESSION

Integrate the webcam verification with the existing attendance system.

If the EMS already has a dynamic QR/PIN attendance session, reuse it.

If it does not yet exist, inspect the architecture and implement the minimum required session functionality.

The employer should be able to start an attendance session.

Conceptually:

```text
EMPLOYER DASHBOARD

Attendance Session

[ Start Session ]

Status:
🟢 Active

Today's Code:
4829

Expires in:
00:27
```

The attendance code should expire automatically.

Do not trust the frontend timer.

The backend must determine whether the code/session is valid.

---

# STEP 3 — EMPLOYEE CLOCK-IN EXPERIENCE

Change the existing clock-in experience.

When the employee clicks:

```text
Clock In
```

do NOT immediately create the attendance record.

Instead open a professional verification modal.

Example:

```text
┌─────────────────────────────────────┐
│        Attendance Verification      │
│                                     │
│   We need to verify your presence  │
│   before recording your attendance. │
│                                     │
│          ┌───────────────┐          │
│          │               │          │
│          │   CAMERA      │          │
│          │    PREVIEW    │          │
│          │               │          │
│          └───────────────┘          │
│                                     │
│   Position your face inside frame   │
│                                     │
│          [ Verify Presence ]        │
└─────────────────────────────────────┘
```

Use the browser's standard camera API:

```text
navigator.mediaDevices.getUserMedia()
```

Request video access only when verification starts.

---

# STEP 4 — CAMERA PERMISSION

Handle camera permissions properly.

Possible states:

### Permission granted

Show the live camera preview.

### Permission denied

Show:

```text
Camera access is required for attendance verification.

Please allow camera access in your browser settings
and try again.
```

Do NOT silently fail.

### Camera unavailable

Show an appropriate error:

```text
We couldn't access your camera.

Please make sure:
• Your webcam is connected
• No other application is using it
• Browser camera permission is enabled
```

Provide a retry button.

---

# STEP 5 — LIVE PERSON VERIFICATION

Implement a reasonable first version of liveness verification.

The system should NOT simply capture a static image uploaded by the employee.

The verification should happen from the live camera stream.

For the first implementation, use a lightweight interaction such as:

```text
Look at the camera
        ↓
Blink once
        ↓
Turn your head slightly
        ↓
Verification complete
```

However, do not invent unreliable computer-vision logic yourself if the project does not already contain such functionality.

First inspect whether the existing project has an appropriate face/liveness library.

If a reliable browser-compatible library is required, use a well-maintained solution that works with the project's current frontend stack.

Do not add an enormous machine-learning framework unnecessarily.

---

# IMPORTANT SECURITY RULE

Do NOT claim that basic webcam detection provides perfect identity verification.

The goal of this feature is:

**attendance presence verification**

not:

**government-grade biometric identity verification.**

If actual face recognition is implemented, clearly separate:

* face detection
* liveness detection
* face identity matching

Do not pretend that detecting a face means the system has confirmed the employee's identity.

The employee is already authenticated through the EMS account.

The webcam provides an additional presence signal.

---

# STEP 6 — CAPTURE VERIFICATION IMAGE

Once the verification succeeds, capture a single frame from the live webcam.

The frame should be associated with:

* Employee ID
* Attendance record ID
* Organization/company ID
* Date
* Verification timestamp
* Verification type
* Verification status

Example:

```text
verificationType: "webcam"
verificationStatus: "verified"
verifiedAt: <timestamp>
```

Do NOT store an entire video recording.

Only capture what is necessary for attendance verification.

---

# STEP 7 — PRIVACY

This feature must NOT continuously monitor employees.

After the verification succeeds:

```text
Camera stream
     ↓
STOP
```

Make sure all MediaStream tracks are stopped:

```text
track.stop()
```

The camera indicator should turn off immediately after verification.

Also stop the camera when:

* Modal closes
* User cancels
* User navigates away
* Verification fails
* Component unmounts

Do not leave the webcam running in the background.

---

# STEP 8 — SEND VERIFICATION TO BACKEND

Do not trust the frontend to say:

```text
verificationStatus = verified
```

The backend must validate the attendance request.

The request should contain the appropriate authentication credentials and verification information.

Follow the project's existing API architecture.

Conceptually:

```text
POST /attendance/clock-in
```

or whatever endpoint already exists.

Do NOT create a duplicate endpoint if an existing attendance endpoint can be extended safely.

---

# STEP 9 — BACKEND VALIDATION

Before recording attendance, validate:

### 1. User authentication

Is the employee authenticated?

### 2. Employee status

Is the employee allowed to clock in?

### 3. Attendance session

Is there an active attendance session?

### 4. Session code

If dynamic QR/PIN is being used, is the code/session valid?

### 5. Expiration

Has the attendance session expired?

### 6. Duplicate attendance

Has this employee already clocked in today?

### 7. Verification

Was the webcam verification completed through the expected flow?

### 8. Organization

Does the attendance session belong to the employee's organization?

Only after these validations should the attendance record be created.

---

# STEP 10 — ATTENDANCE RECORD

Extend the existing attendance record only as necessary.

Possible fields:

```text
verificationMethod
verificationStatus
verifiedAt
verificationImage
attendanceSessionId
```

Use the existing naming conventions in the project.

Do NOT duplicate fields that already exist.

Example conceptual record:

```text
Employee:
John Doe

Clock In:
8:04 AM

Verification:
Webcam

Verification Status:
Verified

Verified At:
8:04 AM
```

---

# STEP 11 — EMPLOYER DASHBOARD

Add webcam verification information to the employer's attendance view.

For example:

```text
TODAY'S ATTENDANCE

John Doe
Present

Clocked in:
8:04 AM

Verification:
🟢 Webcam Verified

[View Verification]
```

When the employer clicks:

```text
View Verification
```

show the captured verification image.

Do NOT automatically expose verification images everywhere.

Only authorized employer/admin roles should be able to access them.

---

# STEP 12 — ACCESS CONTROL

Verification images must be protected.

Do NOT make them publicly accessible through something like:

```text
/public/employee-images/
```

if that would expose private employee data.

Use the application's existing authenticated file-access mechanism if one exists.

If the project already uses private cloud storage, reuse it.

If it stores files locally, ensure access is restricted through the backend.

Only authorized users should be able to retrieve attendance verification images.

---

# STEP 13 — RETENTION

Do not store verification images forever by default.

Design the system so the retention period can eventually be configured.

For example:

```text
Verification image retention:
30 days
60 days
90 days
```

Do not automatically implement a destructive cleanup job unless the existing architecture supports scheduled jobs safely.

At minimum, structure the feature so retention can be added later.

---

# STEP 14 — CLOCK-OUT

Do NOT automatically require continuous webcam monitoring during the employee's workday.

For the first version, webcam verification should happen during:

```text
CLOCK IN
```

Optionally support:

```text
CLOCK OUT
```

using the same verification mechanism.

But do NOT make the employee keep their webcam enabled throughout the workday.

---

# STEP 15 — AUDIT LOG

Every successful webcam verification should create an audit event if the EMS already has an audit-log system.

Example:

```text
AUDIT LOG

Employee:
John Doe

Action:
Attendance Clock-In

Verification:
Webcam

Status:
Verified

Time:
8:04 AM
```

Also record failed verification attempts where appropriate.

Do not store unnecessary sensitive information.

---

# STEP 16 — SECURITY AGAINST SIMPLE REPLAY

The system should make it difficult to simply reuse an old verification.

Consider binding the verification request to:

* Current authenticated user
* Current attendance session
* Current verification attempt
* Short expiration window
* Server-generated challenge/nonce if appropriate

The frontend should not be able to reuse an old successful verification request to create another attendance record.

---

# STEP 17 — UI/UX

The UI should feel like a professional modern EMS.

Do not create a generic AI-looking interface.

Use the existing application's:

* Colors
* Typography
* Spacing
* Buttons
* Cards
* Modal system
* Icons
* Toast notifications

The camera modal should clearly communicate each stage:

```text
Preparing camera...
        ↓
Camera ready
        ↓
Position your face
        ↓
Verification in progress...
        ↓
Verification successful
        ↓
Attendance recorded
```

Use clear success/error states.

---

# STEP 18 — IMPORTANT FAILURE CASES

Handle all of these:

### Camera denied

Employee cannot complete webcam verification.

### Camera disconnected

Verification fails gracefully.

### Another application is using the camera

Show a useful error.

### Employee closes modal

Stop camera immediately.

### Employee navigates away

Stop camera immediately.

### Verification fails

Allow retry.

### Attendance session expired

Tell employee to request/scan the current session.

### Employee already clocked in

Do not create another attendance record.

### Network failure

Do not falsely show "Clocked In."

### Backend failure

Do not leave the employee thinking attendance was recorded.

### Duplicate request

Backend should prevent duplicate attendance.

---

# STEP 19 — TEST THE COMPLETE FLOW

After implementation, test:

## Test 1

Employee clicks Clock In.

Expected:

```text
Camera permission requested.
```

## Test 2

Camera permission granted.

Expected:

```text
Live camera preview appears.
```

## Test 3

Employee completes verification.

Expected:

```text
Verification successful.
```

## Test 4

Attendance succeeds.

Expected:

```text
Attendance record created.
```

## Test 5

Camera stops.

Expected:

```text
Webcam indicator turns off.
```

## Test 6

Employee tries to clock in again.

Expected:

```text
Already clocked in.
```

No duplicate record.

## Test 7

Camera permission denied.

Expected:

```text
Clear error.
No attendance created.
```

## Test 8

Attendance session expired.

Expected:

```text
Attendance rejected.
No attendance record created.
```

## Test 9

User tries to manipulate the frontend request.

Expected:

```text
Backend rejects invalid/unverified attendance.
```

## Test 10

Employer views attendance.

Expected:

```text
Webcam Verified
[View Verification]
```

Only authorized employer/admin users should have access to the verification image.

---

# STEP 20 — DO NOT BREAK EXISTING EMS FEATURES

Before finishing, verify that these still work:

* Employee login
* Employer login
* Employee creation
* Employee deletion
* Temporary password
* Forced password change
* Employee dashboard
* Employer dashboard
* Existing attendance
* Clock-out
* Break functionality
* Notifications
* Roles/permissions
* Existing employee management

If any existing feature breaks, fix it before declaring the task complete.

---

# FINAL REPORT

After implementation, give me a concise report containing:

1. What you discovered in the existing attendance architecture.
2. Files you modified.
3. How webcam verification works.
4. Whether you added liveness detection and exactly how.
5. How the backend validates verification.
6. How verification images are protected.
7. How the webcam is stopped after verification.
8. How duplicate/replay attempts are handled.
9. What tests you performed.
10. Any dependency/package you added and why.
11. Any configuration/environment variables I need to provide.
12. Any limitations of the current implementation.

## FINAL IMPORTANT INSTRUCTION

Do not rebuild the EMS.

Do not replace working authentication.

Do not create continuous webcam surveillance.

Do not secretly activate the employee's camera.

The employee must explicitly initiate attendance verification and grant camera permission.

The webcam should only be active for the short verification process and must be stopped immediately afterward.

Inspect first → understand existing architecture → implement → test → report.
