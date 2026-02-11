
// main screen
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { fetchMatches, fetchLiveMatches } from '@/lib/api';
import { FootballMatch } from '@/lib/types';
import MatchCard from '@/components/MatchCard';
import ConnectionStatus from '@/components/ConnectionStatus';
import { useWebSocket } from '@/hooks/useWebSocket';
import { 
  FaSync, FaFutbol, FaTv, FaExclamationTriangle, 
  FaCalendarAlt, FaSearch, FaBell, FaCog, 
  FaArrowRight, FaFire, FaClock, FaChartLine,
  FaUserCircle, FaStar, FaFilter
} from 'react-icons/fa';
import { IoMdStats, IoMdFootball } from 'react-icons/io';
import { GiSoccerBall, GiWhistle } from 'react-icons/gi';
import { MdSportsSoccer, MdDashboard, MdEvent, MdTrendingUp } from 'react-icons/md';

export default function Home() {
  const [matches, setMatches] = useState<FootballMatch[]>([]);
  const [liveMatches, setLiveMatches] = useState<FootballMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'featured'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { onEvent, isConnected } = useWebSocket();

  const loadMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [allMatchesResponse, liveMatchesResponse] = await Promise.all([
        fetchMatches(),
        fetchLiveMatches(),
      ]);

      if (allMatchesResponse.success && allMatchesResponse.data) {
        setMatches(allMatchesResponse.data.matches || []);
      } else {
        setMatches([]);
      }

      if (liveMatchesResponse.success && liveMatchesResponse.data) {
        setLiveMatches(liveMatchesResponse.data.matches || []);
      } else {
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
    sessionStorage.setItem(`match-${match.id}`, JSON.stringify(match));
    router.push(`/matches/${match.id}`);
  };

  const filteredMatches = (activeTab === 'live' ? liveMatches : matches).filter(match => 
    match.homeTeam.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    match.awayTeam.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const liveCount = liveMatches.length;
  const featuredMatch = liveMatches[0] || matches[0];

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <ConnectionStatus isConnected={isConnected} />
        <div className="flex items-center justify-center min-h-screen p-6">
          <div className="max-w-md w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/50 dark:border-slate-800/50 p-10 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-red-500/30">
              <FaExclamationTriangle className="text-4xl text-white" />
            </div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-3">
              Connection Lost
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-8">{error}</p>
            <button
              onClick={loadMatches}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-2xl flex items-center gap-3 mx-auto transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl hover:scale-105"
            >
              <FaSync className={loading ? 'animate-spin' : ''} />
              <span>{loading ? 'Reconnecting...' : 'Retry Connection'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <ConnectionStatus isConnected={isConnected} />
      
      {/* Premium Header with Glassmorphism */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo & Brand */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur-lg opacity-70 animate-pulse"></div>
                <div className="relative w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/30">
                  <GiSoccerBall className="text-2xl text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Match<span className="text-blue-600 dark:text-blue-500">Center</span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  Live Updates
                </p>
              </div>
            </div>

            {/* Search Bar - Premium */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
              <div className="relative w-full">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-2xl blur"></div>
                <div className="relative flex items-center">
                  <FaSearch className="absolute left-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search teams, leagues, or matches..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30 placeholder-slate-400 dark:placeholder-slate-500 backdrop-blur-sm"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button className="relative p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all duration-300 group">
                <FaBell className="text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-500" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-slate-900"></span>
              </button>
              <button className="p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all duration-300 group">
                <FaCog className="text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-500 group-hover:rotate-90 transition-transform duration-500" />
              </button>
              <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-50"></div>
                  <div className="relative w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center">
                    <FaUserCircle className="text-xl text-white" />
                  </div>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">Alex Morgan</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Premium Member</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section - Featured Match */}
        {featuredMatch && liveMatches.length > 0 && (
          <div className="mb-10 relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 rounded-3xl blur-2xl"></div>
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl overflow-hidden border border-slate-700/50 shadow-2xl">
              <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/20 rounded-full -translate-x-16 -translate-y-16 blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full translate-x-16 translate-y-16 blur-3xl"></div>
              
              <div className="relative p-6 md:p-8">
                <div className="flex items-center gap-2 mb-6">
                  <span className="px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-red-500/30">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                    LIVE NOW
                  </span>
                  <span className="px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium text-white/80">
                    {featuredMatch.minute}' • {featuredMatch.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  {/* Home Team */}
                  <div className="flex flex-col items-center md:w-1/3">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full blur-xl opacity-50"></div>
                      <div className="relative w-24 h-24 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center border-4 border-white/10 shadow-2xl">
                        <MdSportsSoccer className="text-4xl text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">{featuredMatch.homeTeam.name}</h3>
                    <span className="text-sm text-white/60">{featuredMatch.homeTeam.shortName}</span>
                  </div>

                  {/* Score */}
                  <div className="flex flex-col items-center md:w-1/3">
                    <div className="flex items-center gap-4 md:gap-6 mb-4">
                      <span className="text-5xl md:text-7xl font-black text-white">{featuredMatch.homeScore}</span>
                      <span className="text-3xl md:text-5xl font-black text-white/30">:</span>
                      <span className="text-5xl md:text-7xl font-black text-white">{featuredMatch.awayScore}</span>
                    </div>
                    <button 
                      onClick={() => handleMatchClick(featuredMatch)}
                      className="group px-8 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl text-white font-semibold flex items-center gap-2 transition-all duration-300 border border-white/20"
                    >
                      <span>Match Center</span>
                      <FaArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>

                  {/* Away Team */}
                  <div className="flex flex-col items-center md:w-1/3">
                    <div className="relative mb-4">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-orange-500 rounded-full blur-xl opacity-50"></div>
                      <div className="relative w-24 h-24 bg-gradient-to-br from-slate-700 to-slate-800 rounded-full flex items-center justify-center border-4 border-white/10 shadow-2xl">
                        <IoMdFootball className="text-4xl text-white" />
                      </div>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1">{featuredMatch.awayTeam.name}</h3>
                    <span className="text-sm text-white/60">{featuredMatch.awayTeam.shortName}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-2">
              Match Dashboard
            </h2>
            <p className="text-slate-600 dark:text-slate-400 flex items-center gap-2">
              <FaCalendarAlt className="text-blue-500" />
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>

          {/* Stats Cards */}
          <div className="flex flex-wrap gap-4">
            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm px-6 py-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  <IoMdStats className="text-2xl text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{matches.length}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Total Matches</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm px-6 py-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
                  <FaFire className="text-2xl text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{liveCount}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Live Now</p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm px-6 py-4 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-white animate-pulse' : 'bg-slate-300'} `}></div>
                </div>
                <div>
                  <p className={`text-2xl font-bold ${isConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}`}>
                    {isConnected ? 'Live' : 'Offline'}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Connection</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap gap-2 p-1.5 bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shadow-lg">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all duration-300 ${
                activeTab === 'all'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <MdDashboard className="text-lg" />
              All Games
            </button>
            <button
              onClick={() => setActiveTab('live')}
              className={`px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all duration-300 ${
                activeTab === 'live'
                  ? 'bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/30 scale-105'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FaFire className="text-lg" />
              Live
              {liveCount > 0 && (
                <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">
                  {liveCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-6 py-3 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all duration-300 ${
                activeTab === 'featured'
                  ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg shadow-purple-500/30 scale-105'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <FaStar className="text-lg" />
              Featured
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button className="p-3 bg-white dark:bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-800/50 shadow-lg hover:shadow-xl transition-all group">
              <FaFilter className="text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-500" />
            </button>
            <button
              onClick={loadMatches}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg shadow-blue-500/30 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaSync className={loading ? 'animate-spin' : ''} />
              <span>{loading ? 'Refreshing' : 'Refresh'}</span>
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-indigo-600/10 rounded-2xl blur"></div>
            <div className="relative flex items-center">
              <FaSearch className="absolute left-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search matches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-700/50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/30"
              />
            </div>
          </div>
        </div>

        {/* Matches Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center h-96">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full blur-2xl opacity-20 animate-pulse"></div>
              <div className="relative w-20 h-20 border-4 border-blue-200/30 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-6 text-slate-600 dark:text-slate-400 font-medium">Loading matches...</p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="text-center py-20">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 rounded-3xl blur-2xl"></div>
              <div className="relative w-28 h-28 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-2xl">
                <GiSoccerBall className="text-5xl text-slate-400 dark:text-slate-600" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
              {activeTab === 'live' ? 'No Live Matches' : 'No Matches Found'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md mx-auto">
              {activeTab === 'live' 
                ? 'There are no live matches at the moment. Check back soon for action!'
                : searchQuery 
                  ? `No matches found matching "${searchQuery}"`
                  : 'No matches are currently available'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="px-8 py-3 bg-gradient-to-r from-slate-800 to-slate-900 dark:from-slate-700 dark:to-slate-800 text-white font-semibold rounded-xl hover:from-slate-900 hover:to-slate-950 transition-all shadow-lg"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredMatches.map((match, index) => (
              <div
                key={match.id}
                className="transform hover:scale-105 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <MatchCard
                  match={match}
                  isLive={liveMatches.some(m => m.id === match.id)}
                  onClick={() => handleMatchClick(match)}
                />
              </div>
            ))}
          </div>
        )}

        {/* Trending Leagues Section */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-1 h-8 bg-gradient-to-b from-blue-600 to-indigo-600 rounded-full"></div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Trending Leagues
              </h3>
            </div>
            <button className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1">
              View All <FaArrowRight className="text-xs" />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['Premier League', 'La Liga', 'Champions League', 'Serie A'].map((league, i) => (
              <div
                key={i}
                className="group bg-white dark:bg-slate-900/50 backdrop-blur-sm p-5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 hover:border-blue-500/30 hover:shadow-xl transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MdTrendingUp className="text-2xl text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{league}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {Math.floor(Math.random() * 5 + 5)} matches
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
