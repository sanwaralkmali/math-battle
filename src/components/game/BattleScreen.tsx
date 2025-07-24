import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayerPanel } from "./PlayerPanel";
import { QuestionCard } from "./QuestionCard";
import { AttackAnimation } from "./AttackAnimation";
import { GameState } from "@/types/game";
import { useGameState } from "@/hooks/useGameState";
import { useToast } from "@/hooks/use-toast";

interface BattleScreenProps {
  gameState: GameState;
  onAnswer: (answer: number, timeTaken?: number) => void;
  decrementTimer: () => void;
  triggerMissedAttack: () => void;
}

export const BattleScreen = ({
  gameState,
  onAnswer,
  decrementTimer,
  triggerMissedAttack,
}: BattleScreenProps & {
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
  const { toast } = useToast();

  const currentQuestion = gameState.questions[gameState.currentQuestionIndex];
  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  // Monitor for attacks (life changes)
  useEffect(() => {
    const currentLives = gameState.players.map((p) => p.lives);
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
    if (
      gameState.gameMode === "battle" &&
      timerActive &&
      gameState.timeRemaining > 0
    ) {
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
    if (gameState.timeRemaining === 0 && gameState.gameMode === "battle") {
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
    if (gameState.gameMode === "sudden-death") {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">
              Sudden Death! Fastest answer wins!
            </h2>
            {/* You can add a sudden death UI here if needed */}
          </div>
        </div>
      );
    }
    if (gameState.gameMode === "victory") {
      return null; // Parent will render VictoryScreen
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            No more questions available.
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 p-4 flex flex-col items-center justify-center">
      {/* Attack Animation Overlay */}
      <AttackAnimation
        fromPlayer={attackingPlayer}
        isVisible={showAttack}
        onComplete={() => setShowAttack(false)}
      />
      {/* Shared container for player cards and question card */}
      <div className="w-full max-w-3xl flex flex-col gap-4 flex-1 min-h-0 justify-center">
        {/* Player Cards Row */}
        <div className="flex flex-row gap-2 w-full mb-0">
          <PlayerPanel
            player={gameState.players[0]}
            playerNumber={1}
            isLastChance={gameState.lastChancePlayer === 0}
            className="w-1/2 min-w-0"
          />
          <PlayerPanel
            player={gameState.players[1]}
            playerNumber={2}
            isLastChance={gameState.lastChancePlayer === 1}
            className="w-1/2 min-w-0"
          />
        </div>

        {/* Large Question Card Centered, fits with player cards */}
        <div className="w-full flex-1 flex justify-center items-center min-h-0">
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
              showToast={(msg, type) =>
                toast({
                  description: msg,
                  variant: type === "success" ? "default" : "destructive",
                })
              }
              cardWidthClass="w-full"
            />
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
