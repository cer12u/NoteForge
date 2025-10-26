# Design Guidelines: Obsidian-Style Markdown Note Application

## Design Approach

**Selected Approach:** Reference-Based Design System
**Primary References:** Obsidian, Replit, Linear (for their utility-focused, developer-friendly interfaces)
**Justification:** This is a productivity tool where efficiency, clarity, and distraction-free content creation are paramount. The design must support focused work sessions and quick navigation.

## Core Design Principles

1. **Content-First Philosophy:** The markdown content and editor are the stars; UI chrome should fade into the background
2. **Spatial Clarity:** Clear visual hierarchy through spacing and borders, not colors
3. **Functional Density:** Information-rich interfaces without clutter
4. **Keyboard-Friendly:** All major actions accessible via shortcuts, minimal mouse dependency

## Typography System

**Font Stack:**
- Primary: 'Inter' or 'SF Pro Text' (system fonts via Google Fonts CDN)
- Monospace: 'JetBrains Mono' or 'Fira Code' for code blocks

**Type Scale:**
- Page titles: text-2xl (24px), font-semibold
- Section headers: text-lg (18px), font-medium
- Body text (editor): text-base (16px), font-normal, leading-relaxed (1.625)
- Sidebar items: text-sm (14px), font-normal
- Metadata/timestamps: text-xs (12px), font-normal
- Headings in markdown: Maintain proper hierarchy (h1: text-3xl, h2: text-2xl, h3: text-xl)

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 3, 4, 6, 8 consistently
- Micro spacing (padding within elements): p-2, p-3
- Component spacing: p-4, m-4, gap-4
- Section spacing: p-6, p-8, gap-6
- Page margins: p-8

**Grid Structure:**
- Three-column layout: Sidebar (280px fixed) | Editor (flexible) | Preview/Inspector (360px fixed, toggleable)
- Responsive: Stack to single column on mobile with drawer navigation

**Container System:**
- Full viewport height: h-screen with overflow management
- Sidebar: Fixed width, full height, overflow-y-auto
- Editor: flex-1, centered content with max-w-4xl for optimal reading width
- No forced viewport sections - let content flow naturally

## Component Library

### Navigation & Sidebar

**Left Sidebar Structure:**
- Header section (h-16): User profile, Today button, New note action
- Search bar (h-12): Full-width with keyboard shortcut indicator
- Filter tabs (h-10): "All Notes" | "Starred" toggle
- Folder tree: Collapsible with indent levels (pl-4 per level)
- Note list items (h-10): Title, timestamp, star icon
- Footer (h-12): Settings icon, collapse button

**Sidebar Item States:**
- Default: Subtle border-b divider
- Hover: Slight increase in visual weight
- Active/Selected: Clear visual distinction with border-l-2 accent
- Nested items: Progressive indent with pl-4, pl-8, pl-12

### Editor Components

**Markdown Editor:**
- Full-height textarea with custom styling
- Live formatting indicators (bold, italic, headers visible while typing)
- Line numbers optional (toggle)
- Minimal toolbar (fixed to top when scrolling): Format shortcuts, template insertion
- Word count and character count in footer

**Editor Toolbar (h-12):**
- Left-aligned: Format buttons (H1-H3, Bold, Italic, Code, Link)
- Center: Template dropdown
- Right-aligned: View mode toggle (Edit | Split | Preview), More actions menu

### Page Management

**Folder Component:**
- Expandable/collapsible with chevron icon (transition-transform duration-200)
- Folder name with edit/delete actions on hover
- Drag-and-drop reordering visual feedback (border-2 dashed when dragging over)

**Note Card (in sidebar):**
- Title (font-medium, truncate)
- Timestamp (text-xs, subtle)
- Star button (top-right, size-4 icon)
- Folder badge if applicable

**Template Selector:**
- Modal overlay (backdrop-blur-sm)
- Grid of template cards (grid-cols-2 gap-4)
- Template preview on hover
- "Create New Template" card prominent

### Form Elements

**Input Fields:**
- Text inputs: h-10, px-3, border, rounded-md, focus:ring-2 focus:ring-offset-2
- Textareas: p-3, min-h-32, border, rounded-md
- Search input: with search icon (size-4) prefix, clear button suffix
- Consistent placeholder text style across all inputs

**Buttons:**
- Primary action: px-4, py-2, rounded-md, font-medium
- Secondary action: px-4, py-2, border, rounded-md
- Icon-only buttons: p-2, rounded-md (size-9 total)
- Today button: Prominent in sidebar header, with calendar icon
- Grouped actions: flex gap-2 or gap-3

**Dropdowns/Selects:**
- Trigger: h-10, px-3, border, rounded-md, flex items-center justify-between
- Menu: absolute, mt-1, border, rounded-md, shadow-lg, max-h-60, overflow-auto
- Menu items: px-3, py-2, hover state, keyboard navigation support

### Data Display

**Note Metadata Panel (right sidebar when open):**
- Created date: text-sm
- Modified date: text-sm
- Word count: text-sm
- Tags section: Flex-wrap tag pills (px-2, py-1, rounded, text-xs)
- Linked notes: List with links

**Folder Tree:**
- Recursive structure with consistent indentation
- Chevron icons for expand/collapse (size-4)
- Badge showing note count per folder (text-xs, rounded-full, px-2)

### Overlays & Modals

**Modal Pattern:**
- Centered overlay: fixed inset-0, backdrop blur
- Modal container: max-w-2xl, mx-auto, my-20, border, rounded-lg, shadow-2xl
- Header: px-6, py-4, border-b
- Content: px-6, py-4
- Footer: px-6, py-4, border-t, flex justify-end gap-3

**Toast Notifications:**
- Fixed bottom-right: fixed bottom-4 right-4
- Toast item: px-4, py-3, rounded-md, shadow-lg, border
- Auto-dismiss after 3 seconds
- Stack vertically with gap-2

**Context Menus:**
- Right-click triggered
- Absolute positioning near cursor
- Menu items: px-3, py-2, text-sm, with keyboard shortcuts shown (text-xs)

## Layout Specifications

**Application Shell:**
```
- Header (optional, h-0 - chromeless design)
- Main container: flex h-screen
  - Left sidebar: w-72, border-r
  - Editor area: flex-1, flex flex-col
    - Toolbar: h-12, border-b, flex items-center px-4
    - Editor content: flex-1, overflow-auto, px-8
    - Status bar: h-8, border-t, text-xs, flex items-center px-4
  - Right sidebar (toggleable): w-80, border-l
```

**Responsive Breakpoints:**
- Mobile (<768px): Single column, drawer sidebar
- Tablet (768px-1024px): Two columns, hide right sidebar by default
- Desktop (>1024px): Full three-column layout

## Special Features

**Today Button:**
- Prominent placement in sidebar header
- Calendar icon (size-5) + "Today" label
- Creates/navigates to date-based page (YYYY-MM-DD format)
- Visual indicator if today's page already exists

**Star Functionality:**
- Star icon toggle (outline when unstarred, filled when starred)
- Filter toggle in sidebar to show starred/all
- Starred count badge

**Folder Operations:**
- Create folder: Plus icon in sidebar header
- Drag-and-drop to reorganize (visual drop zones)
- Context menu for rename/delete

**Template System:**
- Template manager: Dedicated section or modal
- Apply template: Dropdown in new note creation
- Template preview before application

## Accessibility Compliance

- All interactive elements: focus-visible ring styles (ring-2, ring-offset-2)
- Keyboard shortcuts displayed prominently (Cmd/Ctrl+K for search, etc.)
- Skip navigation links
- ARIA labels for icon-only buttons
- Semantic HTML structure (nav, main, aside)
- Sufficient contrast ratios for all text

## Images

**No hero images** - This is a utility application focused on productivity. The interface should be immediately functional without marketing imagery.

**Optional favicon/logo:** Small application icon (24x24px) in sidebar header if needed for branding.

## Performance Considerations

- Virtualized lists for large note collections (only render visible items)
- Debounced search and autosave
- Lazy load right sidebar content
- Minimize animation: Only use for state transitions (150-200ms duration)