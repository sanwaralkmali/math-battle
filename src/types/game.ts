export interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
}
export type RawQuestion = Question & {
  wave?: number;
  choices?: string[];
  answer?: string;
};

export interface Skill {
  title: string;
  description: string;
  waves: number;
  timePerQuestion: number;
  questions: Question[];
}

export interface Player {
  name: string;
  lives: number;
  score: number;
  isActive: boolean;
  answerTime?: number;
}

export interface GameState {
  players: [Player, Player];
  currentQuestionIndex: number;
  currentPlayerIndex: number;
  questions: Question[];
  gameMode: 'setup' | 'battle' | 'victory' | 'sudden-death';
  timeRemaining: number;
  lastChancePlayer: number | null;
  winner: Player | null;
  skill: Skill | null;
}

export interface GameStats {
  wins: number;
  losses: number;
  totalGames: number;
  bestTime: number;
}

export interface LeaderboardEntry {
  playerName: string;
  wins: number;
  gamesPlayed: number;
  winRate: number;
  bestTime: number;
  date: string;
}