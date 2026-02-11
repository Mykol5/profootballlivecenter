// src/lib/socket.ts
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = 'wss://profootball.srv883830.hstgr.cloud';

class SocketService {
  private socket: Socket | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private connectionCallbacks: ((connected: boolean) => void)[] = [];

  connect() {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    console.log('Connecting to WebSocket:', SOCKET_URL);
    
    this.socket = io(SOCKET_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected successfully');
      this.reconnectAttempts = 0;
      this.connectionCallbacks.forEach(cb => cb(true));
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.connectionCallbacks.forEach(cb => cb(false));
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;
      this.connectionCallbacks.forEach(cb => cb(false));
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('✅ Socket reconnected after', attemptNumber, 'attempts');
      this.connectionCallbacks.forEach(cb => cb(true));
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Socket reconnection attempt:', attemptNumber);
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed');
      this.connectionCallbacks.forEach(cb => cb(false));
    });

    // Forward all server events to listeners
    const events = [
      'score_update',
      'match_event',
      'stats_update',
      'status_change',
      'chat_message',
      'user_joined',
      'user_left',
      'typing_indicator',
      'error'
    ];

    events.forEach(event => {
      this.socket?.on(event, (data: any) => {
        console.log(`📨 Received ${event}:`, data);
        this.emitToListeners(event, data);
      });
    });
  }

  subscribeMatch(matchId: string) {
    if (!this.socket?.connected) {
      console.warn('Cannot subscribe: Socket not connected');
      return;
    }
    console.log('Subscribing to match:', matchId);
    this.socket.emit('subscribe_match', { matchId });
  }

  unsubscribeMatch(matchId: string) {
    if (!this.socket?.connected) {
      console.warn('Cannot unsubscribe: Socket not connected');
      return;
    }
    console.log('Unsubscribing from match:', matchId);
    this.socket.emit('unsubscribe_match', { matchId });
  }

  joinChat(matchId: string, userId: string, username: string) {
    if (!this.socket?.connected) {
      console.warn('Cannot join chat: Socket not connected');
      return;
    }
    console.log('Joining chat room:', { matchId, userId, username });
    this.socket.emit('join_chat', { matchId, userId, username });
  }

  leaveChat(matchId: string, userId: string) {
    if (!this.socket?.connected) {
      console.warn('Cannot leave chat: Socket not connected');
      return;
    }
    console.log('Leaving chat room:', { matchId, userId });
    this.socket.emit('leave_chat', { matchId, userId });
  }

  sendMessage(matchId: string, userId: string, username: string, message: string) {
    if (!this.socket?.connected) {
      console.warn('Cannot send message: Socket not connected');
      return;
    }
    if (message.length > 500) {
      console.warn('Message too long:', message.length);
      return;
    }
    console.log('Sending message:', { matchId, userId, username, message });
    this.socket.emit('send_message', { matchId, userId, username, message });
  }

  startTyping(matchId: string, userId: string, username: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('typing_start', { matchId, userId, username });
  }

  stopTyping(matchId: string, userId: string) {
    if (!this.socket?.connected) return;
    this.socket.emit('typing_stop', { matchId, userId });
  }

  on<T>(event: string, callback: (data: T) => void) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback as Function);
  }

  off<T>(event: string, callback: (data: T) => void) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback as Function);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  onConnectionChange(callback: (connected: boolean) => void) {
    this.connectionCallbacks.push(callback);
  }

  offConnectionChange(callback: (connected: boolean) => void) {
    const index = this.connectionCallbacks.indexOf(callback);
    if (index > -1) {
      this.connectionCallbacks.splice(index, 1);
    }
  }

  private emitToListeners(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  isConnected() {
    return this.socket?.connected || false;
  }
}

export const socketService = new SocketService();



// // lib/socket.ts
// import { io, Socket } from 'socket.io-client';
// import { SocketEventMap } from './types';

// const SOCKET_URL = 'wss://profootball.srv883830.hstgr.cloud';

// class SocketService {
//   private socket: Socket | null = null;
//   private listeners: Map<string, Function[]> = new Map();
//   private reconnectAttempts = 0;
//   private maxReconnectAttempts = 5;
//   private connectionCallbacks: ((connected: boolean) => void)[] = [];

//   connect() {
//     if (this.socket?.connected) return;

//     this.socket = io(SOCKET_URL, {
//       transports: ['websocket'],
//       reconnection: true,
//       reconnectionAttempts: this.maxReconnectAttempts,
//       reconnectionDelay: 1000,
//     });

//     this.setupEventListeners();
//   }

//   private setupEventListeners() {
//     if (!this.socket) return;

//     this.socket.on('connect', () => {
//       console.log('Socket connected');
//       this.reconnectAttempts = 0;
//       this.connectionCallbacks.forEach(cb => cb(true));
//     });

//     this.socket.on('disconnect', () => {
//       console.log('Socket disconnected');
//       this.connectionCallbacks.forEach(cb => cb(false));
//     });

//     this.socket.on('connect_error', (error) => {
//       console.error('Socket connection error:', error);
//     });

//     // Forward all server events to listeners
//     const events: (keyof SocketEventMap)[] = [
//       'score_update',
//       'match_event',
//       'stats_update',
//       'status_change',
//       'chat_message',
//       'user_joined',
//       'user_left',
//       'typing_indicator',
//       'error'
//     ];

//     events.forEach(event => {
//       this.socket?.on(event, (data: any) => {
//         this.emitToListeners(event, data);
//       });
//     });
//   }

//   subscribeMatch(matchId: string) {
//     this.socket?.emit('subscribe_match', { matchId });
//   }

//   unsubscribeMatch(matchId: string) {
//     this.socket?.emit('unsubscribe_match', { matchId });
//   }

//   joinChat(matchId: string, userId: string, username: string) {
//     this.socket?.emit('join_chat', { matchId, userId, username });
//   }

//   leaveChat(matchId: string, userId: string) {
//     this.socket?.emit('leave_chat', { matchId, userId });
//   }

//   sendMessage(matchId: string, userId: string, username: string, message: string) {
//     this.socket?.emit('send_message', { matchId, userId, username, message });
//   }

//   startTyping(matchId: string, userId: string, username: string) {
//     this.socket?.emit('typing_start', { matchId, userId, username });
//   }

//   stopTyping(matchId: string, userId: string) {
//     this.socket?.emit('typing_stop', { matchId, userId });
//   }

//   on<T extends keyof SocketEventMap>(event: T, callback: (data: SocketEventMap[T]) => void) {
//     if (!this.listeners.has(event)) {
//       this.listeners.set(event, []);
//     }
//     this.listeners.get(event)?.push(callback as Function);
//   }

//   off<T extends keyof SocketEventMap>(event: T, callback: (data: SocketEventMap[T]) => void) {
//     const callbacks = this.listeners.get(event);
//     if (callbacks) {
//       const index = callbacks.indexOf(callback as Function);
//       if (index > -1) {
//         callbacks.splice(index, 1);
//       }
//     }
//   }

//   onConnectionChange(callback: (connected: boolean) => void) {
//     this.connectionCallbacks.push(callback);
//   }

//   offConnectionChange(callback: (connected: boolean) => void) {
//     const index = this.connectionCallbacks.indexOf(callback);
//     if (index > -1) {
//       this.connectionCallbacks.splice(index, 1);
//     }
//   }

//   private emitToListeners(event: string, data: any) {
//     const callbacks = this.listeners.get(event);
//     if (callbacks) {
//       callbacks.forEach(callback => callback(data));
//     }
//   }

//   disconnect() {
//     if (this.socket) {
//       this.socket.disconnect();
//       this.socket = null;
//     }
//   }

//   isConnected() {
//     return this.socket?.connected || false;
//   }
// }

// export const socketService = new SocketService();