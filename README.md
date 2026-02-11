# Live Football Match Center

A real-time football match tracking application with live scores, statistics, and chat functionality.

## Features

### 1. Real-time Match Dashboard
- Live score updates via WebSocket
- Visual distinction between live, upcoming, and finished matches
- Automatic match status updates
- Click to navigate to match detail view

### 2. Match Detail View
- Live score display with team information
- Match timeline showing events (goals, cards, substitutions)
- Real-time statistics updates
- Tabbed interface for events, statistics, and chat

### 3. Match Chat System
- Real-time chat rooms per match
- Typing indicators
- User presence tracking (join/leave notifications)
- Character limit enforcement (500 characters)
- Rate limiting handling

### 4. Robust Connection Handling
- Automatic WebSocket reconnection
- Connection status indicators
- State recovery after reconnection
- Graceful error handling

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript
- **Styling**: Tailwind CSS
- **Real-time**: Socket.IO Client
- **Icons**: React Icons
- **Date Formatting**: date-fns

## Architecture Decisions

### 1. State Management
- Used React's built-in state management for simplicity
- WebSocket events update component state directly
- No external state management library to reduce complexity

### 2. WebSocket Implementation
- Singleton Socket.IO service for single connection
- Event-based subscription system
- Automatic reconnection with exponential backoff
- Cleanup on component unmount

### 3. Component Structure
- Modular, reusable components
- Separation of concerns (UI, logic, data)
- Responsive design with mobile-first approach

### 4. Error Handling
- Graceful degradation on API failures
- User-friendly error messages
- Connection status indicators
- Automatic retry for failed operations

## Trade-offs

### 1. User Authentication
- Implemented simple localStorage-based user IDs
- No full authentication system to meet 24-hour deadline
- Users can manually set usernames (future enhancement)

### 2. Chat History
- Chat messages not persisted between page refreshes
- Focus on real-time experience rather than history
- Could add message persistence with a backend database

### 3. Offline Support
- Limited offline functionality
- Basic connection status indicators
- Could implement service workers for better offline support

### 4. Scalability
- Current implementation suitable for moderate concurrent users
- Socket.IO handles connection pooling
- Could implement Redis for horizontal scaling in production

## Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd football-match-center