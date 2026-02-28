# List Pagination Persistence Implementation Guide

## Overview

List pagination preferences are now persisted per-resource. When a user changes the page size (5, 10, 25, 50, 100 items), it's automatically saved to Redux with localStorage persistence and restored when they return to that list view.

## Infrastructure Created

### 1. Redux State (UIState)

- **File**: `src/store/slices/uiSlice.ts`
- **State**: `listPageSizes: Record<string, number>` - maps resource name to saved page size
- **Action**: `setListPageSize({ resource: string, pageSize: number })`
- **Persistence**: Automatically synced with localStorage via `saveState()` helper

### 2. Custom Hook

- **File**: `src/hooks/useListPageSize.ts`
- **Purpose**: Watch URL query parameters for page size changes, automatically save to Redux
- **Usage**: `const savedPageSize = useListPageSize('reservations')`
- **Returns**: Page size from URL, Redux state, or default (10)

### 3. PersistentList Wrapper Component

- **File**: `src/components/UI/PersistentList.tsx`
- **Purpose**: React Admin List wrapper with built-in pagination persistence
- **Props**:
  - `resourceName` (required): e.g., `'reservations'`, `'publications'`, `'users'`
  - `perPage` (optional): Override saved preference
  - All standard `ListProps` from react-admin

## How It Works

1. **User changes page size** in React Admin's pagination UI → URL updates (e.g., `?perPage=25`)
2. **useListPageSize hook** detects URL change → dispatches `setListPageSize` action
3. **Redux state updated** and synced to localStorage
4. **User navigates away and returns** → PersistentList loads saved preference from Redux
5. **List renders** with remembered page size

## Integration Steps

### Option A: Using PersistentList Component (Recommended)

Simply replace `<List>` with `<PersistentList>` and add `resourceName` prop:

**Before:**

```tsx
import { List } from 'react-admin';

export const ReservationList = () => {
  return (
    <List queryOptions={{ meta: { columns: [...] } }}>
      <Datagrid>
        {/* columns */}
      </Datagrid>
    </List>
  );
};
```

**After:**

```tsx
import { List } from 'react-admin';
import { PersistentList } from 'components/UI';

export const ReservationList = () => {
  return (
    <PersistentList resourceName="reservations" queryOptions={{ meta: { columns: [...] } }}>
      <Datagrid>
        {/* columns */}
      </Datagrid>
    </PersistentList>
  );
};
```

### Option B: Manual Integration with useListPageSize

If you need more control, use the hook directly:

```tsx
import { List } from 'react-admin';
import { useListPageSize } from 'hooks';

export const PublicationList = () => {
  const pageSize = useListPageSize('publications');

  return (
    <List perPage={pageSize}>
      <Datagrid>{/* columns */}</Datagrid>
    </List>
  );
};
```

## Resources to Update

Apply PersistentList or useListPageSize to these list views:

### Core Lists (High Priority)

- [ ] `src/resources/reservations/list.tsx` - ReservationList
- [ ] `src/resources/publications/list.tsx` - PublicationList
- [ ] `src/resources/users/clients-list.tsx` - ClientsList

### Dashboard/Analytics Lists (Medium Priority)

- [ ] `src/pages/Dashboard/sections/` - Any list views
- [ ] `src/pages/analytics/Analytics.tsx` - Any list components
- [ ] `src/pages/reports/FinancialReports.tsx` - Any list components

## Example: Updating ReservationList

**File**: `src/resources/reservations/list.tsx`

```tsx
// At top, add to imports:
import { PersistentList } from 'components/UI';

// Replace the List component:
// Change from:
//   <List queryOptions={{ ... }}>
// To:
//   <PersistentList resourceName="reservations" queryOptions={{ ... }}>

export const ReservationList = () => {
  const translate = useTranslate();
  // ... filters setup ...

  return (
    <PersistentList
      resourceName="reservations"
      filters={filters}
      queryOptions={{
        meta: { columns: ['*', 'users(*)', 'reserved_items'] },
      }}
    >
      <Datagrid>{/* existing columns */}</Datagrid>
    </PersistentList>
  );
};
```

## Testing Checklist

After integrating PersistentList to a list view:

- [ ] Page loads with default page size (10 items)
- [ ] User changes page size dropdown → list updates immediately
- [ ] Navigate away from list → return to same resource
- [ ] Verify page size is restored from previous selection
- [ ] Close app entirely → reopen → page size persisted (localStorage)
- [ ] Switch to different resource list → each has independent preference
- [ ] URL shows correct `?perPage=XX` parameter

## Debugging

### Check Redux State

Open Redux DevTools → Look for `ui.listPageSizes` object:

```json
{
  "reservations": 25,
  "publications": 50,
  "users": 10
}
```

### Check localStorage

In browser DevTools → Application → Local Storage → Search for `persist:root` or `ui` state

### Check Hook Output

Add console.log in component:

```tsx
const pageSize = useListPageSize('reservations');
console.log('Current page size:', pageSize); // Should be 10, 25, 50, etc.
```

## Default Values

Predefined page size options available:

```typescript
import { PAGE_SIZE_OPTIONS, DEFAULT_PAGE_SIZE } from 'hooks/useListPageSize';

// PAGE_SIZE_OPTIONS = [5, 10, 25, 50, 100]
// DEFAULT_PAGE_SIZE = 10
```

React Admin's Pagination component will automatically show these options when user clicks the items-per-page selector.

## Notes

- Page size preferences are **per-resource** (reservations ≠ publications)
- Preferences persist across browser sessions via localStorage
- URL parameter takes precedence (so users can also manually set page size via URL)
- Default fallback is 10 items per page
- No performance impact - saves minimal data to localStorage
