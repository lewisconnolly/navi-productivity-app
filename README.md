# Navi - Productivity Companion

A minimalist productivity PWA built with React, TypeScript, and Firebase.

## Features

- **Task Lists** - Create and manage multiple task lists
- **Active Task Tracking** - Focus on one task at a time with progress visualization
- **Notes** - Quick note-taking alongside tasks
- **Offline Support** - Works offline with IndexedDB caching
- **PWA** - Installable on mobile and desktop
- **Auth** - Email/password authentication via Firebase

## Tech Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- Zustand (state management)
- Firebase (Auth + Firestore)

## Getting Started

```bash
npm install
cp .env.local.example .env.local  # Add your Firebase config
npm run dev
```

## Building

```bash
npm run build
npm run preview
```

## To do
- [] Make task list scrollable when tasks overflow viewport
- [] Multiple active lists
- [] Collaborative lists
