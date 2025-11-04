# **App Name**: StudyVerse

## Core Features:

- User Authentication: Secure user authentication using Firebase Auth, supporting email/password and Google login. On login, fetch user role from Firestore.
- Focus Mode: Lofi/Spotify music player with Pomodoro timer, storing focus session data in Firestore.
- Smart Study Planner: Kanban-style task management with CRUD operations and completion graph trends, data stored in Firestore.
- Notes & PDF Hub: Centralized hub for uploading, sharing, and summarizing notes and PDFs using AI.
- AI Study Mentor: Chat UI providing context-aware study advice and motivation using OpenAI API. This tool is a study advice resource for students. User chat history saved in Firestore.
- Collaboration Chat Rooms: Real-time group chat for study collaboration, with topic-based study rooms. Shows online users based on active sessions and room invites are supported.
- Admin Dashboard: Admin panel with analytics, user management, and content moderation capabilities. Includes role-based access control.

## Style Guidelines:

- Primary color: Deep purple (#6A1B9A) for a modern and focused atmosphere.
- Background color: Dark slate (#2C3E50) for a sophisticated and distraction-free interface.
- Accent color: Teal (#008080) to highlight key interactive elements.
- Body and headline font: 'Inter' (sans-serif) for a clean and readable experience.
- Note: currently only Google Fonts are supported.
- Use consistent and minimalist icons for navigation and features.
- Employ a glassmorphism design with frosted blur backgrounds and shadowed cards for a modern, layered look.
- Subtle Framer Motion animations for smooth page transitions and hover effects.
## V-1.1.0