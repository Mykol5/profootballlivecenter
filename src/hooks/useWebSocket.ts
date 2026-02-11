// hooks/useWebSocket.ts
// src/hooks/useWebSocket.ts
// src/hooks/useWebSocket.ts
import { useEffect, useCallback, useState } from 'react';
import { socketService } from '@/lib/socket';
import { SocketEventMap } from '@/lib/types';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log('🔄 useWebSocket: Initializing connection...');
    
    const handleConnectionChange = (connected: boolean) => {
      console.log('🔌 Connection status changed:', connected);
      setIsConnected(connected);
    };

    socketService.connect();
    socketService.onConnectionChange(handleConnectionChange);
    setIsConnected(socketService.isConnected());

    return () => {
      console.log('🧹 useWebSocket: Cleaning up...');
      socketService.offConnectionChange(handleConnectionChange);
    };
  }, []);

  const subscribeToMatch = useCallback((matchId: string) => {
    console.log('📡 Subscribing to match:', matchId);
    socketService.subscribeMatch(matchId);
  }, []);

  const unsubscribeFromMatch = useCallback((matchId: string) => {
    console.log('📡 Unsubscribing from match:', matchId);
    socketService.unsubscribeMatch(matchId);
  }, []);

  const joinChat = useCallback((matchId: string, userId: string, username: string) => {
    console.log('💬 Joining chat:', { matchId, userId, username });
    socketService.joinChat(matchId, userId, username);
  }, []);

  const leaveChat = useCallback((matchId: string, userId: string) => {
    console.log('💬 Leaving chat:', { matchId, userId });
    socketService.leaveChat(matchId, userId);
  }, []);

  const sendMessage = useCallback((matchId: string, userId: string, username: string, message: string) => {
    console.log('📤 Sending message:', { matchId, userId, username, message });
    socketService.sendMessage(matchId, userId, username, message);
  }, []);

  const startTyping = useCallback((matchId: string, userId: string, username: string) => {
    socketService.startTyping(matchId, userId, username);
  }, []);

  const stopTyping = useCallback((matchId: string, userId: string) => {
    socketService.stopTyping(matchId, userId);
  }, []);

  const onEvent = useCallback(<T extends keyof SocketEventMap>(
    event: T,
    callback: (data: SocketEventMap[T]) => void
  ) => {
    socketService.on(event, callback);
    return () => socketService.off(event, callback);
  }, []);

  return {
    isConnected,
    subscribeToMatch,
    unsubscribeFromMatch,
    joinChat,
    leaveChat,
    sendMessage,
    startTyping,
    stopTyping,
    onEvent,
  };
}




// import { useEffect, useCallback, useState } from 'react';
// import { socketService } from '@/lib/socket';
// import { SocketEventMap } from '@/lib/types';

// export function useWebSocket() {
//   const [isConnected, setIsConnected] = useState(false);

//   useEffect(() => {
//     const handleConnectionChange = (connected: boolean) => {
//       setIsConnected(connected);
//     };

//     socketService.connect();
//     socketService.onConnectionChange(handleConnectionChange);

//     return () => {
//       socketService.offConnectionChange(handleConnectionChange);
//     };
//   }, []);

//   const subscribeToMatch = useCallback((matchId: string) => {
//     socketService.subscribeMatch(matchId);
//   }, []);

//   const unsubscribeFromMatch = useCallback((matchId: string) => {
//     socketService.unsubscribeMatch(matchId);
//   }, []);

//   const joinChat = useCallback((matchId: string, userId: string, username: string) => {
//     socketService.joinChat(matchId, userId, username);
//   }, []);

//   const leaveChat = useCallback((matchId: string, userId: string) => {
//     socketService.leaveChat(matchId, userId);
//   }, []);

//   const sendMessage = useCallback((matchId: string, userId: string, username: string, message: string) => {
//     socketService.sendMessage(matchId, userId, username, message);
//   }, []);

//   const startTyping = useCallback((matchId: string, userId: string, username: string) => {
//     socketService.startTyping(matchId, userId, username);
//   }, []);

//   const stopTyping = useCallback((matchId: string, userId: string) => {
//     socketService.stopTyping(matchId, userId);
//   }, []);

//   const onEvent = useCallback(<T extends keyof SocketEventMap>(
//     event: T,
//     callback: (data: SocketEventMap[T]) => void
//   ) => {
//     socketService.on(event, callback);
//     return () => socketService.off(event, callback);
//   }, []);

//   return {
//     isConnected,
//     subscribeToMatch,
//     unsubscribeFromMatch,
//     joinChat,
//     leaveChat,
//     sendMessage,
//     startTyping,
//     stopTyping,
//     onEvent,
//   };
// }