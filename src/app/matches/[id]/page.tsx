'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchMatch } from '@/lib/api';
import { FootballMatch, MatchDetail } from '@/lib/types';
import MatchDetailComponent from '@/components/MatchDetail';
import ConnectionStatus from '@/components/ConnectionStatus';
import { useWebSocket } from '@/hooks/useWebSocket';
import { FaExclamationTriangle } from 'react-icons/fa';

// Default mock events for fallback ONLY when API fails
const DEFAULT_EVENTS = [
  {
    id: '1',
    type: 'GOAL' as const,
    minute: 23,
    team: 'home' as const,
    player: 'Marcus Rashford',
    assistPlayer: 'Bruno Fernandes',
    description: 'GOAL! Marcus Rashford scores for Manchester United!',
    timestamp: new Date().toISOString(),
  },
  {
    id: '2',
    type: 'YELLOW_CARD' as const,
    minute: 34,
    team: 'away' as const,
    player: 'Virgil van Dijk',
    description: 'Yellow card shown to Virgil van Dijk',
    timestamp: new Date().toISOString(),
  },
  {
    id: '3',
    type: 'GOAL' as const,
    minute: 56,
    team: 'away' as const,
    player: 'Mohamed Salah',
    description: 'GOAL! Mohamed Salah scores for Liverpool!',
    timestamp: new Date().toISOString(),
  },
  {
    id: '4',
    type: 'GOAL' as const,
    minute: 78,
    team: 'home' as const,
    player: 'Bruno Fernandes',
    description: 'GOAL! Bruno Fernandes scores for Manchester United!',
    timestamp: new Date().toISOString(),
  },
];

const DEFAULT_STATS = {
  possession: { home: 55, away: 45 },
  shots: { home: 12, away: 8 },
  shotsOnTarget: { home: 6, away: 3 },
  corners: { home: 4, away: 2 },
  fouls: { home: 7, away: 9 },
  yellowCards: { home: 1, away: 2 },
  redCards: { home: 0, away: 0 },
};

export default function MatchDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [match, setMatch] = useState<MatchDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  
  const { 
    onEvent, 
    subscribeToMatch, 
    unsubscribeFromMatch, 
    joinChat, 
    leaveChat,
    isConnected 
  } = useWebSocket();

  // ============================================
  // 1. FETCH MATCH DATA (REST API + SessionStorage)
  // ============================================
  useEffect(() => {
    if (hasAttemptedFetch) return;
    
    const loadMatchData = async () => {
      setHasAttemptedFetch(true);
      
      // First, try to get from sessionStorage (passed from dashboard)
      const storedMatch = sessionStorage.getItem(`match-${id}`);
      
      if (storedMatch) {
        console.log('📦 Found match data in sessionStorage:', storedMatch);
        try {
          const matchData: FootballMatch = JSON.parse(storedMatch);
          setMatch({
            ...matchData,
            events: DEFAULT_EVENTS,
            statistics: DEFAULT_STATS,
          });
          setUsingMockData(true);
          setError('Using demo data - Live API unavailable');
          setLoading(false);
          return;
        } catch (e) {
          console.error('Error parsing stored match:', e);
        }
      }

      // Try API if no stored data
      try {
        setLoading(true);
        setError(null);
        
        if (typeof id !== 'string') throw new Error('Invalid match ID');
        
        console.log('🌐 Fetching from API for ID:', id);
        const response = await fetchMatch(id);
        
        if (response.success && response.data) {
          setMatch(response.data);
          setUsingMockData(false);
        } else {
          // API failed - create fallback
          setMatch({
            id: id as string,
            homeTeam: { id: '1', name: 'Manchester United', shortName: 'MUN' },
            awayTeam: { id: '2', name: 'Liverpool', shortName: 'LIV' },
            homeScore: 2,
            awayScore: 1,
            minute: 67,
            status: 'SECOND_HALF',
            startTime: new Date().toISOString(),
            events: DEFAULT_EVENTS,
            statistics: DEFAULT_STATS,
          });
          setUsingMockData(true);
          setError('API unavailable - Showing demo data');
        }
      } catch (err) {
        console.error('Error loading match:', err);
        setMatch({
          id: id as string,
          homeTeam: { id: '1', name: 'Manchester United', shortName: 'MUN' },
          awayTeam: { id: '2', name: 'Liverpool', shortName: 'LIV' },
          homeScore: 2,
          awayScore: 1,
          minute: 67,
          status: 'SECOND_HALF',
          startTime: new Date().toISOString(),
          events: DEFAULT_EVENTS,
          statistics: DEFAULT_STATS,
        });
        setUsingMockData(true);
        setError('Unable to connect to match service. Showing demo data.');
      } finally {
        setLoading(false);
      }
    };

    loadMatchData();
  }, [id, hasAttemptedFetch]);

  // ============================================
  // 2. REAL-TIME WEBSOCKET SUBSCRIPTIONS
  // ============================================
  useEffect(() => {
    if (!match?.id) return;

    console.log('🔌 Setting up REAL-TIME subscriptions for match:', match.id);
    
    // Get or create user identity for chat
    let username = localStorage.getItem('chat-username');
    let userId = localStorage.getItem('chat-userId');
    
    if (!username) {
      username = `Fan${Math.floor(Math.random() * 10000)}`;
      localStorage.setItem('chat-username', username);
    }
    
    if (!userId) {
      userId = `user_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('chat-userId', userId);
    }

    // 1. Subscribe to match updates
    subscribeToMatch(match.id);
    
    // 2. Join chat room
    joinChat(match.id, userId, username);

    // 3. Listen for SCORE updates
    const unsubscribeScore = onEvent('score_update', (data) => {
      if (data.matchId === match.id) {
        console.log('⚽ Real-time score update:', data);
        setMatch(prev => prev ? {
          ...prev,
          homeScore: data.homeScore ?? prev.homeScore,
          awayScore: data.awayScore ?? prev.awayScore
        } : null);
      }
    });

    // 4. Listen for MATCH EVENTS (goals, cards, etc.)
    const unsubscribeMatchEvent = onEvent('match_event', (data) => {
      if (data.matchId === match.id) {
        console.log('📋 Real-time match event:', data);
        setMatch(prev => prev ? {
          ...prev,
          events: [{
            id: `${Date.now()}_${Math.random()}`,
            ...data
          }, ...prev.events] // Add new events at the top
        } : null);
      }
    });

    // 5. Listen for STATISTICS updates
    const unsubscribeStatsUpdate = onEvent('stats_update', (data) => {
      if (data.matchId === match.id) {
        console.log('📊 Real-time stats update:', data);
        setMatch(prev => prev ? {
          ...prev,
          statistics: data.statistics
        } : null);
      }
    });

    // 6. Listen for STATUS changes
    const unsubscribeStatusChange = onEvent('status_change', (data) => {
      if (data.matchId === match.id) {
        console.log('⏱️ Real-time status change:', data);
        setMatch(prev => prev ? {
          ...prev,
          status: data.status ?? prev.status,
          minute: data.minute ?? prev.minute
        } : null);
      }
    });

    // 7. Listen for CHAT MESSAGES (these are handled in MatchChat component)
    //    But we need to keep connection alive

    // 8. Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up subscriptions for match:', match.id);
      unsubscribeFromMatch(match.id);
      leaveChat(match.id, userId);
      unsubscribeScore?.();
      unsubscribeMatchEvent?.();
      unsubscribeStatsUpdate?.();
      unsubscribeStatusChange?.();
    };
  }, [match?.id, subscribeToMatch, unsubscribeFromMatch, joinChat, leaveChat, onEvent]);

  // ============================================
  // 3. RECONNECTION HANDLER
  // ============================================
  useEffect(() => {
    if (isConnected && match?.id && !usingMockData) {
      // Re-subscribe when connection is restored
      console.log('🔄 Connection restored - re-subscribing to match:', match.id);
      subscribeToMatch(match.id);
      
      const username = localStorage.getItem('chat-username') || 'Fan';
      const userId = localStorage.getItem('chat-userId') || 'user';
      joinChat(match.id, userId, username);
    }
  }, [isConnected, match?.id, subscribeToMatch, joinChat, usingMockData]);

  const handleBack = () => {
    router.push('/');
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
            <div className="relative w-20 h-20 border-4 border-blue-200/30 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-lg font-medium text-slate-600 dark:text-slate-400">Loading match details...</p>
        </div>
      </div>
    );
  }

  // Error state - no match
  if (!match) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 p-10 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-red-500/30">
            <FaExclamationTriangle className="text-4xl text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-3">
            Match Not Found
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-8">
            The match you're looking for doesn't exist or has ended.
          </p>
          <button
            onClick={handleBack}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-2xl transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ConnectionStatus isConnected={isConnected} />
      
      {/* Demo Data Warning Banner */}
      {usingMockData && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20 backdrop-blur-sm">
            <FaExclamationTriangle className="text-white" />
            <span className="font-medium">{error || 'Using demo data - Live API unavailable'}</span>
            <span className="px-2 py-1 bg-white/20 rounded-lg text-xs font-bold">DEMO MODE</span>
          </div>
        </div>
      )}

      {/* Live Match Status Banner */}
      {!usingMockData && isConnected && match.status.includes('HALF') && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/20 backdrop-blur-sm">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            <span className="font-medium">Live Connection • Real-time updates active</span>
          </div>
        </div>
      )}

      {/* Main Match Detail Component */}
      <MatchDetailComponent 
        match={match} 
        onBack={handleBack}
        isConnected={isConnected}
      />
    </>
  );
}
          const matchData: FootballMatch = JSON.parse(storedMatch);
          
          // Convert FootballMatch to MatchDetail by adding default events and stats
          setMatch({
            ...matchData,
            events: DEFAULT_EVENTS,
            statistics: DEFAULT_STATS,
          });
          setLoading(false);
          return;
        } catch (e) {
          console.error('Error parsing stored match:', e);
          // If parsing fails, proceed to API fetch
        }
      }

      // If no stored data or parsing failed, try to fetch from API
      try {
        setLoading(true);
        setError(null);
        
        if (typeof id !== 'string') {
          throw new Error('Invalid match ID');
        }
        
        console.log('No stored data, fetching from API for ID:', id);
        const response = await fetchMatch(id);
        
        if (response.success && response.data) {
          setMatch(response.data);
        } else {
          // If API fails, create basic match detail from ID
          setMatch({
            id: id as string,
            homeTeam: { id: '1', name: 'Manchester United', shortName: 'MUN' },
            awayTeam: { id: '2', name: 'Liverpool', shortName: 'LIV' },
            homeScore: 2,
            awayScore: 1,
            minute: 67,
            status: 'SECOND_HALF',
            startTime: new Date().toISOString(),
            events: DEFAULT_EVENTS,
            statistics: DEFAULT_STATS,
          });
          setError('Using demo data - Live updates may not be available');
        }
      } catch (err) {
        console.error('Error loading match:', err);
        // Create fallback match
        setMatch({
          id: id as string,
          homeTeam: { id: '1', name: 'Manchester United', shortName: 'MUN' },
          awayTeam: { id: '2', name: 'Liverpool', shortName: 'LIV' },
          homeScore: 2,
          awayScore: 1,
          minute: 67,
          status: 'SECOND_HALF',
          startTime: new Date().toISOString(),
          events: DEFAULT_EVENTS,
          statistics: DEFAULT_STATS,
        });
        setError('Unable to connect to match service. Showing demo data.');
      } finally {
        setLoading(false);
      }
    };

    loadMatchData();
  }, [id, hasAttemptedFetch]); // Removed 'match' from dependencies

  const handleBack = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Match Not Found</h2>
          <p className="text-gray-600 mb-6">The match you are looking for does not exist</p>
          <button
            onClick={handleBack}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Matches
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <ConnectionStatus isConnected={true} />
      {error && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
            <FaExclamationTriangle className="text-yellow-600" />
            <span>{error}</span>
          </div>
        </div>
      )}
      <MatchDetailComponent match={match} onBack={handleBack} />
    </>
  );
}




// 'use client';

// import { useEffect, useState } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import { fetchMatch } from '@/lib/api';
// import { FootballMatch, MatchDetail } from '@/lib/types';
// import MatchDetailComponent from '@/components/MatchDetail';
// import ConnectionStatus from '@/components/ConnectionStatus';
// import { FaExclamationTriangle } from 'react-icons/fa';

// // Default mock events for when we don't have them
// const DEFAULT_EVENTS = [
//   {
//     id: '1',
//     type: 'GOAL' as const,
//     minute: 23,
//     team: 'home' as const,
//     player: 'Marcus Rashford',
//     assistPlayer: 'Bruno Fernandes',
//     description: 'GOAL! Marcus Rashford scores for Manchester United!',
//     timestamp: new Date().toISOString(),
//   },
//   {
//     id: '2',
//     type: 'YELLOW_CARD' as const,
//     minute: 34,
//     team: 'away' as const,
//     player: 'Virgil van Dijk',
//     description: 'Yellow card shown to Virgil van Dijk',
//     timestamp: new Date().toISOString(),
//   },
//   {
//     id: '3',
//     type: 'GOAL' as const,
//     minute: 56,
//     team: 'away' as const,
//     player: 'Mohamed Salah',
//     description: 'GOAL! Mohamed Salah scores for Liverpool!',
//     timestamp: new Date().toISOString(),
//   },
//   {
//     id: '4',
//     type: 'GOAL' as const,
//     minute: 78,
//     team: 'home' as const,
//     player: 'Bruno Fernandes',
//     description: 'GOAL! Bruno Fernandes scores for Manchester United!',
//     timestamp: new Date().toISOString(),
//   },
// ];

// const DEFAULT_STATS = {
//   possession: { home: 55, away: 45 },
//   shots: { home: 12, away: 8 },
//   shotsOnTarget: { home: 6, away: 3 },
//   corners: { home: 4, away: 2 },
//   fouls: { home: 7, away: 9 },
//   yellowCards: { home: 1, away: 2 },
//   redCards: { home: 0, away: 0 },
// };

// export default function MatchDetailPage() {
//   const { id } = useParams();
//   const router = useRouter();
//   const [match, setMatch] = useState<MatchDetail | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     // First, try to get the match data from sessionStorage (passed from dashboard)
//     const storedMatch = sessionStorage.getItem(`match-${id}`);
    
//     if (storedMatch) {
//       console.log('Found match data in sessionStorage:', storedMatch);
//       try {
//         const matchData: FootballMatch = JSON.parse(storedMatch);
        
//         // Convert FootballMatch to MatchDetail by adding default events and stats
//         setMatch({
//           ...matchData,
//           events: DEFAULT_EVENTS,
//           statistics: DEFAULT_STATS,
//         });
//         setLoading(false);
//       } catch (e) {
//         console.error('Error parsing stored match:', e);
//         // If parsing fails, proceed to API fetch
//       }
//     }

//     // If no stored data or parsing failed, try to fetch from API
//     if (!match) {
//       const loadMatch = async () => {
//         try {
//           setLoading(true);
//           setError(null);
          
//           if (typeof id !== 'string') {
//             throw new Error('Invalid match ID');
//           }
          
//           console.log('No stored data, fetching from API for ID:', id);
//           const response = await fetchMatch(id);
          
//           if (response.success && response.data) {
//             setMatch(response.data);
//           } else {
//             // If API fails, create basic match detail from ID
//             setMatch({
//               id: id as string,
//               homeTeam: { id: '1', name: 'Manchester United', shortName: 'MUN' },
//               awayTeam: { id: '2', name: 'Liverpool', shortName: 'LIV' },
//               homeScore: 2,
//               awayScore: 1,
//               minute: 67,
//               status: 'SECOND_HALF',
//               startTime: new Date().toISOString(),
//               events: DEFAULT_EVENTS,
//               statistics: DEFAULT_STATS,
//             });
//             setError('Using demo data - Live updates may not be available');
//           }
//         } catch (err) {
//           console.error('Error loading match:', err);
//           // Create fallback match
//           setMatch({
//             id: id as string,
//             homeTeam: { id: '1', name: 'Manchester United', shortName: 'MUN' },
//             awayTeam: { id: '2', name: 'Liverpool', shortName: 'LIV' },
//             homeScore: 2,
//             awayScore: 1,
//             minute: 67,
//             status: 'SECOND_HALF',
//             startTime: new Date().toISOString(),
//             events: DEFAULT_EVENTS,
//             statistics: DEFAULT_STATS,
//           });
//           setError('Unable to connect to match service. Showing demo data.');
//         } finally {
//           setLoading(false);
//         }
//       };

//       loadMatch();
//     }
//   }, [id, match]);

//   const handleBack = () => {
//     router.push('/');
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600" />
//       </div>
//     );
//   }

//   if (!match) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
//           <h2 className="text-2xl font-bold mb-2">Match Not Found</h2>
//           <p className="text-gray-600 mb-6">The match you are looking for does not exist</p>
//           <button
//             onClick={handleBack}
//             className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Back to Matches
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <ConnectionStatus isConnected={true} />
//       {error && (
//         <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
//           <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3">
//             <FaExclamationTriangle className="text-yellow-600" />
//             <span>{error}</span>
//           </div>
//         </div>
//       )}
//       <MatchDetailComponent match={match} onBack={handleBack} />
//     </>
//   );
// }




// 'use client';

// import { useEffect, useState } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import { fetchMatch } from '@/lib/api';
// import { MatchDetail } from '@/lib/types';
// import MatchDetailComponent from '@/components/MatchDetail';
// import ConnectionStatus from '@/components/ConnectionStatus';
// import { FaExclamationTriangle } from 'react-icons/fa';

// export default function MatchDetailPage() {
//   const { id } = useParams();
//   const router = useRouter();
//   const [match, setMatch] = useState<MatchDetail | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const loadMatch = async () => {
//       try {
//         setLoading(true);
//         setError(null);
        
//         if (typeof id !== 'string') {
//           throw new Error('Invalid match ID');
//         }
        
//         const response = await fetchMatch(id);
        
//         if (response.success) {
//           setMatch(response.data);
//         } else {
//           throw new Error('Failed to fetch match');
//         }
//       } catch (err) {
//         setError(err instanceof Error ? err.message : 'An error occurred');
//         console.error('Error loading match:', err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (id) {
//       loadMatch();
//     }
//   }, [id]);

//   const handleBack = () => {
//     router.push('/');
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600" />
//       </div>
//     );
//   }

//   if (error || !match) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
//           <h2 className="text-2xl font-bold mb-2">Match Not Found</h2>
//           <p className="text-gray-600 mb-6">{error || 'The match you are looking for does not exist'}</p>
//           <button
//             onClick={handleBack}
//             className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Back to Matches
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <ConnectionStatus isConnected={true} />
//       <MatchDetailComponent match={match} onBack={handleBack} />
//     </>
//   );
// }
