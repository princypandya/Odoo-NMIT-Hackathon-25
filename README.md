# SynergySphere - Team Collaboration Platform MVP

SynergySphere is an intelligent team collaboration platform that acts as a central nervous system for teams, helping them stay organized, communicate better, and work smarter together.

## Features

### Core Features (MVP)
- **User Authentication** - Firebase-based login/signup/password reset
- **Project Management** - Create and manage projects with team members
- **Task Management** - Assign tasks with deadlines and status tracking (To-Do, In Progress, Done)
- **Team Collaboration** - Add team members and manage project access
- **Real-time Communication** - Project-specific chat with Socket.IO
- **Progress Visualization** - Task progress charts and project statistics
- **Notifications** - Real-time notifications for task updates and messages
- **Responsive Design** - Mobile and desktop friendly interface

### Target Pain Points Solved
- ✅ Scattered Information - Centralized project hub
- ✅ Unclear Progress - Visual task tracking and progress charts
- ✅ Resource Confusion - Clear task assignments and member management
- ✅ Deadline Surprises - Due date tracking and notifications
- ✅ Communication Gaps - Integrated project chat and notifications

## Tech Stack

### Frontend (Next.js)
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS v4 + shadcn/ui components
- **Authentication**: Firebase Auth
- **State Management**: React Context + SWR for data fetching
- **Real-time**: Socket.IO Client
- **Charts**: Recharts for progress visualization

### Backend (Node.js)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: Firebase Admin SDK
- **Real-time**: Socket.IO
- **API**: RESTful endpoints with JWT verification

## Project Structure

\`\`\`
synergysphere/
├── frontend/                 # Next.js React app
│   ├── app/                 # App router pages
│   │   ├── auth/           # Authentication pages
│   │   ├── projects/       # Project pages
│   │   └── profile/        # User profile
│   ├── components/         # React components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── Dashboard.tsx   # Main dashboard
│   │   ├── ProjectList.tsx # Project listing
│   │   ├── TaskBoard.tsx   # Kanban task board
│   │   └── ChatBox.tsx     # Real-time chat
│   ├── contexts/          # React contexts
│   │   └── AuthContext.tsx # Firebase auth context
│   └── lib/               # Utilities
│       ├── firebase.ts    # Firebase config
│       └── api.ts         # API client
├── backend/               # Express.js API server
│   ├── models/           # MongoDB schemas
│   │   ├── User.js       # User model
│   │   ├── Project.js    # Project model
│   │   ├── Task.js       # Task model
│   │   └── Message.js    # Chat message model
│   ├── routes/           # API routes
│   │   ├── projects.js   # Project CRUD
│   │   ├── tasks.js      # Task management
│   │   └── messages.js   # Chat messages
│   ├── middleware/       # Express middleware
│   │   └── auth.js       # Firebase token verification
│   ├── config/          # Configuration
│   │   ├── db.js        # MongoDB connection
│   │   └── firebase.js   # Firebase Admin setup
│   └── server.js        # Express server + Socket.IO
└── README.md
\`\`\`

## Setup Instructions

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or Atlas)
- Firebase project with Authentication enabled

### 1. Clone and Install Dependencies

\`\`\`bash
# Install frontend dependencies
npm install

# Install backend dependencies (in separate terminal)
cd backend
npm install
\`\`\`

### 2. Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication with Email/Password
3. Generate a service account key (Project Settings > Service Accounts)
4. Copy the configuration values to your `.env` files

### 3. Environment Configuration

Create `.env.local` in the root directory:
\`\`\`env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_API_URL=http://localhost:5000/api
\`\`\`

Create `backend/.env`:
\`\`\`env
MONGODB_URI=mongodb://localhost:27017/synergysphere
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nyour_private_key\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project.iam.gserviceaccount.com
PORT=5000
\`\`\`

### 4. Database Setup

Start MongoDB locally or use MongoDB Atlas. The application will create collections automatically.

### 5. Run the Application

\`\`\`bash
# Start backend server (terminal 1)
cd backend
npm run dev

# Start frontend development server (terminal 2)
npm run dev
\`\`\`

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

### Authentication
All protected routes require Firebase ID token in Authorization header: `Bearer <token>`

### Projects
- `GET /api/projects` - Get user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/:id/members` - Add team member

### Tasks
- `GET /api/projects/:id/tasks` - Get project tasks
- `POST /api/projects/:id/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Messages
- `GET /api/projects/:id/messages` - Get project messages
- `POST /api/projects/:id/messages` - Send message

### Socket.IO Events
- `joinProject` - Join project room for real-time updates
- `sendMessage` - Send chat message
- `receiveMessage` - Receive chat message
- `taskUpdated` - Task status changed
- `newNotification` - New notification

## Development Workflow

### Git Branching Strategy
\`\`\`bash
# Create feature branch
git checkout -b feature/task-management

# Make changes and commit
git add .
git commit -m "Add task creation functionality"

# Push and create PR
git push origin feature/task-management
\`\`\`

### Code Organization
- Keep components small and focused
- Use TypeScript for type safety
- Follow the existing file structure
- Add comments for complex logic
- Use the existing UI components from shadcn/ui

### Testing Locally
1. Test authentication flow (signup/login/logout)
2. Create a project and add team members
3. Create tasks and update their status
4. Test real-time chat functionality
5. Verify responsive design on mobile

## Deployment

### Frontend (Vercel)
\`\`\`bash
# Deploy to Vercel
npm run build
vercel --prod
\`\`\`

### Backend (Railway/Heroku)
\`\`\`bash
# Deploy backend to your preferred platform
# Make sure to set environment variables
\`\`\`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Troubleshooting

### Common Issues

**Firebase Authentication Errors**
- Verify Firebase configuration in `.env.local`
- Check Firebase project settings
- Ensure Authentication is enabled in Firebase Console

**API Connection Issues**
- Verify backend is running on port 5000
- Check CORS configuration in backend
- Verify API URL in frontend environment variables

**Database Connection Issues**
- Ensure MongoDB is running locally
- Check MongoDB URI in backend `.env`
- Verify network connectivity for MongoDB Atlas

**Socket.IO Connection Issues**
- Check backend Socket.IO configuration
- Verify CORS settings for Socket.IO
- Check browser network tab for WebSocket connections

## License

MIT License - see LICENSE file for details
