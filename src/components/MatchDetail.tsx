'use client';

import { useState, useEffect } from 'react';
import type { MatchDetail } from '@/lib/types';
import MatchEvents from './MatchEvents';
import MatchStats from './MatchStats';
import MatchChat from './MatchChat';
import { useWebSocket } from '@/hooks/useWebSocket';
import {
  FaArrowLeft,
  FaFutbol,
  FaChartPie,
  FaComments,
  FaClock,
  FaCircle,
  FaWifi
} from 'react-icons/fa';
import { TbWifiOff } from 'react-icons/tb';
import { IoMdFootball } from 'react-icons/io';
import { GiSoccerBall, GiWhistle } from 'react-icons/gi';

interface MatchDetailProps {
  match: MatchDetail;
  onBack: () => void;
  isConnected?: boolean;
}

type ViewMode = 'events' | 'stats' | 'chat';

export default function MatchDetail({ match: initialMatch, onBack, isConnected = true }: MatchDetailProps) {
  const [match, setMatch] = useState(initialMatch);
  const [viewMode, setViewMode] = useState<ViewMode>('events');
  const [userId] = useState(() => {
    const stored = localStorage.getItem('chat-userId');
    if (stored) return stored;
    const newId = `user_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('chat-userId', newId);
    return newId;
  });
  
  const [username] = useState(() => {
    const stored = localStorage.getItem('chat-username');
    if (stored) return stored;
    const newName = `Fan${Math.floor(Math.random() * 10000)}`;
    localStorage.setItem('chat-username', newName);
    return newName;
  });
  
  const { subscribeToMatch, unsubscribeFromMatch, onEvent } = useWebSocket();

  // Update local state when prop changes
  useEffect(() => {
    setMatch(initialMatch);
  }, [initialMatch]);

  // WebSocket subscriptions for real-time updates
  useEffect(() => {
    if (!match?.id) return;

    subscribeToMatch(match.id);

    const unsubscribeScore = onEvent('score_update', (data) => {
      if (data.matchId === match.id) {
        setMatch(prev => ({
          ...prev,
          homeScore: data.homeScore ?? prev.homeScore,
          awayScore: data.awayScore ?? prev.awayScore,
        }));
      }
    });

    const unsubscribeStatus = onEvent('status_change', (data) => {
      if (data.matchId === match.id) {
        setMatch(prev => ({
          ...prev,
          status: data.status ?? prev.status,
          minute: data.minute ?? prev.minute,
        }));
      }
    });

    const unsubscribeEvents = onEvent('match_event', (data) => {
      if (data.matchId === match.id) {
        setMatch(prev => ({
          ...prev,
          events: [{
            id: `${Date.now()}_${Math.random()}`,
            ...data,
          }, ...prev.events],
        }));
      }
    });

    const unsubscribeStats = onEvent('stats_update', (data) => {
      if (data.matchId === match.id) {
        setMatch(prev => ({
          ...prev,
          statistics: data.statistics,
        }));
      }
    });

    return () => {
      unsubscribeFromMatch(match.id);
      unsubscribeScore?.();
      unsubscribeStatus?.();
      unsubscribeEvents?.();
      unsubscribeStats?.();
    };
  }, [match?.id, subscribeToMatch, unsubscribeFromMatch, onEvent]);

  const getStatusColor = () => {
    switch (match.status) {
      case 'FIRST_HALF':
      case 'SECOND_HALF':
        return 'from-green-500 to-emerald-500';
      case 'HALF_TIME':
        return 'from-yellow-500 to-amber-500';
      case 'FULL_TIME':
        return 'from-slate-500 to-slate-600';
      default:
        return 'from-blue-500 to-indigo-500';
    }
  };

  const getStatusText = () => {
    switch (match.status) {
      case 'FIRST_HALF':
      case 'SECOND_HALF':
        return `${match.minute}'`;
      case 'HALF_TIME':
        return 'Half Time';
      case 'FULL_TIME':
        return 'Full Time';
      case 'NOT_STARTED':
        return 'Not Started';
      default:
        return (match.status as string).replace('_', ' ');
    }
  };

  const isLive = match.status === 'FIRST_HALF' || match.status === 'SECOND_HALF';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="group mb-8 flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all rounded-xl hover:bg-white/50 dark:hover:bg-slate-800/50 backdrop-blur-sm"
        >
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          <span>Back to Dashboard</span>
        </button>

        {/* Match Header Card - Premium Glassmorphism */}
        <div className="relative mb-8 group">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 rounded-3xl blur-2xl"></div>
          <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 shadow-2xl overflow-hidden">
            
            {/* Status Banner */}
            <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getStatusColor()}`}></div>
            
            <div className="p-6 md:p-8">
              {/* Top Row - Status & Connection */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl ${
                    isLive 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg shadow-red-500/30' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {isLive && <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>}
                    <span className="font-bold text-sm">{getStatusText()}</span>
                  </div>
                  
                  {isLive && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                      <FaClock className="text-slate-500" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{match.minute}'</span>
                    </div>
                  )}
                </div>
                
                {/* Connection Status */}
                <div className="flex items-center gap-2">
                  {isConnected ? (
                    <>
                      <FaWifi className="text-emerald-500" />
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 hidden sm:inline">Live</span>
                    </>
                  ) : (
                    <>
                      <TbWifiOff className="text-slate-400" />
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-500 hidden sm:inline">Reconnecting...</span>
                    </>
                  )}
                </div>
              </div>

              {/* Teams & Score */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                {/* Home Team */}
                <div className="flex flex-col items-center md:w-1/3">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-xl opacity-50"></div>
                    <div className="relative w-28 h-28 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-700 shadow-2xl">
                      <GiSoccerBall className="text-5xl text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{match.homeTeam.name}</h2>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{match.homeTeam.shortName}</span>
                </div>

                {/* Score */}
                <div className="flex flex-col items-center md:w-1/3">
                  <div className="flex items-center gap-4 md:gap-6 mb-4">
                    <span className="text-6xl md:text-7xl font-black bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                      {match.homeScore}
                    </span>
                    <span className="text-4xl md:text-5xl font-black text-slate-300 dark:text-slate-700">:</span>
                    <span className="text-6xl md:text-7xl font-black bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                      {match.awayScore}
                    </span>
                  </div>
                  
                  {/* Match Status Badge */}
                  <div className={`px-6 py-2 rounded-full text-sm font-bold ${
                    isLive 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 text-white animate-pulse' 
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {match.status.replace('_', ' ')}
                  </div>
                </div>

                {/* Away Team */}
                <div className="flex flex-col items-center md:w-1/3">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur-xl opacity-50"></div>
                    <div className="relative w-28 h-28 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full flex items-center justify-center border-4 border-white dark:border-slate-700 shadow-2xl">
                      <IoMdFootball className="text-5xl text-red-600 dark:text-red-400" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{match.awayTeam.name}</h2>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{match.awayTeam.shortName}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation - Premium Design */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-indigo-600/5 rounded-2xl blur"></div>
          <div className="relative bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-800/50 p-2 shadow-xl">
            <div className="flex">
              <button
                onClick={() => setViewMode('events')}
                className={`flex-1 py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all duration-300 ${
                  viewMode === 'events'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <GiWhistle className="text-xl" />
                <span className="hidden sm:inline">Match Events</span>
                <span className="sm:hidden">Events</span>
                {match.events.length > 0 && viewMode !== 'events' && (
                  <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-xs font-bold">
                    {match.events.length}
                  </span>
                )}
              </button>
              
              <button
                onClick={() => setViewMode('stats')}
                className={`flex-1 py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all duration-300 ${
                  viewMode === 'stats'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <FaChartPie className="text-xl" />
                <span className="hidden sm:inline">Statistics</span>
                <span className="sm:hidden">Stats</span>
              </button>
              
              <button
                onClick={() => setViewMode('chat')}
                className={`flex-1 py-4 px-6 rounded-xl font-semibold flex items-center justify-center gap-3 transition-all duration-300 ${
                  viewMode === 'chat'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <FaComments className="text-xl" />
                <span className="hidden sm:inline">Match Chat</span>
                <span className="sm:hidden">Chat</span>
                {isLive && viewMode !== 'chat' && (
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-white/30 dark:from-slate-900/50 dark:to-slate-900/30 rounded-3xl blur"></div>
          <div className="relative bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-slate-200/50 dark:border-slate-800/50 p-6 md:p-8 shadow-2xl min-h-[600px]">
            {viewMode === 'events' && <MatchEvents events={match.events} />}
            {viewMode === 'stats' && <MatchStats statistics={match.statistics} />}
            {viewMode === 'chat' && (
              <MatchChat
                matchId={match.id}
                userId={userId}
                username={username}
              />
            )}
          </div>
        </div>

        {/* Match Info Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Match ID: {match.id} • Started: {new Date(match.startTime).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}
