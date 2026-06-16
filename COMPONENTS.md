# Component Registry

This file is the source of truth for all reusable UI components in this project.

**Before building anything new, check here first.** If a component exists or can be adapted, use it. Do not create a new component without updating this file.

---

## How to Use This Registry

- **Before building:** search this file for a component that covers the use case.
- **After building a new component:** add it here before ending the turn.
- **When adapting a component:** note the variant in the entry below.

---

## Components

_No components registered yet. Add entries here as components are built._

---

## Entry Format

```
### ComponentName
- **File:** `src/components/ComponentName.tsx`
- **Purpose:** One sentence describing what it does.
- **Props:** List key props and their types.
- **Variants:** Any visual or behavioral variants (e.g. size, color, state).
- **Usage example:**
  ```tsx
  <ComponentName prop="value" />
  ```
- **Notes:** Any constraints, known limitations, or usage rules.
```
