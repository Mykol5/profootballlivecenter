import { FootballMatch } from '@/lib/types';
import { format } from 'date-fns';
import { FaRegClock, FaFutbol } from 'react-icons/fa';

interface MatchCardProps {
  match: FootballMatch;
  isLive?: boolean;
  onClick?: (match: FootballMatch) => void;
}

export default function MatchCard({ match, isLive = false, onClick }: MatchCardProps) {
  const getStatusText = (status: FootballMatch['status']) => {
    switch (status) {
      case 'NOT_STARTED':
        return format(new Date(match.startTime), 'HH:mm');
      case 'FIRST_HALF':
      case 'SECOND_HALF':
        return `${match.minute}'`;
      case 'HALF_TIME':
        return 'HT';
      case 'FULL_TIME':
        return 'FT';
      default:
        return status;
    }
  };

  return (
    <div
      className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border border-gray-100"
      onClick={() => onClick?.(match)}
    >
      {isLive && (
        <div className="flex items-center gap-2 mb-4">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm font-semibold text-red-600">LIVE</span>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <FaFutbol className="text-gray-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{match.homeTeam.name}</h3>
                <p className="text-sm text-gray-500">{match.homeTeam.shortName}</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{match.homeScore}</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <FaFutbol className="text-gray-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{match.awayTeam.name}</h3>
                <p className="text-sm text-gray-500">{match.awayTeam.shortName}</p>
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{match.awayScore}</div>
            </div>
          </div>
        </div>
        
        <div className="ml-8 flex flex-col items-center">
          <div className="bg-gray-50 rounded-lg px-4 py-2 mb-2">
            <div className="flex items-center gap-2 text-gray-700">
              <FaRegClock />
              <span className="font-semibold">{getStatusText(match.status)}</span>
            </div>
          </div>
          <div className="text-sm text-gray-500 capitalize">
            {match.status.toLowerCase().replace('_', ' ')}
          </div>
        </div>
      </div>
    </div>
  );
}




// // components/MatchCard.tsx
// import { FootballMatch } from '@/lib/types'; // CHANGE THIS LINE
// import { format } from 'date-fns';
// import { FaRegClock, FaFutbol } from 'react-icons/fa';

// interface MatchCardProps {
//   match: FootballMatch; // CHANGE THIS LINE
//   isLive?: boolean;
//   onClick?: () => void;
// }

// export default function MatchCard({ match, isLive = false, onClick }: MatchCardProps) {
//   const getStatusText = (status: FootballMatch['status']) => { // Optional: Update this too
//     switch (status) {
//       case 'NOT_STARTED':
//         return format(new Date(match.startTime), 'HH:mm');
//       case 'FIRST_HALF':
//       case 'SECOND_HALF':
//         return `${match.minute}'`;
//       case 'HALF_TIME':
//         return 'HT';
//       case 'FULL_TIME':
//         return 'FT';
//       default:
//         return status;
//     }
//   };

//   return (
//     <div
//       className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer border border-gray-100"
//       onClick={onClick}
//     >
//       {isLive && (
//         <div className="flex items-center gap-2 mb-4">
//           <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
//           <span className="text-sm font-semibold text-red-600">LIVE</span>
//         </div>
//       )}
      
//       <div className="flex items-center justify-between">
//         <div className="flex-1">
//           <div className="flex items-center justify-between mb-4">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
//                 <FaFutbol className="text-gray-600" />
//               </div>
//               <div>
//                 <h3 className="font-bold text-lg">{match.homeTeam.name}</h3>
//                 <p className="text-sm text-gray-500">{match.homeTeam.shortName}</p>
//               </div>
//             </div>
//             <div className="text-center">
//               <div className="text-3xl font-bold">{match.homeScore}</div>
//             </div>
//           </div>
          
//           <div className="flex items-center justify-between">
//             <div className="flex items-center gap-3">
//               <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
//                 <FaFutbol className="text-gray-600" />
//               </div>
//               <div>
//                 <h3 className="font-bold text-lg">{match.awayTeam.name}</h3>
//                 <p className="text-sm text-gray-500">{match.awayTeam.shortName}</p>
//               </div>
//             </div>
//             <div className="text-center">
//               <div className="text-3xl font-bold">{match.awayScore}</div>
//             </div>
//           </div>
//         </div>
        
//         <div className="ml-8 flex flex-col items-center">
//           <div className="bg-gray-50 rounded-lg px-4 py-2 mb-2">
//             <div className="flex items-center gap-2 text-gray-700">
//               <FaRegClock />
//               <span className="font-semibold">{getStatusText(match.status)}</span>
//             </div>
//           </div>
//           <div className="text-sm text-gray-500 capitalize">
//             {match.status.toLowerCase().replace('_', ' ')}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }