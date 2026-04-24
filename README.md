# Chat Application

A full-stack real-time chat application with authentication, room-based messaging, MongoDB persistence, and a modern React UI.

## Overview

This project is split into two apps:

- **client**: React + Vite frontend
- **server**: Express + Socket.IO backend with MongoDB

Users can register/login, join chat rooms, send live messages, view room history, and delete their own messages.

## Tech Stack

### Frontend

- **React 19** for UI
- **Vite 8** for fast dev/build tooling
- **Axios** for HTTP API calls
- **Socket.IO Client** for real-time communication
- **CSS (custom, responsive)** for styling and animations

### Backend

- **Node.js** runtime
- **Express 5** for REST APIs
- **Socket.IO** for WebSocket-based real-time messaging
- **Mongoose** for MongoDB object modeling
- **bcrypt** for password hashing
- **jsonwebtoken (JWT)** for authentication token generation
- **dotenv** for environment variable loading
- **cors** for cross-origin requests

### Database

- **MongoDB**

### Tooling

- **ESLint 10** for frontend linting
- **@vitejs/plugin-react** for Vite + React integration

## Project Structure

```text
Chat Application/
├─ client/
│  ├─ public/
│  ├─ src/
│  │  ├─ assets/
│  │  ├─ pages/
│  │  │  ├─ Chat.jsx
│  │  │  └─ Login.jsx
│  │  ├─ App.jsx
│  │  ├─ App.css
│  │  ├─ index.css
│  │  ├─ main.jsx
│  │  └─ socket.js
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package.json
│  └─ vite.config.js
└─ server/
   ├─ config/
   │  └─ db.js
   ├─ models/
   │  ├─ Message.js
   │  └─ User.js
   ├─ routes/
   │  ├─ authRoutes.js
   │  └─ messageRoutes.js
   ├─ socket/
   │  └─ socket.js
   ├─ package.json
   └─ server.js
```

## Core Features

- User registration and login
- JWT token issuance on successful login
- Frontend token-based session gating via localStorage
- Room-based real-time chat
- Message persistence in MongoDB
- Message history retrieval by room
- Message deletion with broadcast sync across clients
- Responsive and modern UI for auth + chat pages
- Logout confirmation popup

## API Endpoints

Base backend URL: `http://localhost:5000`

### Auth

- `POST /api/auth/register`
  - Body: `{ username, email, password }`
  - Validates email format and minimum password length
- `POST /api/auth/login`
  - Body: `{ email, password }`
  - Returns: `{ token, username }`

### Messages

- `GET /api/messages/:room`
  - Returns all messages for the room sorted by oldest first

## Socket Events

### Client -> Server

- `join_room` with room string
- `send_message` with `{ room, sender, message, time }`
- `delete_message` with message identifier payload

### Server -> Client

- `receive_message` when a new message is saved
- `message_deleted` when a message is removed (or already deleted fallback)

## Data Models

### User

- `username: String`
- `email: String`
- `password: String` (hashed)

### Message

- `room: String`
- `sender: String`
- `message: String`
- `time: String`
- `createdAt`, `updatedAt` (timestamps)

## Environment Variables

Create a `.env` file inside `server/` with:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
PORT=5000
```

## Getting Started

### 1. Install dependencies

In one terminal:

```bash
cd server
npm install
```

In another terminal:

```bash
cd client
npm install
```

### 2. Run backend

```bash
cd server
node server.js
```

### 3. Run frontend

```bash
cd client
npm run dev
```

### 4. Open app

Visit the Vite URL shown in terminal (usually `http://localhost:5173`).

## Frontend Scripts (client)

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run preview` - preview production build
- `npm run lint` - lint source files

## Notes

- Backend currently has no dedicated `start` script in `server/package.json`; use `node server.js`.
- Server includes handling for `EADDRINUSE` to avoid noisy crashes if the port is already in use.

## Future Improvements

- Add auth middleware to protect message APIs with JWT verification
- Move hardcoded API URLs to environment config
- Add unit/integration tests for routes and socket handlers
- Add pagination/virtualization for large message history
- Add typing indicators and read receipts
