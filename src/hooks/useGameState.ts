import { useState, useCallback, useEffect } from 'react';
import { GameState, Player, Question, Skill } from '@/types/game';

const INITIAL_LIVES = 3;
const MAX_QUESTIONS = 10;

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>({
    players: [
      { name: '', lives: INITIAL_LIVES, score: 0, isActive: true },
      { name: '', lives: INITIAL_LIVES, score: 0, isActive: false }
    ],
    currentQuestionIndex: 0,
    currentPlayerIndex: 0,
    questions: [],
    gameMode: 'setup',
    timeRemaining: 0,
    lastChancePlayer: null,
    winner: null,
    skill: null
  });

  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);

  const initializeGame = useCallback((player1Name: string, player2Name: string, skill: Skill) => {
    // Shuffle questions for variety
    const shuffledQuestions = [...skill.questions].sort(() => Math.random() - 0.5);
    
    setGameState({
      players: [
        { name: player1Name, lives: INITIAL_LIVES, score: 0, isActive: true },
        { name: player2Name, lives: INITIAL_LIVES, score: 0, isActive: false }
      ],
      currentQuestionIndex: 0,
      currentPlayerIndex: 0,
      questions: shuffledQuestions.slice(0, MAX_QUESTIONS),
      gameMode: 'battle',
      timeRemaining: skill.timePerQuestion,
      lastChancePlayer: null,
      winner: null,
      skill
    });
  }, []);

  const startTimer = useCallback(() => {
    if (timer) clearInterval(timer);
    
    const newTimer = setInterval(() => {
      setGameState(prev => {
        if (prev.timeRemaining <= 1) {
          // Time's up - missed attack
          return handleMissedAttack(prev);
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
    }, 1000);
    
    setTimer(newTimer);
  }, [timer]);

  const handleMissedAttack = useCallback((state: GameState): GameState => {
    const nextPlayerIndex = 1 - state.currentPlayerIndex;
    const nextQuestionIndex = state.currentQuestionIndex + 1;
    
    // Check if game should end
    if (nextQuestionIndex >= state.questions.length) {
      return { ...state, gameMode: 'sudden-death' };
    }

    return {
      ...state,
      currentPlayerIndex: nextPlayerIndex,
      currentQuestionIndex: nextQuestionIndex,
      timeRemaining: state.skill?.timePerQuestion || 25,
      players: state.players.map((player, index) => ({
        ...player,
        isActive: index === nextPlayerIndex
      })) as [Player, Player]
    };
  }, []);

  const handleAnswer = useCallback((selectedAnswer: number) => {
    if (timer) clearInterval(timer);
    
    setGameState(prev => {
      const currentQuestion = prev.questions[prev.currentQuestionIndex];
      const isCorrect = selectedAnswer === currentQuestion.correct;
      const currentPlayerIndex = prev.currentPlayerIndex;
      const opponentIndex = 1 - currentPlayerIndex;
      
      let newPlayers = [...prev.players] as [Player, Player];
      let newGameMode = prev.gameMode;
      let newWinner = prev.winner;
      let newLastChancePlayer = prev.lastChancePlayer;

      if (isCorrect) {
        // Correct answer - attack opponent
        newPlayers[opponentIndex] = {
          ...newPlayers[opponentIndex],
          lives: newPlayers[opponentIndex].lives - 1
        };
        
        newPlayers[currentPlayerIndex] = {
          ...newPlayers[currentPlayerIndex],
          score: newPlayers[currentPlayerIndex].score + 1
        };

        // Check for last chance or victory
        if (newPlayers[opponentIndex].lives <= 0) {
          if (newLastChancePlayer === opponentIndex) {
            // Game over - current player wins
            newWinner = newPlayers[currentPlayerIndex];
            newGameMode = 'victory';
          } else {
            // First time hitting 0 lives - last chance
            newLastChancePlayer = opponentIndex;
          }
        }
      }

      // Move to next turn
      const nextPlayerIndex = 1 - currentPlayerIndex;
      const nextQuestionIndex = prev.currentQuestionIndex + 1;
      
      // Check for sudden death
      if (nextQuestionIndex >= prev.questions.length && newGameMode !== 'victory') {
        newGameMode = 'sudden-death';
      }

      // Update active player
      newPlayers = newPlayers.map((player, index) => ({
        ...player,
        isActive: index === nextPlayerIndex
      })) as [Player, Player];

      return {
        ...prev,
        players: newPlayers,
        currentPlayerIndex: nextPlayerIndex,
        currentQuestionIndex: nextQuestionIndex,
        timeRemaining: prev.skill?.timePerQuestion || 25,
        gameMode: newGameMode,
        winner: newWinner,
        lastChancePlayer: newLastChancePlayer
      };
    });
  }, [timer]);

  const resetGame = useCallback(() => {
    if (timer) clearInterval(timer);
    setGameState({
      players: [
        { name: '', lives: INITIAL_LIVES, score: 0, isActive: true },
        { name: '', lives: INITIAL_LIVES, score: 0, isActive: false }
      ],
      currentQuestionIndex: 0,
      currentPlayerIndex: 0,
      questions: [],
      gameMode: 'setup',
      timeRemaining: 0,
      lastChancePlayer: null,
      winner: null,
      skill: null
    });
  }, [timer]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [timer]);

  // Start timer when game starts or question changes
  useEffect(() => {
    if (gameState.gameMode === 'battle' && gameState.timeRemaining > 0) {
      startTimer();
    }
  }, [gameState.currentQuestionIndex, gameState.gameMode, startTimer]);

  return {
    gameState,
    initializeGame,
    handleAnswer,
    resetGame,
    startTimer
  };
};