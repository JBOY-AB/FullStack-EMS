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
