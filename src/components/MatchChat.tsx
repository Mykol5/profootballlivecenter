'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { useWebSocket } from '@/hooks/useWebSocket';
import { FaPaperPlane, FaUserCircle } from 'react-icons/fa';

interface ChatMessage {
  matchId: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
}

interface TypingUser {
  userId: string;
  username: string;
}

interface MatchChatProps {
  matchId: string;
  userId: string;
  username: string;
}

export default function MatchChat({ matchId, userId, username }: MatchChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [users, setUsers] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const {
    joinChat,
    leaveChat,
    sendMessage,
    startTyping,
    stopTyping,
    onEvent,
    isConnected,
  } = useWebSocket();

  useEffect(() => {
    joinChat(matchId, userId, username);

    const unsubscribeMessage = onEvent('chat_message', (data) => {
      setMessages(prev => [...prev, data]);
    });

    const unsubscribeUserJoined = onEvent('user_joined', (data) => {
      setUsers(prev => [...prev, data.username]);
    });

    const unsubscribeUserLeft = onEvent('user_left', (data) => {
      setUsers(prev => prev.filter(user => user !== data.username));
    });

    const unsubscribeTyping = onEvent('typing_indicator', (data) => {
      if (data.isTyping && data.userId !== userId) {
        setTypingUsers(prev => {
          const exists = prev.find(user => user.userId === data.userId);
          if (exists) return prev;
          return [...prev, { userId: data.userId, username: data.username }];
        });
      } else {
        setTypingUsers(prev => prev.filter(user => user.userId !== data.userId));
      }
    });

    return () => {
      leaveChat(matchId, userId);
      unsubscribeMessage();
      unsubscribeUserJoined();
      unsubscribeUserLeft();
      unsubscribeTyping();
    };
  }, [matchId, userId, username, joinChat, leaveChat, onEvent]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    if (e.target.value.trim()) {
      startTyping(matchId, userId, username);
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(matchId, userId);
      }, 2000);
    } else {
      stopTyping(matchId, userId);
    }
  };

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || input.length > 500) return;
    
    sendMessage(matchId, userId, username, input.trim());
    setInput('');
    stopTyping(matchId, userId);
  }, [input, matchId, userId, username, sendMessage, stopTyping]);

  const getTypingText = () => {
    if (typingUsers.length === 0) return null;
    if (typingUsers.length === 1) return `${typingUsers[0].username} is typing...`;
    if (typingUsers.length === 2) return `${typingUsers[0].username} and ${typingUsers[1].username} are typing...`;
    return `${typingUsers[0].username} and ${typingUsers.length - 1} others are typing...`;
  };

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold">Match Chat</h3>
          <p className="text-gray-500 text-sm">
            {users.length} user{users.length !== 1 ? 's' : ''} online
          </p>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4 mb-4">
        {messages.map((message, index) => (
          <div
            key={`${message.userId}-${message.timestamp}-${index}`}
            className={`mb-4 ${message.userId === userId ? 'text-right' : ''}`}
          >
            <div className="flex items-start gap-2">
              {message.userId !== userId && (
                <FaUserCircle className="text-gray-400 text-2xl mt-1" />
              )}
              <div className={`flex-1 ${message.userId === userId ? 'text-right' : ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">{message.username}</span>
                  <span className="text-xs text-gray-500">
                    {format(new Date(message.timestamp), 'HH:mm')}
                  </span>
                </div>
                <div
                  className={`inline-block px-4 py-2 rounded-2xl max-w-[80%] ${
                    message.userId === userId
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  {message.message}
                </div>
              </div>
              {message.userId === userId && (
                <FaUserCircle className="text-blue-400 text-2xl mt-1" />
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Typing Indicator */}
      {getTypingText() && (
        <div className="text-sm text-gray-500 italic mb-2">
          {getTypingText()}
        </div>
      )}

      {/* Chat Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onBlur={() => stopTyping(matchId, userId)}
          placeholder="Type your message..."
          maxLength={500}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={!isConnected}
        />
        <button
          type="submit"
          disabled={!input.trim() || !isConnected}
          className="px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <FaPaperPlane />
          Send
        </button>
      </form>
      
      <div className="text-xs text-gray-500 mt-2 text-center">
        {input.length}/500 characters
      </div>
    </div>
  );
}