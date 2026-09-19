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




# EMS PLATFORM — PUBLIC HOME / LANDING PAGE

I already have a working EMS (Employee Management System) application.

The existing authentication, employee management, attendance system, temporary-password flow, and other functionality are already implemented.

I now want to make the EMS feel like a **real professional SaaS product**.

## IMPORTANT

Do NOT rebuild the application.

Do NOT modify or break the existing authentication system.

Do NOT modify the existing employee/employer login logic unless absolutely necessary for routing.

The main change in this task is:

> When someone visits the main EMS URL, they should see a professional public HOME/LANDING PAGE instead of being immediately redirected to login.

---

# CURRENT BEHAVIOR

Currently:

```text
EMS URL
    ↓
Login Page
```

I do NOT want that anymore.

---

# NEW BEHAVIOR

The new flow should be:

```text
EMS URL
    ↓
PUBLIC HOME PAGE
    ↓
User learns about the EMS
    ↓
User clicks "Get Started" / "Sign In"
    ↓
LOGIN SELECTION
    ↓
┌───────────────────────┐
│                       │
│  Employer / Admin     │
│  Login                │
│                       │
└───────────────────────┘

┌───────────────────────┐
│                       │
│  Employee             │
│  Login                │
│                       │
└───────────────────────┘
```

---

# STEP 1 — INSPECT THE CURRENT ROUTING

Before changing anything, inspect the entire frontend routing system.

Determine:

* Current root route
* Current login route
* Employer/admin login route
* Employee login route
* Protected routes
* Dashboard routes
* Authentication redirects
* Middleware
* Route guards
* Existing navigation components

Do NOT guess.

Understand exactly how the current routing works before modifying it.

---

# STEP 2 — CREATE THE PUBLIC HOME PAGE

The root URL should become the public EMS landing page.

For example:

```text
/
```

should display:

```text
EMS Home
```

instead of:

```text
/login
```

The homepage must be accessible without authentication.

---

# DESIGN DIRECTION

I want the homepage to feel like a **modern professional SaaS product**, not a generic template.

It should look polished enough that if someone visits the EMS URL for the first time, they immediately understand:

* What the product is
* Who it is for
* What problem it solves
* Why it is useful
* How attendance works
* How employees and employers interact with it

Do NOT make it look like an AI-generated template.

Use the existing application's design system where possible.

Inspect the existing:

* Colors
* Typography
* Buttons
* Cards
* Shadows
* Border radius
* Icons
* Animations

and maintain visual consistency.

---

# SECTION 1 — NAVBAR

Create a professional navigation bar.

Possible structure:

```text
[ EMS LOGO ]

Home
Features
How It Works
Security
About

                         [ Sign In ]
```

The navigation should be responsive.

On mobile, use an appropriate mobile menu.

The logo/brand should link back to `/`.

---

# SECTION 2 — HERO

The hero should immediately explain the product.

Conceptually:

```text
Modern Employee Management,
Built for Better Workplaces.

Manage employees, attendance,
tasks and workforce activity from
one secure platform.

[ Get Started ]
[ Explore Features ]

                         [ EMS Dashboard Visual ]
```

Do not blindly copy this exact wording if you can improve it.

The copy should be concise and professional.

Avoid exaggerated marketing claims.

---

# HERO VISUAL

Create a polished visual representing the EMS dashboard.

Possible visual:

```text
┌────────────────────────────────────────┐
│ EMS Dashboard                          │
│                                        │
│ Employees     Present     Attendance   │
│    42            35          83%       │
│                                        │
│ Today's Attendance                     │
│                                        │
│ John Doe       Present      8:03 AM    │
│ Sarah Smith    Present      8:07 AM    │
│ David Brown    Break        12:01 PM   │
└────────────────────────────────────────┘
```

This can be a carefully designed UI mockup built with existing frontend components.

Do not use a random stock image if a native UI mockup can look better.

---

# SECTION 3 — WHAT THE EMS DOES

Create a section explaining the core product.

Example:

```text
Everything your workplace needs,
in one place.

Employee Management
Manage employee profiles, roles and access.

Attendance
Track clock-ins, clock-outs and breaks.

Workforce Visibility
Understand attendance and activity.

Secure Access
Role-based access keeps information protected.
```

Use attractive cards with icons.

---

# SECTION 4 — ATTENDANCE FEATURE

This should be one of the major sections because attendance is an important part of this EMS.

Explain the attendance process visually.

For example:

```text
01
Start Attendance
Employer opens an attendance session.

        ↓

02
Employee Verification
Employee verifies their presence.

        ↓

03
Clock In
Attendance is securely recorded.

        ↓

04
Work
Employee continues their workday.

        ↓

05
Clock Out
Workday is completed and recorded.
```

Keep the explanation simple.

---

# SECTION 5 — SECURITY

Create a section explaining the security features that already exist in the application.

Only mention features that are actually implemented.

For example, if currently implemented:

* Secure authentication
* Role-based access
* Temporary employee passwords
* Forced password change
* Attendance verification
* Audit records
* Protected employee information

Do NOT advertise features that do not actually exist.

Before writing this section, inspect the codebase and determine what security features are actually implemented.

---

# SECTION 6 — EMPLOYER EXPERIENCE

Explain what an employer/admin can do.

Example:

```text
For Employers

Manage your workforce from a single dashboard.

✓ Add employees
✓ Manage employee accounts
✓ Monitor attendance
✓ Review attendance records
✓ Manage employee access
✓ View workforce information
```

Only include functionality that actually exists.

---

# SECTION 7 — EMPLOYEE EXPERIENCE

Explain the employee side.

Example:

```text
For Employees

A simple way to manage your workday.

✓ Secure login
✓ Clock in and out
✓ Manage attendance
✓ View your work information
✓ Receive notifications
✓ Update your account
```

Again, only include features that actually exist.

---

# SECTION 8 — HOW IT WORKS

Create a simple three- or four-step section.

For example:

```text
01
Create your workforce

02
Employees receive secure access

03
Track attendance and work activity

04
Manage everything from one dashboard
```

Make this visually interesting.

---

# SECTION 9 — CALL TO ACTION

Near the bottom of the page:

```text
Ready to manage your workforce better?

Start using EMS today.

[ Get Started ]
```

The button should take the user to the login selection screen.

---

# STEP 10 — LOGIN SELECTION PAGE

Create a clean page/interface where users choose how they want to sign in.

For example:

```text
Welcome to EMS

Choose how you want to continue.

┌─────────────────────────────┐
│                             │
│       Employer / Admin      │
│                             │
│ Manage employees,           │
│ attendance and workforce.   │
│                             │
│ [ Employer Login ]           │
│                             │
└─────────────────────────────┘


┌─────────────────────────────┐
│                             │
│          Employee           │
│                             │
│ Access your account,        │
│ attendance and work tools.  │
│                             │
│ [ Employee Login ]           │
│                             │
└─────────────────────────────┘
```

This should be visually polished.

Do NOT create duplicate authentication forms.

The buttons should simply route to the existing login pages.

For example, conceptually:

```text
Employer Login
      ↓
existing employer/admin login

Employee Login
      ↓
existing employee login
```

Use the actual routes discovered during your inspection.

---

# STEP 11 — ROUTING RULES

Implement the routing carefully.

Desired behavior:

### Unauthenticated visitor

```text
/
↓
Public Home
```

### Visitor clicks Get Started

```text
/login
```

or an appropriate login-selection route.

### Visitor chooses Employer

```text
Existing Employer Login
```

### Visitor chooses Employee

```text
Existing Employee Login
```

### Authenticated employer

Keep existing behavior.

### Authenticated employee

Keep existing behavior.

Do NOT break protected routes.

---

# STEP 12 — RESPONSIVE DESIGN

The landing page must work properly on:

* Desktop
* Laptop
* Tablet
* Mobile

Pay particular attention to:

* Navbar
* Hero
* Dashboard visual
* Feature cards
* CTA buttons
* Login-selection cards

No horizontal overflow.

---

# STEP 13 — ANIMATIONS

Use subtle professional animations where the existing stack supports them.

Examples:

* Fade-in
* Slide-up
* Hover effects
* Dashboard card movement
* Section reveal
* Button transitions

Do NOT over-animate the page.

The goal is:

```text
Professional
Modern
Smooth
Clean
```

not:

```text
Everything moving everywhere
```

Reuse existing animation libraries if already installed.

Do not add a large dependency unnecessarily.

---

# STEP 14 — ACCESSIBILITY

Make sure:

* Buttons have meaningful labels.
* Navigation works with keyboard.
* Images have appropriate alt text.
* Color contrast is reasonable.
* Focus states are visible.
* Mobile navigation is usable.

---

# STEP 15 — SEO / PAGE METADATA

Inspect the current framework and metadata setup.

Update the public home page metadata appropriately.

Use a professional title such as:

```text
EMS — Employee Management System
```

and a description explaining the product.

Do not remove existing useful metadata from the application.

---

# STEP 16 — DO NOT INVENT FEATURES

This is extremely important.

Before writing marketing copy, inspect the application.

Do not say:

"AI-powered workforce analytics"

if there is no AI system.

Do not say:

"Biometric facial recognition"

if there is no facial recognition.

Do not say:

"Real-time productivity monitoring"

if that functionality does not exist.

The landing page must accurately represent the current product.

---

# STEP 17 — KEEP EXISTING FUNCTIONALITY INTACT

After implementing the landing page, verify:

* Employer login still works.
* Employee login still works.
* Employee creation still works.
* Employee deletion still works.
* Temporary password flow still works.
* Forced password change still works.
* Attendance still works.
* Clock-in still works.
* Clock-out still works.
* Employer dashboard still works.
* Employee dashboard still works.
* Protected routes still work.
* Logout still works.

---

# STEP 18 — FINAL QUALITY CHECK

Before finishing:

1. Run the application.
2. Open the root URL.
3. Confirm the public home page appears.
4. Click every navigation link.
5. Click Get Started.
6. Confirm login-selection page appears.
7. Test Employer Login navigation.
8. Test Employee Login navigation.
9. Test authenticated routes.
10. Test mobile layout.
11. Check browser console for errors.
12. Check network requests for unexpected failures.

---

# FINAL REPORT

When finished, tell me:

1. What the previous routing flow was.
2. What routing flow you changed it to.
3. What files you created/modified.
4. What sections you added to the home page.
5. What login-selection route you created.
6. Which existing login routes are being reused.
7. Whether any existing functionality was changed.
8. What tests you performed.
9. Any issues or configuration I need to handle manually.

Again:

**Inspect first.**
**Preserve the existing EMS.**
**Build the public landing page around the existing product.**
**Do not rebuild authentication.**
