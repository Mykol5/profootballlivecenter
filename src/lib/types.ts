// lib/types.ts
export interface Team {
  id: string;
  name: string;
  shortName: string;
}

// RENAME THIS from Match to FootballMatch
export interface FootballMatch {
  id: string;
  homeTeam: Team;
  awayTeam: Team;
  homeScore: number;
  awayScore: number;
  minute: number;
  status: MatchStatus;
  startTime: string;
}

export type MatchStatus = 
  | 'NOT_STARTED'
  | 'FIRST_HALF'
  | 'HALF_TIME'
  | 'SECOND_HALF'
  | 'FULL_TIME';

export interface MatchEvent {
  id: string;
  type: EventType;
  minute: number;
  team: 'home' | 'away';
  player: string;
  assistPlayer?: string;
  description: string;
  timestamp: string;
}

export type EventType = 
  | 'GOAL'
  | 'YELLOW_CARD'
  | 'RED_CARD'
  | 'SUBSTITUTION'
  | 'FOUL'
  | 'SHOT';

export interface MatchStatistics {
  possession: { home: number; away: number };
  shots: { home: number; away: number };
  shotsOnTarget: { home: number; away: number };
  corners: { home: number; away: number };
  fouls: { home: number; away: number };
  yellowCards: { home: number; away: number };
  redCards: { home: number; away: number };
}

// Update this to extend FootballMatch instead of Match
export interface MatchDetail extends FootballMatch {
  events: MatchEvent[];
  statistics: MatchStatistics;
}

export interface ChatMessage {
  matchId: string;
  userId: string;
  username: string;
  message: string;
  timestamp: string;
}

export interface TypingIndicator {
  matchId: string;
  userId: string;
  username: string;
  isTyping: boolean;
}

export interface SocketEventMap {
  score_update: {
    matchId: string;
    homeScore: number;
    awayScore: number;
  };
  match_event: Omit<MatchEvent, 'id'> & { matchId: string };
  stats_update: {
    matchId: string;
    statistics: MatchStatistics;
  };
  status_change: {
    matchId: string;
    status: MatchStatus;
    minute: number;
  };
  chat_message: ChatMessage;
  user_joined: {
    matchId: string;
    userId: string;
    username: string;
  };
  user_left: {
    matchId: string;
    userId: string;
    username: string;
  };
  typing_indicator: TypingIndicator;
  error: {
    code: string;
    message: string;
  };
}

