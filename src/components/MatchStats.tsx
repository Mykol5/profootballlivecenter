'use client';

import { MatchStatistics } from '@/lib/types';
import { 
  FaChartPie, 
  FaBullseye, 
  FaCrosshairs, 
  FaFlag, 
  FaExclamationTriangle,
  FaSquare,
  FaTachometerAlt
} from 'react-icons/fa';

interface MatchStatsProps {
  statistics: MatchStatistics;
}

export default function MatchStats({ statistics }: MatchStatsProps) {
  const statsConfig = [
    {
      key: 'possession',
      label: 'Possession',
      icon: FaChartPie,
      format: (value: number) => `${value}%`,
      max: 100,
      isPercentage: true,
    },
    {
      key: 'shots',
      label: 'Total Shots',
      icon: FaCrosshairs,
      format: (value: number) => value.toString(),
      max: Math.max(statistics.shots.home, statistics.shots.away) * 1.2 || 20,
    },
    {
      key: 'shotsOnTarget',
      label: 'Shots on Target',
      icon: FaBullseye,
      format: (value: number) => value.toString(),
      max: Math.max(statistics.shotsOnTarget.home, statistics.shotsOnTarget.away) * 1.2 || 10,
    },
    {
      key: 'corners',
      label: 'Corners',
      icon: FaFlag,
      format: (value: number) => value.toString(),
      max: Math.max(statistics.corners.home, statistics.corners.away) * 1.2 || 10,
    },
    {
      key: 'fouls',
      label: 'Fouls',
      icon: FaExclamationTriangle,
      format: (value: number) => value.toString(),
      max: Math.max(statistics.fouls.home, statistics.fouls.away) * 1.2 || 15,
    },
    {
      key: 'yellowCards',
      label: 'Yellow Cards',
      icon: FaSquare,
      format: (value: number) => value.toString(),
      max: Math.max(statistics.yellowCards.home, statistics.yellowCards.away) * 1.2 || 5,
      color: 'text-yellow-500',
    },
    {
      key: 'redCards',
      label: 'Red Cards',
      icon: FaSquare,
      format: (value: number) => value.toString(),
      max: Math.max(statistics.redCards.home, statistics.redCards.away) * 1.2 || 2,
      color: 'text-red-500',
    },
  ];

  const calculatePercentage = (value: number, max: number) => {
    return Math.min((value / max) * 100, 100);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-center gap-3 mb-8">
        <FaTachometerAlt className="text-2xl text-blue-600" />
        <h3 className="text-2xl font-bold text-gray-900">Match Statistics</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Possession - Special Visual */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <FaChartPie className="text-xl text-blue-600" />
                <h4 className="text-lg font-bold text-gray-900">Possession</h4>
              </div>
              <div className="text-sm text-gray-500">Ball Control</div>
            </div>

            <div className="flex items-center justify-center gap-8">
              {/* Home Team */}
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-700 mb-2">
                  {statistics.possession.home}%
                </div>
                <div className="text-sm font-medium text-gray-700">Home</div>
              </div>

              {/* Visual Representation */}
              <div className="flex-1">
                <div className="relative h-8 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="absolute left-0 h-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${statistics.possession.home}%` }}
                  />
                  <div
                    className="absolute right-0 h-full bg-red-600 transition-all duration-500"
                    style={{ width: `${statistics.possession.away}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-sm text-gray-600">
                  <span>Home</span>
                  <span>Away</span>
                </div>
              </div>

              {/* Away Team */}
              <div className="text-center">
                <div className="text-4xl font-bold text-red-700 mb-2">
                  {statistics.possession.away}%
                </div>
                <div className="text-sm font-medium text-gray-700">Away</div>
              </div>
            </div>
          </div>
        </div>

        {/* Other Statistics */}
        {statsConfig
          .filter(stat => stat.key !== 'possession')
          .map((stat) => {
            const homeValue = statistics[stat.key as keyof MatchStatistics].home;
            const awayValue = statistics[stat.key as keyof MatchStatistics].away;
            const homePercentage = calculatePercentage(homeValue, stat.max);
            const awayPercentage = calculatePercentage(awayValue, stat.max);
            const Icon = stat.icon;

            return (
              <div key={stat.key} className="bg-white border border-gray-200 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Icon className={`text-xl ${stat.color || 'text-gray-700'}`} />
                    <h4 className="text-lg font-bold text-gray-900">{stat.label}</h4>
                  </div>
                  <div className="text-sm text-gray-500">Total</div>
                </div>

                <div className="space-y-6">
                  {/* Home Team Bar */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-blue-700">Home</span>
                      <span className="font-bold text-gray-900">{stat.format(homeValue)}</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 transition-all duration-500"
                        style={{ width: `${homePercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Away Team Bar */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-medium text-red-700">Away</span>
                      <span className="font-bold text-gray-900">{stat.format(awayValue)}</span>
                    </div>
                    <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-600 transition-all duration-500 ml-auto transition-all duration-500"
                        style={{ width: `${awayPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Comparison */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${homeValue > awayValue ? 'text-green-600' : 'text-gray-600'}`}>
                        {homeValue}
                      </div>
                      <div className="text-xs text-gray-500">Home</div>
                    </div>
                    <div className="text-gray-400">vs</div>
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${awayValue > homeValue ? 'text-green-600' : 'text-gray-600'}`}>
                        {awayValue}
                      </div>
                      <div className="text-xs text-gray-500">Away</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-blue-700">
            {statistics.shots.home + statistics.shots.away}
          </div>
          <div className="text-sm text-gray-600">Total Shots</div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-red-700">
            {statistics.fouls.home + statistics.fouls.away}
          </div>
          <div className="text-sm text-gray-600">Total Fouls</div>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-700">
            {statistics.yellowCards.home + statistics.yellowCards.away}
          </div>
          <div className="text-sm text-gray-600">Yellow Cards</div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-green-700">
            {statistics.shotsOnTarget.home + statistics.shotsOnTarget.away}
          </div>
          <div className="text-sm text-gray-600">Shots on Target</div>
        </div>
      </div>
    </div>
  );
}