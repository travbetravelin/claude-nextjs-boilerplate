# UI/UX Behavior Spec

This file defines the behavioral contracts for all interactive elements in this project.

**Before building or modifying any interactive element, its spec must exist here.** If it does not, define it first — never infer behavior.

---

## How to Use This Spec

- **Before building:** find the relevant element spec below and implement exactly what is defined.
- **If a spec is missing:** stop and define it here before writing any code.
- **After defining a new spec:** add it to this file before ending the turn.

---

## Screens & Features

### Login (`/login`)

**Purpose:** Sign in with email and password; request a password-reset email.

#### Data Entry Fields

| Field | Type | Required | Validation | Error Message | Placeholder | Default |
|---|---|---|---|---|---|---|
| Email | email | Yes | Valid email format | "That email and password don't match. Check both and try again." (combined, on failed sign-in) | — | — |
| Password | string | Yes | Non-empty | Same combined message | — | — |

#### Buttons

| Label | Action | States | Destructive? |
|---|---|---|---|
| Sign in | Submits credentials | default, loading ("Signing in…") | No |
| Forgot? | Switches to the reset-request form | default | No |
| Email me a reset link | Sends reset email | default, loading ("Sending…") | No |

#### Error State
Auth errors are mapped to plain sentences by error code — a raw provider
string is never shown. A deactivated (banned) account shows its own card:
> "This account is deactivated. Your login was turned off by an admin…"

The sent-state deliberately does not confirm the account exists
("If **email** has an account, a reset link is on its way") — don't
"fix" it to be more specific; that would leak which emails are registered.

### Reset password (`/reset`)

**Purpose:** Landing page for the reset email's recovery link; sets a new password.

#### Data Entry Fields

| Field | Type | Required | Validation | Error Message | Placeholder | Default |
|---|---|---|---|---|---|---|
| New password | string | Yes | Min 8 chars | "Password must be at least 8 characters." | — | — |
| Confirm new password | string | Yes | Must match | "Those passwords don't match." | — | — |

#### Buttons

| Label | Action | States | Destructive? |
|---|---|---|---|
| Save new password | Updates password, signs in, goes to `/` | default, loading ("Saving…") | No |
| Back to sign in | Returns to `/login` | default | No |

#### Error State
While the recovery code exchanges: "Checking your reset link…". If no
session materializes within 3 seconds: "This link didn't work — it may have
expired or already been used…" with a button back to sign-in.

### Home (`/`)

**Purpose:** Starter page demonstrating the design system; replace with the project's first real screen (and replace this spec entry when you do).

#### Buttons

| Label | Action | States | Destructive? |
|---|---|---|---|
| Sign out | Ends the session, returns to `/login` | default, loading ("Signing out…") | No |
| Light / Dark / System | Sets the theme | selected/unselected chips | No |

#### Empty State
> "Nothing has been built yet."

---

## Entry Format

```
### [Screen or Feature Name]

**Purpose:** What this screen/feature allows the user to do.

#### Data Entry Fields

| Field | Type | Required | Validation | Error Message | Placeholder | Default |
|---|---|---|---|---|---|---|
| Field Name | string | Yes | Max 100 chars | "Field Name is required." | "Enter a value..." | — |

#### Buttons

| Label | Action | States | Destructive? |
|---|---|---|---|
| Save | Submits the form | default, loading, success, error | No |
| Delete | Removes the record | default, loading | Yes — requires confirmation dialog |

#### Modals / Dialogs

| Dialog | Trigger | Dismiss | Unsaved State |
|---|---|---|---|
| Delete confirmation | Clicking "Delete" | X button or Cancel | N/A |

#### Empty State
> "No [items] yet. [Call to action]."

#### Error State
> "Something went wrong. [What to do next]."
```
