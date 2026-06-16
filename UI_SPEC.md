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

_No specs defined yet. Add entries here as features are designed._

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
