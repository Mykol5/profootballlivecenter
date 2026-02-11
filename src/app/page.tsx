'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchMatches, fetchLiveMatches } from '@/lib/api';
import { FootballMatch } from '@/lib/types';
import MatchCard from '@/components/MatchCard';
import ConnectionStatus from '@/components/ConnectionStatus';
import { useWebSocket } from '@/hooks/useWebSocket';
import { FaSync, FaFutbol, FaTv, FaExclamationTriangle } from 'react-icons/fa';

export default function Home() {
  const [matches, setMatches] = useState<FootballMatch[]>([]);
  const [liveMatches, setLiveMatches] = useState<FootballMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'live'>('all');
  const router = useRouter();
  const { onEvent, isConnected } = useWebSocket();

  const loadMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Starting to fetch matches...');
      
      const [allMatchesResponse, liveMatchesResponse] = await Promise.all([
        fetchMatches(),
        fetchLiveMatches(),
      ]);

      console.log('All matches response:', allMatchesResponse);
      console.log('Live matches response:', liveMatchesResponse);

      if (allMatchesResponse.success && allMatchesResponse.data) {
        setMatches(allMatchesResponse.data.matches || []);
      } else {
        console.warn('Failed to fetch all matches, using empty array');
        setMatches([]);
      }

      if (liveMatchesResponse.success && liveMatchesResponse.data) {
        setLiveMatches(liveMatchesResponse.data.matches || []);
      } else {
        console.warn('Failed to fetch live matches, using empty array');
        setLiveMatches([]);
      }

      if (!allMatchesResponse.success && !liveMatchesResponse.success) {
        setError('Unable to connect to the match service. Please try again.');
      }
    } catch (error) {
      console.error('Failed to load matches:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMatches();

    const unsubscribeScore = onEvent('score_update', (data) => {
      if (!data?.matchId) return;
      
      setMatches(prev => prev.map(match => 
        match.id === data.matchId 
          ? { ...match, homeScore: data.homeScore ?? match.homeScore, awayScore: data.awayScore ?? match.awayScore }
          : match
      ));
      setLiveMatches(prev => prev.map(match =>
        match.id === data.matchId
          ? { ...match, homeScore: data.homeScore ?? match.homeScore, awayScore: data.awayScore ?? match.awayScore }
          : match
      ));
    });

    const unsubscribeStatus = onEvent('status_change', (data) => {
      if (!data?.matchId) return;
      
      setMatches(prev => prev.map(match =>
        match.id === data.matchId
          ? { ...match, status: data.status ?? match.status, minute: data.minute ?? match.minute }
          : match
      ));
      setLiveMatches(prev => prev.map(match =>
        match.id === data.matchId
          ? { ...match, status: data.status ?? match.status, minute: data.minute ?? match.minute }
          : match
      ));

      if (data.status === 'FULL_TIME') {
        setLiveMatches(prev => prev.filter(match => match.id !== data.matchId));
      } else if (data.status === 'FIRST_HALF' || data.status === 'SECOND_HALF') {
        loadMatches();
      }
    });

    return () => {
      unsubscribeScore?.();
      unsubscribeStatus?.();
    };
  }, [onEvent]);

  const handleMatchClick = (match: FootballMatch) => {
    // Store the match data in sessionStorage before navigating
    sessionStorage.setItem(`match-${match.id}`, JSON.stringify(match));
    router.push(`/matches/${match.id}`);
  };

  const displayedMatches = activeTab === 'live' ? liveMatches : matches;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
        <ConnectionStatus isConnected={isConnected} />
        <div className="container mx-auto px-4 py-12">
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <FaExclamationTriangle className="text-6xl text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Connection Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={loadMatches}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
            >
              <FaSync className={loading ? 'animate-spin' : ''} />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
      <ConnectionStatus isConnected={isConnected} />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <FaFutbol className="text-4xl text-blue-600" />
            <h1 className="text-5xl font-bold text-gray-900">Live Football Center</h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Follow live football matches, real-time scores, statistics, and join match discussions
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FaFutbol className="text-2xl text-blue-600" />
              </div>
              <div>
                <div className="text-3xl font-bold">{matches.length}</div>
                <div className="text-gray-500">Total Matches</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-xl">
                <FaTv className="text-2xl text-red-600" />
              </div>
              <div>
                <div className="text-3xl font-bold">{liveMatches.length}</div>
                <div className="text-gray-500">Live Now</div>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-xl">
                <div className="w-6 h-6 rounded-full bg-green-500 animate-pulse" />
              </div>
              <div>
                <div className="text-3xl font-bold">
                  {isConnected ? 'Online' : 'Offline'}
                </div>
                <div className="text-gray-500">Connection Status</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs and Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
          <div className="flex border border-gray-300 rounded-xl overflow-hidden">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 font-semibold ${
                activeTab === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              All Matches
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className={`px-6 py-3 font-semibold flex items-center gap-2 ${
                activeTab === 'live'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Live Matches
            </button>
          </div>
          
          <button
            onClick={loadMatches}
            disabled={loading}
            className="px-6 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
          >
            <FaSync className={loading ? 'animate-spin' : ''} />
            {loading ? 'Refreshing...' : 'Refresh Matches'}
          </button>
        </div>

        {/* Matches Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : displayedMatches.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
            <FaFutbol className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              {activeTab === 'live' ? 'No Live Matches' : 'No Matches Available'}
            </h3>
            <p className="text-gray-500">
              {activeTab === 'live' 
                ? 'Check back later for live matches'
                : 'Matches will appear here when available'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {displayedMatches.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                isLive={liveMatches.some(m => m.id === match.id)}
                onClick={() => handleMatchClick(match)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}



// 'use client';

// import { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { fetchMatches, fetchLiveMatches } from '@/lib/api';
// import { FootballMatch } from '@/lib/types'; // Change import
// import MatchCard from '@/components/MatchCard';
// import ConnectionStatus from '@/components/ConnectionStatus';
// import { useWebSocket } from '@/hooks/useWebSocket';
// import { FaSync, FaFutbol, FaTv } from 'react-icons/fa';

// export default function Home() {
//   const [matches, setMatches] = useState<FootballMatch[]>([]); // Change type
//   const [liveMatches, setLiveMatches] = useState<FootballMatch[]>([]); // Change type
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState<'all' | 'live'>('all');
//   const router = useRouter();
//   const { onEvent, isConnected } = useWebSocket();

//   const loadMatches = async () => {
//     try {
//       setLoading(true);
//       const [allMatchesResponse, liveMatchesResponse] = await Promise.all([
//         fetchMatches(),
//         fetchLiveMatches(),
//       ]);

//       if (allMatchesResponse.success) {
//         setMatches(allMatchesResponse.data.matches);
//       }

//       if (liveMatchesResponse.success) {
//         setLiveMatches(liveMatchesResponse.data.matches);
//       }
//     } catch (error) {
//       console.error('Failed to load matches:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadMatches();

//     // Listen for real-time updates
//     const unsubscribeScore = onEvent('score_update', (data) => {
//       setMatches(prev => prev.map(match => 
//         match.id === data.matchId 
//           ? { ...match, homeScore: data.homeScore, awayScore: data.awayScore }
//           : match
//       ));
//       setLiveMatches(prev => prev.map(match =>
//         match.id === data.matchId
//           ? { ...match, homeScore: data.homeScore, awayScore: data.awayScore }
//           : match
//       ));
//     });

//     const unsubscribeStatus = onEvent('status_change', (data) => {
//       setMatches(prev => prev.map(match =>
//         match.id === data.matchId
//           ? { ...match, status: data.status, minute: data.minute }
//           : match
//       ));
//       setLiveMatches(prev => prev.map(match =>
//         match.id === data.matchId
//           ? { ...match, status: data.status, minute: data.minute }
//           : match
//       ));

//       // Update live matches list
//       if (data.status === 'FULL_TIME') {
//         setLiveMatches(prev => prev.filter(match => match.id !== data.matchId));
//       } else if (data.status === 'FIRST_HALF' || data.status === 'SECOND_HALF') {
//         loadMatches(); // Reload to get updated live matches
//       }
//     });

//     return () => {
//       unsubscribeScore();
//       unsubscribeStatus();
//     };
//   }, [onEvent]);

//   const handleMatchClick = (matchId: string) => {
//     router.push(`/matches/${matchId}`);
//   };

//   const displayedMatches = activeTab === 'live' ? liveMatches : matches;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100">
//       <ConnectionStatus isConnected={isConnected} />
      
//       <div className="container mx-auto px-4 py-12">
//         {/* Header */}
//         <div className="text-center mb-12">
//           <div className="flex items-center justify-center gap-3 mb-4">
//             <FaFutbol className="text-4xl text-blue-600" />
//             <h1 className="text-5xl font-bold text-gray-900">Live Football Center</h1>
//           </div>
//           <p className="text-gray-600 text-lg max-w-2xl mx-auto">
//             Follow live football matches, real-time scores, statistics, and join match discussions
//           </p>
//         </div>

//         {/* Stats Overview */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//           <div className="bg-white rounded-2xl shadow-lg p-6">
//             <div className="flex items-center gap-4">
//               <div className="p-3 bg-blue-100 rounded-xl">
//                 <FaFutbol className="text-2xl text-blue-600" />
//               </div>
//               <div>
//                 <div className="text-3xl font-bold">{matches.length}</div>
//                 <div className="text-gray-500">Total Matches</div>
//               </div>
//             </div>
//           </div>
//           <div className="bg-white rounded-2xl shadow-lg p-6">
//             <div className="flex items-center gap-4">
//               <div className="p-3 bg-red-100 rounded-xl">
//                 <FaTv className="text-2xl text-red-600" />
//               </div>
//               <div>
//                 <div className="text-3xl font-bold">{liveMatches.length}</div>
//                 <div className="text-gray-500">Live Now</div>
//               </div>
//             </div>
//           </div>
//           <div className="bg-white rounded-2xl shadow-lg p-6">
//             <div className="flex items-center gap-4">
//               <div className="p-3 bg-green-100 rounded-xl">
//                 <div className="w-6 h-6 rounded-full bg-green-500 animate-pulse" />
//               </div>
//               <div>
//                 <div className="text-3xl font-bold">
//                   {isConnected ? 'Online' : 'Offline'}
//                 </div>
//                 <div className="text-gray-500">Connection Status</div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Tabs and Controls */}
//         <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-8">
//           <div className="flex border border-gray-300 rounded-xl overflow-hidden">
//             <button
//               onClick={() => setActiveTab('all')}
//               className={`px-6 py-3 font-semibold ${
//                 activeTab === 'all'
//                   ? 'bg-blue-600 text-white'
//                   : 'bg-white text-gray-700 hover:bg-gray-50'
//               }`}
//             >
//               All Matches
//             </button>
//             <button
//               onClick={() => setActiveTab('live')}
//               className={`px-6 py-3 font-semibold flex items-center gap-2 ${
//                 activeTab === 'live'
//                   ? 'bg-red-600 text-white'
//                   : 'bg-white text-gray-700 hover:bg-gray-50'
//               }`}
//             >
//               <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
//               Live Matches
//             </button>
//           </div>
          
//           <button
//             onClick={loadMatches}
//             disabled={loading}
//             className="px-6 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
//           >
//             <FaSync className={loading ? 'animate-spin' : ''} />
//             {loading ? 'Refreshing...' : 'Refresh Matches'}
//           </button>
//         </div>

//         {/* Matches Grid */}
//         {loading ? (
//           <div className="flex justify-center items-center h-64">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
//           </div>
//         ) : displayedMatches.length === 0 ? (
//           <div className="text-center py-12">
//             <FaFutbol className="text-6xl text-gray-300 mx-auto mb-4" />
//             <h3 className="text-xl font-semibold text-gray-600 mb-2">
//               {activeTab === 'live' ? 'No Live Matches' : 'No Matches Available'}
//             </h3>
//             <p className="text-gray-500">
//               {activeTab === 'live' 
//                 ? 'Check back later for live matches'
//                 : 'Matches will appear here when available'}
//             </p>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {displayedMatches.map((match) => (
//               <MatchCard
//                 key={match.id}
//                 match={match}
//                 isLive={liveMatches.some(m => m.id === match.id)}
//                 onClick={() => handleMatchClick(match.id)}
//               />
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// import Image from "next/image";

// export default function Home() {
//   return (
//     <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
//       <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
//         <Image
//           className="dark:invert"
//           src="/next.svg"
//           alt="Next.js logo"
//           width={100}
//           height={20}
//           priority
//         />
//         <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
//           <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
//             To get started, edit the page.tsx file.
//           </h1>
//           <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
//             Looking for a starting point or more instructions? Head over to{" "}
//             <a
//               href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Templates
//             </a>{" "}
//             or the{" "}
//             <a
//               href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//               className="font-medium text-zinc-950 dark:text-zinc-50"
//             >
//               Learning
//             </a>{" "}
//             center.
//           </p>
//         </div>
//         <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
//           <a
//             className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
//             href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             <Image
//               className="dark:invert"
//               src="/vercel.svg"
//               alt="Vercel logomark"
//               width={16}
//               height={16}
//             />
//             Deploy Now
//           </a>
//           <a
//             className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
//             href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Documentation
//           </a>
//         </div>
//       </main>
//     </div>
//   );
// }
