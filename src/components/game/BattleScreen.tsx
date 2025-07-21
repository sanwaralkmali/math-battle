import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayerPanel } from './PlayerPanel';
import { QuestionCard } from './QuestionCard';
import { AttackAnimation } from './AttackAnimation';
import { GameState } from '@/types/game';
import { useGameState } from '@/hooks/useGameState';

interface BattleScreenProps {
  gameState: GameState;
  onAnswer: (answer: number, timeTaken?: number) => void;
  decrementTimer: () => void;
  triggerMissedAttack: () => void;
}

export const BattleScreen = ({ gameState, onAnswer, decrementTimer, triggerMissedAttack }: BattleScreenProps & {
  decrementTimer: () => void;
  triggerMissedAttack: () => void;
}) => {
  const [showAttack, setShowAttack] = useState(false);
  const [attackingPlayer, setAttackingPlayer] = useState<1 | 2>(1);
  const [prevLives, setPrevLives] = useState([3, 3]);
  const [pendingAnswer, setPendingAnswer] = useState<number | null>(null);
  const [pendingCorrect, setPendingCorrect] = useState<boolean>(false);
  const attackTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const [timerActive, setTimerActive] = useState(true);
  const questionStartTime = useRef<number>(0);

  const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  // Monitor for attacks (life changes)
  useEffect(() => {
    const currentLives = gameState.players.map(p => p.lives);
    setPrevLives(currentLives);
  }, [gameState.players]);

  // Clean up any pending timeouts on unmount
  useEffect(() => {
    return () => {
      if (attackTimeoutRef.current) clearTimeout(attackTimeoutRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // Timer management
  useEffect(() => {
    // Only run timer if in battle mode, not during feedback/animation
    if (gameState.gameMode === 'battle' && timerActive && gameState.timeRemaining > 0) {
      timerIntervalRef.current = setInterval(() => {
        decrementTimer();
      }, 1000);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [gameState.gameMode, timerActive, gameState.currentQuestionIndex]);

  // Record question start time
  useEffect(() => {
    questionStartTime.current = Date.now();
  }, [gameState.currentQuestionIndex]);

  // Stop timer during feedback/animation
  useEffect(() => {
    if (pendingAnswer !== null) {
      setTimerActive(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    } else {
      setTimerActive(true);
    }
  }, [pendingAnswer]);

  // If time runs out, trigger missed attack
  useEffect(() => {
    if (gameState.timeRemaining === 0 && gameState.gameMode === 'battle') {
      setTimerActive(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      triggerMissedAttack();
    }
  }, [gameState.timeRemaining, gameState.gameMode]);

  // Handle answer with animation sync
  const handleFeedbackComplete = (answer: number, correct: boolean) => {
    const timeTaken = (Date.now() - questionStartTime.current) / 1000; // in seconds
    if (correct) {
      setAttackingPlayer((gameState.currentPlayerIndex + 1) as 1 | 2);
      setShowAttack(true);
      setPendingAnswer(answer);
      setPendingCorrect(true);
      // Wait for animation, then call onAnswer
      attackTimeoutRef.current = setTimeout(() => {
        setShowAttack(false);
        setPendingAnswer(null);
        setPendingCorrect(false);
        onAnswer(answer, timeTaken);
      }, 1100); // Match AttackAnimation duration
    } else {
      setPendingAnswer(answer);
      setPendingCorrect(false);
      // No animation, just call onAnswer after feedback
      attackTimeoutRef.current = setTimeout(() => {
        setPendingAnswer(null);
        onAnswer(answer, timeTaken);
      }, 200); // Short delay for feedback
    }
  };

  if (!currentQuestion) {
    if (gameState.gameMode === 'sudden-death') {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Sudden Death! Fastest answer wins!</h2>
            {/* You can add a sudden death UI here if needed */}
          </div>
        </div>
      );
    }
    if (gameState.gameMode === 'victory') {
      return null; // Parent will render VictoryScreen
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">No more questions available.</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 p-4">
      {/* Attack Animation Overlay */}
      <AttackAnimation
        fromPlayer={attackingPlayer}
        isVisible={showAttack}
        onComplete={() => setShowAttack(false)}
      />

      <div className="max-w-7xl mx-auto">
        {/* Progress indicator - at the top */}
        <motion.div 
          className="mt-0 mb-6 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Battle Progress</span>
            <span>
              {gameState.currentQuestionIndex + 1} / {gameState.questions.length}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div 
              className="h-2 rounded-full battle-gradient"
              initial={{ width: 0 }}
              animate={{ 
                width: `${((gameState.currentQuestionIndex + 1) / gameState.questions.length) * 100}%` 
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </motion.div>

        {/* Header with game info */}
        <motion.div 
          className="text-center mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold bg-gradient-to-r from-battle-primary to-battle-secondary 
                         bg-clip-text text-transparent mb-2">
            MathBattle
          </h1>
          {gameState.gameMode === 'sudden-death' && (
            <motion.div
              className="inline-block px-4 py-2 bg-battle-danger text-white rounded-full font-bold"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              ⚡ SUDDEN DEATH ⚡
            </motion.div>
          )}
        </motion.div>

        {/* Main Game Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Player 1 Panel */}
          <PlayerPanel
            player={gameState.players[0]}
            playerNumber={1}
            isLastChance={gameState.lastChancePlayer === 0}
            className="order-1 lg:order-1"
          />

          {/* Question Card */}
          <div className="order-3 lg:order-2">
            <AnimatePresence mode="wait">
              <QuestionCard
                key={currentQuestion.id}
                question={currentQuestion}
                questionNumber={gameState.currentQuestionIndex + 1}
                totalQuestions={gameState.questions.length}
                timeRemaining={gameState.timeRemaining}
                totalTime={gameState.skill?.timePerQuestion || 25}
                onAnswer={onAnswer}
                onFeedbackComplete={handleFeedbackComplete}
              />
            </AnimatePresence>

            {/* Current Player Indicator */}
            <motion.div 
              className="text-center mt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <p className="text-lg font-semibold text-muted-foreground">
                <span className={`text-player-${gameState.currentPlayerIndex + 1}`}>
                  {currentPlayer.name}
                </span>
                's turn
              </p>
            </motion.div>
          </div>

          {/* Player 2 Panel */}
          <PlayerPanel
            player={gameState.players[1]}
            playerNumber={2}
            isLastChance={gameState.lastChancePlayer === 1}
            className="order-2 lg:order-3"
          />
        </div>
      </div>
    </div>
  );
};