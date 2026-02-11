'use client';

import { MatchEvent } from '@/lib/types';
import { 
  FaFutbol, 
  FaSquare, 
  FaExchangeAlt, 
  FaExclamationTriangle,
  FaRedo,
  FaUserAlt
} from 'react-icons/fa';
import { GiWhistle } from 'react-icons/gi';

interface MatchEventsProps {
  events: MatchEvent[];
}

export default function MatchEvents({ events }: MatchEventsProps) {
  const getEventIcon = (type: MatchEvent['type']) => {
    switch (type) {
      case 'GOAL':
        return <FaFutbol className="text-green-600 text-lg" />;
      case 'YELLOW_CARD':
        return <FaSquare className="text-yellow-500 text-lg" />;
      case 'RED_CARD':
        return <FaSquare className="text-red-600 text-lg" />;
      case 'SUBSTITUTION':
        return <FaExchangeAlt className="text-blue-600 text-lg" />;
      case 'FOUL':
        return <GiWhistle className="text-orange-500 text-lg" />;
      case 'SHOT':
        return <FaRedo className="text-purple-600 text-lg" />;
      default:
        return <FaExclamationTriangle className="text-gray-600 text-lg" />;
    }
  };

  const getEventColor = (type: MatchEvent['type']) => {
    switch (type) {
      case 'GOAL':
        return 'border-green-200 bg-green-50';
      case 'YELLOW_CARD':
        return 'border-yellow-200 bg-yellow-50';
      case 'RED_CARD':
        return 'border-red-200 bg-red-50';
      case 'SUBSTITUTION':
        return 'border-blue-200 bg-blue-50';
      case 'FOUL':
        return 'border-orange-200 bg-orange-50';
      case 'SHOT':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getTeamColor = (team: 'home' | 'away') => {
    return team === 'home' ? 'text-blue-700' : 'text-red-700';
  };

  const sortedEvents = [...events].sort((a, b) => b.minute - a.minute);

  if (sortedEvents.length === 0) {
    return (
      <div className="text-center py-12">
        <FaExclamationTriangle className="text-4xl text-gray-300 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-600">No Events Yet</h3>
        <p className="text-gray-500">Match events will appear here as they happen</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h3 className="text-2xl font-bold text-gray-900">Match Timeline</h3>
        <div className="text-sm text-gray-500">
          {sortedEvents.length} event{sortedEvents.length !== 1 ? 's' : ''}
        </div>
      </div>

      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-gray-300" />

        <div className="space-y-8">
          {sortedEvents.map((event, index) => (
            <div
              key={event.id}
              className={`relative flex items-center justify-between ${
                event.team === 'home' ? 'flex-row' : 'flex-row-reverse'
              }`}
            >
              {/* Timeline dot */}
              <div className={`absolute left-1/2 transform -translate-x-1/2 w-4 h-4 rounded-full border-2 border-white ${
                event.type === 'GOAL' ? 'bg-green-500' :
                event.type === 'YELLOW_CARD' ? 'bg-yellow-500' :
                event.type === 'RED_CARD' ? 'bg-red-500' : 'bg-gray-500'
              }`} />

              {/* Event card */}
              <div
                className={`w-[45%] p-4 rounded-xl border ${getEventColor(event.type)} shadow-sm`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {getEventIcon(event.type)}
                    <span className={`font-semibold ${getTeamColor(event.team)}`}>
                      {event.team === 'home' ? 'Home' : 'Away'}
                    </span>
                  </div>
                  <div className="px-3 py-1 bg-white rounded-full border border-gray-300">
                    <span className="font-bold text-gray-900">{event.minute}'</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <FaUserAlt className="text-gray-400" />
                    <span className="font-medium">{event.player}</span>
                  </div>

                  <p className="text-gray-700">{event.description}</p>

                  {event.assistPlayer && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <span>Assist:</span>
                      <span className="font-medium">{event.assistPlayer}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="capitalize">
                      {event.type.toLowerCase().replace('_', ' ')}
                    </span>
                    <span>
                      {new Date(event.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Empty space for alignment */}
              <div className="w-[45%]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}