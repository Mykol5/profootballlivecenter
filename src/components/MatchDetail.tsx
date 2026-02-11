// 



'use client';

import { useState, useEffect } from 'react';
import type { MatchDetail } from '@/lib/types';
import MatchEvents from './MatchEvents';
import MatchStats from './MatchStats';
import MatchChat from './MatchChat';
import { useWebSocket } from '@/hooks/useWebSocket';
import { FaArrowLeft, FaFutbol, FaChartPie, FaComments } from 'react-icons/fa';

interface MatchDetailProps {
  match: MatchDetail;
  onBack: () => void;
}

type ViewMode = 'events' | 'stats' | 'chat';

export default function MatchDetail({ match: initialMatch, onBack }: MatchDetailProps) {
  const [match, setMatch] = useState(initialMatch);
  const [viewMode, setViewMode] = useState<ViewMode>('events');
  const [userId] = useState(() => `user_${Math.random().toString(36).substr(2, 9)}`);
  const [username] = useState(() => {
    // Try to get from localStorage, or create new one
    const saved = localStorage.getItem('chat-username');
    if (saved) return saved;
    const newUsername = `Fan${Math.floor(Math.random() * 1000)}`;
    localStorage.setItem('chat-username', newUsername);
    return newUsername;
  });
  
  const { subscribeToMatch, unsubscribeFromMatch, onEvent, isConnected } = useWebSocket();

  useEffect(() => {
    // Only subscribe if we have a valid match ID
    if (match?.id) {
      console.log('Subscribing to match:', match.id);
      subscribeToMatch(match.id);
    }

    const unsubscribeScore = onEvent('score_update', (data) => {
      if (data?.matchId === match?.id) {
        setMatch(prev => ({
          ...prev,
          homeScore: data.homeScore ?? prev.homeScore,
          awayScore: data.awayScore ?? prev.awayScore,
        }));
      }
    });

    const unsubscribeStatus = onEvent('status_change', (data) => {
      if (data?.matchId === match?.id) {
        setMatch(prev => ({
          ...prev,
          status: data.status ?? prev.status,
          minute: data.minute ?? prev.minute,
        }));
      }
    });

    const unsubscribeEvents = onEvent('match_event', (data) => {
      if (data?.matchId === match?.id) {
        setMatch(prev => ({
          ...prev,
          events: [...prev.events, {
            id: `${Date.now()}_${Math.random()}`,
            ...data,
          }],
        }));
      }
    });

    const unsubscribeStats = onEvent('stats_update', (data) => {
      if (data?.matchId === match?.id) {
        setMatch(prev => ({
          ...prev,
          statistics: data.statistics,
        }));
      }
    });

    return () => {
      if (match?.id) {
        console.log('Unsubscribing from match:', match.id);
        unsubscribeFromMatch(match.id);
      }
      unsubscribeScore?.();
      unsubscribeStatus?.();
      unsubscribeEvents?.();
      unsubscribeStats?.();
    };
  }, [match?.id, subscribeToMatch, unsubscribeFromMatch, onEvent]);

  const getStatusText = () => {
    if (!match) return '';
    switch (match.status) {
      case 'FIRST_HALF':
      case 'SECOND_HALF':
        return `${match.minute}'`;
      case 'HALF_TIME':
        return 'Half Time';
      case 'FULL_TIME':
        return 'Full Time';
      default:
        return match.status;
    }
  };

  if (!match) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <FaArrowLeft />
          Back to Matches
        </button>

        {/* Connection Status Badge */}
        <div className="mb-4 flex justify-end">
          <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${
            isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            {isConnected ? 'Live Connection' : 'Reconnecting...'}
          </div>
        </div>

        {/* Match Header */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaFutbol className="text-3xl text-gray-600" />
              </div>
              <h2 className="text-2xl font-bold">{match.homeTeam.name}</h2>
              <p className="text-gray-500">{match.homeTeam.shortName}</p>
            </div>
            
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">
                {match.homeScore} - {match.awayScore}
              </div>
              <div className="text-xl font-semibold text-gray-700">{getStatusText()}</div>
              <div className="text-gray-500 capitalize">
                {match.status.toLowerCase().replace('_', ' ')}
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaFutbol className="text-3xl text-gray-600" />
              </div>
              <h2 className="text-2xl font-bold">{match.awayTeam.name}</h2>
              <p className="text-gray-500">{match.awayTeam.shortName}</p>
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setViewMode('events')}
              className={`flex-1 py-3 font-semibold flex items-center justify-center gap-2 ${
                viewMode === 'events'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaFutbol />
              Events
            </button>
            <button
              onClick={() => setViewMode('stats')}
              className={`flex-1 py-3 font-semibold flex items-center justify-center gap-2 ${
                viewMode === 'stats'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaChartPie />
              Statistics
            </button>
            <button
              onClick={() => setViewMode('chat')}
              className={`flex-1 py-3 font-semibold flex items-center justify-center gap-2 ${
                viewMode === 'chat'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <FaComments />
              Chat
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {viewMode === 'events' && <MatchEvents events={match.events} />}
          {viewMode === 'stats' && <MatchStats statistics={match.statistics} />}
          {viewMode === 'chat' && (
            <MatchChat
              matchId={match.id}  // This is the key - passing the REAL match ID from URL
              userId={userId}
              username={username}
            />
          )}
        </div>
      </div>
    </div>
  );
}