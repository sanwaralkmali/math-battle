import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayerPanel } from "./PlayerPanel";
import { QuestionCard } from "./QuestionCard";
import { AttackAnimation } from "./AttackAnimation";
import { GameState } from "@/types/game";
import { useGameState } from "@/hooks/useGameState";
import { useToast } from "@/hooks/use-toast";
import { Zap, Target, Trophy, Star, Calculator, Brain } from "lucide-react";

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
        <div className="h-full flex items-center justify-center bg-gradient-to-br from-red-50 via-white to-orange-50 relative overflow-hidden">
          {/* Animated background elements */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute text-4xl text-red-500/20"
                initial={{ 
                  x: Math.random() * window.innerWidth,
                  y: -50,
                  rotate: 0
                }}
                animate={{ 
                  y: window.innerHeight + 50,
                  rotate: 360,
                  x: Math.random() * window.innerWidth
                }}
                transition={{ 
                  duration: 8 + Math.random() * 4,
                  repeat: Infinity,
                  ease: "linear"
                }}
              >
                ⚡
              </motion.div>
            ))}
          </div>
          
          <div className="text-center relative z-10">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="mb-4"
            >
              <Zap className="w-16 h-16 text-red-500 mx-auto" />
            </motion.div>
            <h2 className="text-3xl font-bold mb-4 text-red-600">
              ⚡ Sudden Death! ⚡
            </h2>
            <p className="text-xl text-red-500 font-semibold">
              Fastest answer wins!
            </p>
          </div>
        </div>
      );
    }
    if (gameState.gameMode === "victory") {
      return null; // Parent will render VictoryScreen
    }
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            No more questions available.
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 via-white to-orange-50 p-2 sm:p-4 flex flex-col relative overflow-hidden">
      {/* Animated background math symbols */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-2xl sm:text-3xl text-blue-400/10"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: -50,
              rotate: 0
            }}
            animate={{ 
              y: window.innerHeight + 50,
              rotate: 360,
              x: Math.random() * window.innerWidth
            }}
            transition={{ 
              duration: 15 + Math.random() * 10,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {['+', '−', '×', '÷', '=', '√', 'π', '∞'][i]}
          </motion.div>
        ))}
      </div>

      {/* Floating gaming elements */}
      <div className="absolute top-4 left-4 z-10">
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Calculator className="w-8 h-8 text-battle-primary/60" />
        </motion.div>
      </div>

      <div className="absolute top-4 right-4 z-10">
        <motion.div
          animate={{ 
            y: [0, -10, 0],
            rotate: [0, -5, 5, 0]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1
          }}
        >
          <Brain className="w-8 h-8 text-battle-secondary/60" />
        </motion.div>
      </div>

      {/* Attack Animation Overlay */}
      <AttackAnimation
        fromPlayer={attackingPlayer}
        isVisible={showAttack}
        onComplete={() => setShowAttack(false)}
      />
      
      {/* Main game container - more compact layout */}
      <div className="flex-1 flex flex-col justify-center items-center max-w-4xl mx-auto w-full relative z-10">
        {/* Game header with current player indicator */}
        <motion.div 
          className="w-full mb-2 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Target className="w-5 h-5 text-battle-primary" />
            </motion.div>
            <span className="font-semibold text-sm">
              {currentPlayer.name}'s Turn
            </span>
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, -10, 10, 0]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
            >
              <Star className="w-5 h-5 text-yellow-500" />
            </motion.div>
          </div>
        </motion.div>

        {/* Player Cards Row - reduced gap and margin */}
        <div className="flex flex-row gap-1 sm:gap-2 w-full mb-3 sm:mb-4">
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

        {/* Question Card - positioned to fill available space */}
        <div className="flex-1 flex justify-center items-center w-full min-h-0">
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
              cardWidthClass="w-full max-w-2xl"
            />
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
