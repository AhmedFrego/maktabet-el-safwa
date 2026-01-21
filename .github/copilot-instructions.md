# Copilot Instructions for Maktabet El Safwa

## Project Overview

React-based publication reservation system for Arabic bookstores/libraries. Built with **React Admin**, **Supabase**, **MUI**, and **Redux Toolkit**. All UI and content are in Arabic with RTL support.

## Architecture

### Core Stack

- **React Admin (v5)** - Admin framework providing CRUD operations, routing, and data handling
- **Supabase** - Backend (PostgreSQL + Auth + Storage)
- **MUI v7** - UI components with RTL theming via Emotion + stylis-plugin-rtl
- **Redux Toolkit** - State management for reservations and deletion modes
- **Vite** - Build tool with path aliases
- **TypeScript** - Type-safe with Supabase-generated types

### Application Structure

```
App.tsx → React Admin <Admin> wrapper with:
  - BranchSelector (global)
  - ReservationCreate (floating reservation panel)
  - Layout (Header + Menu)
  - Resources: publications, reservations, users (clients)
```

### Resources Pattern

Resources follow React Admin conventions in `src/resources/`:

- Each resource exports a config object: `{ icon, name, list, edit, create, show }`
- Example: `PublicationResource` in [resource.tsx](src/resources/publications/resource.tsx)
- Components: `list.tsx`, `edit.tsx`, `create.tsx`, `show.tsx`

## Key Conventions

### TypeScript Types

- **Supabase types**: Auto-generated via `npm run gen:types` → `types/supabase-generated.types.ts`
- **Type overrides**: `types/supabase-overrides.types.ts` uses `type-fest` `MergeDeep` to extend generated types
  - Example: `reserved_items: ReservationRecord[]` overrides JSON column to proper type
- **Resource types**: Defined in resource directories (e.g., `publications/types.ts`)
- Use `Tables<'table_name'>`, `Enums<'enum_name'>` helpers from `types/`

### Supabase Data Provider

Custom provider in [lib/supabase.ts](src/lib/supabase.ts) extends `ra-supabase`:

- **Custom filtering**: Supports operators via `@` syntax: `field@ilike`, `field@in`, `field@gt`, etc.
- **Relation filtering**: `or` filter with `.` notation triggers `!inner()` joins
  - Example: `{ or: "cover_type.name.ilike.%test%" }` → auto-adds `cover_types!inner(*)`
- **Column selection**: Pass `meta: { columns: [...] }` in query options for specific fields
- **Users filtering**: Always excludes admins/owners in `getList`

### State Management (Redux)

Two main slices in `store/slices/`:

- **reservationSlice**: Manages cart-like reservation state
  - `reservedItems: ReservationRecord[]` - In-memory cart
  - `isReserving: boolean | 'confirming'` - Enables reservation mode across app
  - Actions: `addOrIncreaseItem`, `removeItem`, `clearReservation`, etc.
- **deletionSlice**: Tracks bulk deletion mode
  - `isDeletingMode: boolean`, `itemsToDelete: string[]`

Use typed hooks: `useAppDispatch()`, `useAppSelector()`

### RTL & Localization

- **Direction**: Always RTL (`direction: 'rtl'` in theme, `dir="rtl"` on `<html>`)
- **Translations**: Arabic messages in [utils/ar.ts](src/utils/ar.ts) - follow React Admin translation keys
- **Theme**: RTL cache with stylis plugin in [theme/theme.ts](src/theme/theme.ts)
- **Typography**: Cairo font, custom breakpoints (sm: 480, md: 700, lg: 1000)
- **Numbers**: Use `toArabicNumerals()` utility for displaying Arabic-Indic numerals

### Path Aliases

Configured in [vite.config.ts](vite.config.ts) - import without `../`:

```ts
import { Component } from 'components';
import { useHook } from 'hooks';
import { supabase } from 'lib';
```

### Component Patterns

- **Barrel exports**: Every directory has `index.ts` re-exporting members
- **Custom components**: Wrapped MUI components in `components/UI/` (PaperBox, Modal, etc.)
- **Form components**: Shared in `components/form/` (ClientInput, CustomCheckBox, StyledForm)
- **React Admin fields**: Use `<TextField>`, `<ReferenceField>`, `<FunctionField>` with `source` prop
- **Record context**: `useRecordContext()` to access current record in React Admin components

## Development Workflows

### Commands

```bash
npm run dev              # Start dev server (Vite)
npm run build            # Production build
npm run gen:types        # Generate Supabase types (requires project-id in script)
npm run lint             # ESLint auto-fix
npm run format           # Prettier format
```

### Environment Setup

Create `.env` with:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_API_KEY=your-anon-key
```

### Database Schema Updates

1. Make changes in Supabase Dashboard
2. Run `npm run gen:types` to update `supabase-generated.types.ts`
3. Update overrides in `supabase-overrides.types.ts` if needed
4. Update resource types to match new schema

### Adding New Resources

1. Create directory in `src/resources/[resource-name]/`
2. Create: `resource.ts`, `list.tsx`, `edit.tsx`, `create.tsx`, `show.tsx`, `types.ts`
3. Export resource config object (icon, name, components)
4. Register in [App.tsx](src/App.tsx): `<Resource {...YourResource} />`
5. Add translations to [utils/ar.ts](src/utils/ar.ts) under `resources.[resource-name]`

## Common Patterns

### Filtering with Relations

```ts
// List component - filter by related field
<List queryOptions={{
  meta: { columns: ['*', 'cover_types(*)'] },
  filter: { 'or': 'cover_types.name.ilike.%غلاف%' }
}}>
```

### Custom Publication Columns

See `publicationsColumns` in [publications/list.tsx](src/resources/publications/list.tsx) - optimizes query by selecting only needed fields.

### Storage URLs

Use constants from [types/constants.ts](src/types/constants.ts):

- `STOREGE_URL` - Base Supabase storage URL
- `DEFAULT_COVER_URL` - Fallback cover image

### Reservation Flow

1. User clicks publication → `addOrIncreaseItem` action
2. App enters reservation mode (`isReserving: true`)
3. `ReservationCreate` modal shows cart
4. On submit: Create reservation record + reserved_items array
5. Clear state with `clearReservation`

## Critical Context

- **Always write Arabic labels** in translations
- **Never hardcode storage URLs** - use `STOREGE_URL` + relative path
- **Test RTL layout** - components should align right
- **Validate type overrides** after schema changes - mismatches cause runtime errors
- **Use React Admin hooks** (`useRecordContext`, `useDataProvider`, `useRedirect`) over direct Supabase calls in components
