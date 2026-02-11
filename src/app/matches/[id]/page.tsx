'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { fetchMatch } from '@/lib/api';
import { FootballMatch, MatchDetail } from '@/lib/types';
import MatchDetailComponent from '@/components/MatchDetail';
import ConnectionStatus from '@/components/ConnectionStatus';
import { FaExclamationTriangle } from 'react-icons/fa';

// Default mock events for when we don't have them
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
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  useEffect(() => {
    // Prevent infinite loop
    if (hasAttemptedFetch) return;
    
    const loadMatchData = async () => {
      setHasAttemptedFetch(true);
      
      // First, try to get the match data from sessionStorage (passed from dashboard)
      const storedMatch = sessionStorage.getItem(`match-${id}`);
      
      if (storedMatch) {
        console.log('Found match data in sessionStorage:', storedMatch);
        try {
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