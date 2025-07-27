import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";
import { Question } from "@/types/game";
import { Clock, Zap, Target, Star, Trophy, Brain } from "lucide-react";
import { useState } from "react";
import React from "react";

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  timeRemaining: number;
  totalTime: number;
  onAnswer: (answer: number) => void;
  className?: string;
  onFeedbackComplete?: (answer: number, correct: boolean) => void;
  showToast?: (msg: string, type: "success" | "error") => void;
  cardWidthClass?: string;
  isSuddenDeath?: boolean;
}

export const QuestionCard = ({
  question,
  questionNumber,
  totalQuestions,
  timeRemaining,
  totalTime,
  onAnswer,
  className = "",
  onFeedbackComplete,
  showToast,
  cardWidthClass = "",
  isSuddenDeath = false,
}: QuestionCardProps) => {
  const isLowTime = timeRemaining <= 5;
  const timePercentage = totalTime > 0 ? (timeRemaining / totalTime) * 100 : 0;

  // Feedback state
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<null | {
    correct: boolean;
    correctIndex: number;
  }>(null);

  // Reset feedback on new question
  React.useEffect(() => {
    setSelected(null);
    setFeedback(null);
  }, [question.id]);

  const handleAnswer = (index: number) => {
    if (selected !== null) return; // Prevent multiple answers
    setSelected(index);
    const isCorrect = index === question.correct;
    setFeedback({ correct: isCorrect, correctIndex: question.correct });
    if (showToast) {
      if (isCorrect) {
        showToast("Correct!", "success");
      } else {
        showToast(
          `Wrong! The correct answer is ${question.options[question.correct]}`,
          "error"
        );
      }
    }
    setTimeout(() => {
      if (onFeedbackComplete) {
        onFeedbackComplete(index, isCorrect);
      } else {
        onAnswer(index);
      }
    }, 1200); // Show feedback for 1.2s before moving on
  };

  return (
    <motion.div
      className={`game-card p-3 sm:p-6 max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto ${cardWidthClass} ${className} relative overflow-hidden mt-3 ${
        isSuddenDeath
          ? "border-2 border-red-400 shadow-lg shadow-red-500/20"
          : ""
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
      key={question.id}
    >
      {/* Sudden Death Indicator */}
      {isSuddenDeath && (
        <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-red-500 to-orange-500 text-white text-center py-2 px-4 transform -translate-y-full">
          <div className="flex items-center justify-center gap-2">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="w-4 h-4" />
            </motion.div>
            <span className="font-bold text-sm">SUDDEN DEATH QUESTION</span>
            <motion.div
              animate={{ rotate: [0, -360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Zap className="w-4 h-4" />
            </motion.div>
          </div>
        </div>
      )}
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-lg text-blue-300/10"
            initial={{
              x: Math.random() * 200 + 50,
              y: 100 + Math.random() * 200,
              rotate: 0,
            }}
            animate={{
              y: 300 + Math.random() * 100,
              rotate: 180,
              x: Math.random() * 200 + 50,
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              ease: "linear",
            }}
          >
            {["+", "−", "×", "÷"][i]}
          </motion.div>
        ))}
      </div>

      {/* Floating gaming icons */}
      <div className="absolute top-8 right-4">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Brain className="w-6 h-6 text-battle-primary/30" />
        </motion.div>
      </div>

      <div className="absolute top-8 left-4">
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, -5, 5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.5,
          }}
        >
          <Target className="w-6 h-6 text-battle-secondary/30" />
        </motion.div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3 sm:mb-4 relative z-10">
        <div className="flex justify-between text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
          <span className="flex items-center gap-1">
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500" />
            </motion.div>
            Question {questionNumber} of {totalQuestions}
          </span>
          <div className="flex items-center gap-1">
            <motion.div
              animate={isLowTime ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.5, repeat: isLowTime ? Infinity : 0 }}
            >
              <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            </motion.div>
            <motion.span
              className={isLowTime ? "text-battle-danger font-bold" : ""}
              animate={isLowTime ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: isLowTime ? Infinity : 0 }}
            >
              {timeRemaining}s
            </motion.span>
          </div>
        </div>
        <div className="w-full bg-muted rounded-full h-1.5 sm:h-2 overflow-hidden">
          <motion.div
            className={`h-1.5 sm:h-2 rounded-full transition-colors duration-300 ${
              isLowTime ? "bg-battle-danger" : "bg-battle-primary"
            }`}
            initial={{ width: "100%" }}
            animate={{ width: `${timePercentage}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>

      {/* Question */}
      <motion.h2
        className="text-base sm:text-xl lg:text-2xl xl:text-3xl font-bold mb-3 sm:mb-6 text-center leading-relaxed max-w-full sm:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {question.question}
      </motion.h2>

      {/* Answer Options - vertical stack */}
      <div className="flex flex-col gap-1.5 sm:gap-3 items-stretch relative z-10">
        {question.options.map((option, index) => {
          let btnColor = "outline";
          if (selected !== null) {
            if (index === selected) {
              btnColor = feedback?.correct
                ? "battle" // correct answer selected
                : "destructive"; // wrong answer selected
            } else if (!feedback?.correct && index === feedback?.correctIndex) {
              btnColor = "battle"; // show correct answer if user was wrong
            }
          }
          return (
            <motion.div
              key={index}
              className="h-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              whileHover={selected === null ? { scale: 1.02 } : {}}
              whileTap={selected === null ? { scale: 0.98 } : {}}
            >
              <Button
                variant={btnColor as ButtonProps["variant"]}
                className={`w-full max-w-full h-full py-2 sm:py-3 px-2 sm:px-4 text-left justify-start text-sm sm:text-base font-medium transition-all duration-200 group relative overflow-hidden ${
                  selected !== null ? "pointer-events-none opacity-90" : ""
                }`}
                onClick={() => handleAnswer(index)}
                disabled={selected !== null}
              >
                {/* Animated background for hover effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "100%" }}
                  transition={{ duration: 0.5 }}
                />

                <span
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center mr-2 sm:mr-4 text-xs sm:text-sm font-bold flex-shrink-0 relative z-10 ${
                    btnColor === "battle"
                      ? "bg-battle-primary text-white"
                      : btnColor === "destructive"
                      ? "bg-battle-danger text-white"
                      : "bg-muted"
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="break-words whitespace-normal relative z-10">
                  {option}
                </span>
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Timer Warning */}
      {isLowTime && selected === null && (
        <motion.div
          className="mt-4 sm:mt-6 text-center relative z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="flex items-center justify-center gap-2 mb-2"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            <Zap className="w-5 h-5 text-battle-danger" />
            <p className="text-battle-danger font-bold text-base sm:text-lg">
              Time's running out!
            </p>
            <Zap className="w-5 h-5 text-battle-danger" />
          </motion.div>
        </motion.div>
      )}

      {/* Success indicator when correct */}
      {selected !== null && feedback?.correct && (
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              rotate: [0, 360],
            }}
            transition={{ duration: 0.6 }}
          >
            <Trophy className="w-16 h-16 text-yellow-500" />
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};
