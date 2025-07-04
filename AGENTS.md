## AGENTS.md

This file provides instructions for AI agents working in this repository.

### Build, Lint, and Test Commands

- **Install all dependencies:** `npm run install:all`
- **Run frontend & backend dev servers:** `npm run dev`
- **Build frontend:** `npm run build`
- **Run all tests:** `npm test`
- **Run frontend tests:** `cd frontend && npm test`
  - **Run a single frontend test:** `cd frontend && vitest <path/to/test.spec.tsx>`
- **Run backend tests:** `cd backend && npm test`
  - **Run a single backend test:** `cd backend && jest <path/to/test.spec.js>`
- **Lint frontend:** `cd frontend && npm run lint`
- **Type-check frontend:** `cd frontend && npm run type-check`

### Code Style Guidelines

- **Formatting:** Use Prettier for consistent code formatting.
- **Imports:** Organize imports using an import sorter.
- **Types:** Use TypeScript for all new code.
- **Naming Conventions:** Follow standard JavaScript naming conventions (e.g., camelCase for variables and functions, PascalCase for components).
- **Error Handling:** Use try/catch blocks for asynchronous operations and handle errors gracefully.
- **Components:** Create functional components with React Hooks.
- **State Management:** Use React Context or a state management library for global state.
- **API Routes:** Define API routes in the `backend/src/routes` directory.
- **Database:** Use Convex for database operations.
