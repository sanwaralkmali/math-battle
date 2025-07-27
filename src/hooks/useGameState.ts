import { useState, useCallback, useEffect } from 'react';
import { GameState, Player, Question, Skill, RawQuestion } from '@/types/game';

const INITIAL_LIVES = 3;
const MAX_QUESTIONS = 10;
const SUDDEN_DEATH_QUESTIONS = 2; // One for each player

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
    lastChancePlayer: null, // 1 for Player 2's last chance
    winner: null,
    skill: null
  });

  // Remove timer state and startTimer

  const initializeGame = useCallback((player1Name: string, player2Name: string, skill: Skill) => {
    // Helper to shuffle an array
    function shuffleArray<T>(array: T[]): T[] {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    }

    // Wave-based question selection
    const waves: Record<number, RawQuestion[]> = {};
    for (const q of skill.questions) {
      const wave = (q as RawQuestion).wave || 1;
      if (!waves[wave]) waves[wave] = [];
      waves[wave].push(q as RawQuestion);
    }

    const mainQuestions: RawQuestion[] = [];
    for (let i = 1; i <= 5; i++) {
      mainQuestions.push(...shuffleArray(waves[i] || []).slice(0, 2));
    }
    mainQuestions.sort((a, b) => ((a as RawQuestion).wave || 1) - ((b as RawQuestion).wave || 1));

    // Select 2 questions from wave 4 for sudden death (one for each player)
    const wave4Questions = shuffleArray(waves[4] || []);
    const suddenDeathQuestions = wave4Questions.slice(0, SUDDEN_DEATH_QUESTIONS);

    const allRawQuestions = [...mainQuestions, ...suddenDeathQuestions];
    
    const processedQuestions = allRawQuestions.map((q, idx) => {
      // Type guards for compatibility
      const hasChoices = (obj: unknown): obj is { choices: string[] } => typeof obj === 'object' && obj !== null && Array.isArray((obj as unknown as { choices?: unknown }).choices);
      const hasOptions = (obj: unknown): obj is { options: string[] } => typeof obj === 'object' && obj !== null && Array.isArray((obj as unknown as { options?: unknown }).options);
      const hasAnswer = (obj: unknown): obj is { answer: string } => typeof obj === 'object' && obj !== null && (typeof (obj as unknown as { answer?: unknown }).answer === 'string' || typeof (obj as unknown as { answer?: unknown }).answer === 'number');
      const hasCorrect = (obj: unknown): obj is { correct: number } => typeof obj === 'object' && obj !== null && typeof (obj as unknown as { correct?: unknown }).correct === 'number';
      const options = hasChoices(q) ? [...q.choices] : hasOptions(q) ? [...q.options] : [];
      const answer = hasAnswer(q) ? q.answer : hasCorrect(q) && hasOptions(q) ? q.options[q.correct] : undefined;
      const shuffledOptions = shuffleArray(options);
      const correctIndex = shuffledOptions.findIndex(opt => String(opt) === String(answer));
      return {
        id: q.id ?? idx,
        question: q.question,
        options: shuffledOptions,
        correct: correctIndex
      };
    });
    setGameState({
      players: [
        { name: player1Name, lives: INITIAL_LIVES, score: 0, isActive: true },
        { name: player2Name, lives: INITIAL_LIVES, score: 0, isActive: false }
      ],
      currentQuestionIndex: 0,
      currentPlayerIndex: 0,
      questions: processedQuestions,
      gameMode: 'battle',
      timeRemaining: skill.timePerQuestion,
      lastChancePlayer: null,
      winner: null,
      skill
    });
  }, []);

  // Decrement timer by 1 (to be called by UI interval)
  const decrementTimer = useCallback(() => {
      setGameState(prev => {
        if (prev.timeRemaining <= 1) {
          // Time's up - missed attack
          return handleMissedAttack(prev);
        }
        return { ...prev, timeRemaining: prev.timeRemaining - 1 };
      });
  }, []);
    
  // Expose missed attack trigger for UI
  const triggerMissedAttack = useCallback(() => {
    setGameState(prev => handleMissedAttack(prev));
  }, []);

  const handleMissedAttack = useCallback((state: GameState): GameState => {
    const nextPlayerIndex = 1 - state.currentPlayerIndex;
    const nextQuestionIndex = state.currentQuestionIndex + 1;
    let newGameMode = state.gameMode;
    let newWinner = state.winner;
    
    // Check for game end after 10 questions
    if (nextQuestionIndex >= MAX_QUESTIONS) {
      if (state.players[0].lives > state.players[1].lives) {
        newWinner = state.players[0];
        newGameMode = 'victory';
      } else if (state.players[1].lives > state.players[0].lives) {
        newWinner = state.players[1];
        newGameMode = 'victory';
      } else {
        newGameMode = 'sudden-death';
    }
    }

    // If game continues, update state
    if (newGameMode !== 'victory') {
    return {
      ...state,
      currentPlayerIndex: nextPlayerIndex,
      currentQuestionIndex: nextQuestionIndex,
      timeRemaining: state.skill?.timePerQuestion || 25,
      players: state.players.map((player, index) => ({
        ...player,
        isActive: index === nextPlayerIndex
        })) as [Player, Player],
        gameMode: newGameMode,
        winner: newWinner
    };
    }
    // If game ended, just update mode and winner
    return { ...state, gameMode: newGameMode, winner: newWinner };
  }, []);

    
  const handleAnswer = useCallback((selectedAnswer: number, timeTaken?: number) => {
    setGameState(prev => {
      const currentQuestion = prev.questions[prev.currentQuestionIndex];
      const isCorrect = selectedAnswer === currentQuestion.correct;
      const currentPlayerIndex = prev.currentPlayerIndex;
      const opponentIndex = 1 - currentPlayerIndex;
      let newPlayers = [...prev.players] as [Player, Player];
      let newGameMode = prev.gameMode;
      let newWinner = prev.winner;
      let newLastChancePlayer = prev.lastChancePlayer;

      // --- LAST CHANCE LOGIC ---
      // If Player 2 is in last chance
      if (prev.lastChancePlayer === 1 && currentPlayerIndex === 1) {
        if (isCorrect) {
          // Player 2 gets 1 heart back, continues, no attack
          newPlayers[1] = { ...newPlayers[1], lives: 1 };
          newLastChancePlayer = null;
        } else {
          // Player 2 loses the game
          newWinner = newPlayers[0];
          newGameMode = 'victory';
        }
        // Move to next turn or end game
        const nextPlayerIndex = 0;
        const nextQuestionIndex = prev.currentQuestionIndex + 1;
        // Sudden death check
        if (nextQuestionIndex >= MAX_QUESTIONS && newGameMode !== 'victory') {
          newGameMode = 'sudden-death';
        }
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
      }

      // --- SUDDEN DEATH LOGIC ---
      if (prev.gameMode === 'sudden-death') {
        if (!isCorrect) {
          // Wrong answer in sudden death - mark with -1
          newPlayers[currentPlayerIndex] = { ...newPlayers[currentPlayerIndex], answerTime: -1 };
          
          // Check if both players have answered
          const p1Answered = newPlayers[0].answerTime !== undefined;
          const p2Answered = newPlayers[1].answerTime !== undefined;
          
          if (p1Answered && p2Answered) {
            // Both players have answered, check if both were wrong
            const p1WasWrong = newPlayers[0].answerTime === -1;
            const p2WasWrong = newPlayers[1].answerTime === -1;
            
            if (p1WasWrong && p2WasWrong) {
              // Both players answered incorrectly - it's a tie, no winner
              newWinner = undefined;
              newGameMode = 'victory';
            } else {
              // Only current player was wrong, opponent wins
              newWinner = newPlayers[opponentIndex];
              newGameMode = 'victory';
            }
          }
          // If not both answered yet, continue to next player
        } else {
          // Correct answer - record the time
          newPlayers[currentPlayerIndex] = { ...newPlayers[currentPlayerIndex], answerTime: timeTaken };
          
          // Check if both players have answered
          const p1Answered = newPlayers[0].answerTime !== undefined;
          const p2Answered = newPlayers[1].answerTime !== undefined;
          
          if (p1Answered && p2Answered) {
            // Both players have answered, check if both were correct
            const p1WasCorrect = newPlayers[0].answerTime !== -1;
            const p2WasCorrect = newPlayers[1].answerTime !== -1;
            
            if (p1WasCorrect && p2WasCorrect) {
              // Both players answered correctly, compare times
              const p1Time = newPlayers[0].answerTime || Infinity;
              const p2Time = newPlayers[1].answerTime || Infinity;
              newWinner = p1Time < p2Time ? newPlayers[0] : newPlayers[1];
              newGameMode = 'victory';
            } else if (p1WasCorrect && !p2WasCorrect) {
              // Only Player 1 was correct
              newWinner = newPlayers[0];
              newGameMode = 'victory';
            } else if (!p1WasCorrect && p2WasCorrect) {
              // Only Player 2 was correct
              newWinner = newPlayers[1];
              newGameMode = 'victory';
            }
            // If neither was correct, it's already handled above
          }
          // If not both answered yet, continue to next player
        }
        
        // Move to next turn or end game
        const nextPlayerIndex = 1 - currentPlayerIndex;
        const nextQuestionIndex = prev.currentQuestionIndex + 1;
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
      }

      // --- NORMAL LOGIC ---
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
        if (opponentIndex === 1 && newPlayers[1].lives <= 0) {
          // Player 2 last chance
          if (prev.lastChancePlayer === 1) {
            // Already had last chance, Player 1 wins
            newWinner = newPlayers[0];
            newGameMode = 'victory';
          } else {
            // First time hitting 0 lives for Player 2
            newLastChancePlayer = 1;
            newPlayers[1] = { ...newPlayers[1], lives: 0 }; // Stay at 0 until last chance is resolved
          }
        } else if (opponentIndex === 0 && newPlayers[0].lives <= 0) {
          // Player 1 loses, Player 2 wins (no last chance for Player 1)
          newWinner = newPlayers[1];
          newGameMode = 'victory';
        }
      }

      // Move to next turn
      const nextPlayerIndex = 1 - currentPlayerIndex;
      const nextQuestionIndex = prev.currentQuestionIndex + 1;
      
      // Check for end of normal game (after 10 questions)
      if (newGameMode !== 'victory' && nextQuestionIndex >= MAX_QUESTIONS) {
        if (newPlayers[0].lives > newPlayers[1].lives) {
          newWinner = newPlayers[0];
          newGameMode = 'victory';
        } else if (newPlayers[1].lives > newPlayers[0].lives) {
          newWinner = newPlayers[1];
          newGameMode = 'victory';
        } else {
          // Lives are tied, compare scores
          if (newPlayers[0].score > newPlayers[1].score) {
            newWinner = newPlayers[0];
            newGameMode = 'victory';
          } else if (newPlayers[1].score > newPlayers[0].score) {
            newWinner = newPlayers[1];
            newGameMode = 'victory';
          } else {
            // Tie in lives and score, start sudden death
            newGameMode = 'sudden-death';
            // Reset answer times for sudden death
            newPlayers = newPlayers.map(player => ({ ...player, answerTime: undefined })) as [Player, Player];
          }
        }
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
  }, []);

  const resetGame = useCallback(() => {
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
  }, []);

  return {
    gameState,
    initializeGame,
    handleAnswer,
    resetGame,
    decrementTimer,
    triggerMissedAttack
  };
};