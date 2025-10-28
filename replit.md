# NoteMark - Markdown Note Application

## Overview

NoteMark is an Obsidian-style markdown note-taking application built with React and Express. The application provides a distraction-free, productivity-focused interface for creating, organizing, and managing markdown notes with features like folder organization, favorites, and real-time preview capabilities.

## Recent Changes (October 28, 2025)

**Cursor Alignment Fix in Hybrid Mode**
- Fixed cursor position misalignment issue in hybrid mode by replacing `marked.parse()` with a lightweight token-based renderer
- Implemented custom Markdown tokenizer that preserves fixed line metrics:
  - Detects inline decorations: bold (`**text**`), italic (`*text*`), code (`` `text` ``), strikethrough (`~~text~~`)
  - Detects heading markers (`# ## ###`) and list markers (`- * 1.`)
  - Maintains equal-width font (`font-mono`) and consistent line height across all rendering
- Updated rendering strategy:
  - Background layer: `<pre>` element with tokenized inline decorations (no font-size changes)
  - Foreground layer: Transparent textarea with same font and line height
  - Both layers now perfectly aligned with no cursor position drift
- Heading styling without font-size changes:
  - Heading markers (#, ##, ###): subtle gray color (`text-muted-foreground`)
  - Heading content: bold + primary color (`text-primary font-bold`)
  - Visually distinct from paragraphs while maintaining alignment
- List styling: markers shown in subtle gray, content remains normal weight
- Added scroll synchronization between background and foreground layers
- Verified with e2e tests: cursor position remains accurate across headings, lists, code blocks, long paragraphs, and blank lines

**Previous Changes (October 27, 2025)**
- Switched from HTML storage to native Markdown storage to preserve original Markdown syntax
- Implemented three view modes: Edit, Hybrid (Obsidian-style), and Preview
- Used `react-markdown` with `remark-gfm` for preview mode rendering
- Toolbar button cycles through all three modes (Edit → Hybrid → Preview → Edit)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React 18 with TypeScript for type safety and modern development
- Vite as the build tool and development server for fast HMR and optimized builds
- Wouter for lightweight client-side routing (instead of React Router)

**UI Component Library**
- shadcn/ui components built on Radix UI primitives for accessible, customizable components
- Tailwind CSS with custom design tokens following a "New York" style variant
- Component system emphasizes utility-focused, developer-friendly interfaces inspired by Obsidian, Replit, and Linear

**Design Philosophy**
- Content-first approach where markdown editor is the primary focus
- Spatial clarity through spacing and borders rather than colors
- Keyboard-friendly interface with minimal mouse dependency
- Three-column layout: Sidebar (280px) | Editor (flexible) | Preview/Inspector (360px, toggleable)
- Responsive design that stacks to single column on mobile with drawer navigation

**State Management**
- TanStack Query (React Query) for server state management and data fetching
- Local component state for UI interactions
- Custom hooks for theme management and mobile detection

**Editor Implementation**
- Native Markdown editor with three view modes:
  - **Edit Mode**: Full Markdown source editing in textarea
  - **Hybrid Mode**: Obsidian-style editing where cursor line shows Markdown source, other lines show formatted preview
  - **Preview Mode**: Read-only formatted Markdown preview
- `marked` library for inline Markdown to HTML conversion (hybrid mode)
- `react-markdown` with `remark-gfm` for full document rendering (preview mode)
- Markdown toolbar with formatting buttons (bold, italic, headings, lists, etc.)
- Data stored as native Markdown text (not HTML) to preserve original syntax

**Typography System**
- Primary font: Inter or SF Pro Text (system fonts via Google Fonts CDN)
- Monospace: JetBrains Mono or Fira Code for code blocks
- Hierarchical type scale from text-xs to text-3xl with consistent spacing

### Backend Architecture

**Server Framework**
- Express.js with TypeScript for API routes
- Custom middleware for request logging and JSON response capture
- Modular route registration system

**Server-Side Rendering Setup**
- Vite middleware integration for development hot module replacement
- Custom Vite plugins for Replit-specific features (error overlay, cartographer, dev banner)

**Storage Layer**
- Abstract storage interface (IStorage) allowing multiple implementations
- Currently implemented with in-memory storage (MemStorage) for development
- Designed to support database persistence through interface implementation

**API Architecture**
- RESTful API design with `/api` prefix for all application routes
- Centralized error handling and response formatting
- Request/response logging with duration tracking

### Data Storage Solutions

**Database Configuration**
- Drizzle ORM for type-safe database operations
- PostgreSQL as the target database (via Neon serverless)
- Schema-first approach with Drizzle migrations
- WebSocket support via `ws` package for Neon's serverless connections

**Schema Design**
- User management with username/password authentication
- UUID-based primary keys with PostgreSQL's `gen_random_uuid()`
- Zod schema validation for runtime type checking and API validation

**Data Models**
- Users: id, username, password
- Schema extensible for notes, folders, and metadata (not yet implemented in database)

### Authentication & Authorization

**Current Implementation**
- User schema defined with username/password fields
- Storage interface includes user CRUD operations
- Authentication mechanism not yet fully implemented (prepared infrastructure)

**Design Considerations**
- Session-based authentication planned (credentials: "include" in fetch calls)
- Password storage will require hashing (implementation pending)

### External Dependencies

**UI & Component Libraries**
- @radix-ui/* family: Accessible component primitives (accordion, dialog, dropdown, popover, etc.)
- class-variance-authority: Type-safe component variants
- tailwindcss: Utility-first CSS framework
- lucide-react: Icon system

**Editor & Markdown**
- marked: Markdown parser and compiler for inline rendering
- react-markdown: Markdown rendering for full document preview
- remark-gfm: GitHub Flavored Markdown support (tables, task lists, strikethrough)

**Data & State Management**
- @tanstack/react-query: Async state management
- react-hook-form: Form state and validation
- @hookform/resolvers: Form validation resolver library
- zod: Schema validation

**Database & ORM**
- drizzle-orm: TypeScript ORM
- drizzle-kit: Migration and schema management
- @neondatabase/serverless: Neon PostgreSQL serverless driver
- ws: WebSocket support for Neon connections

**Development & Build Tools**
- vite: Build tool and dev server
- @vitejs/plugin-react: React integration for Vite
- typescript: Type checking
- tsx: TypeScript execution for Node.js
- esbuild: Production bundler for server code
- @replit/vite-plugin-*: Replit-specific development plugins

**Utilities**
- wouter: Lightweight routing
- clsx + tailwind-merge: Conditional class name utilities
- nanoid: Unique ID generation