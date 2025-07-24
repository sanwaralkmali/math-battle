import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";
import { Question } from "@/types/game";
import { Clock } from "lucide-react";
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
      className={`game-card p-4 sm:p-8 max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto ${cardWidthClass} ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
      key={question.id}
    >
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs sm:text-sm text-muted-foreground mb-2">
          <span>
            Question {questionNumber} of {totalQuestions}
          </span>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <motion.span
              className={isLowTime ? "text-battle-danger font-bold" : ""}
              animate={isLowTime ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: isLowTime ? Infinity : 0 }}
            >
              {timeRemaining}s
            </motion.span>
          </div>
        </div>
        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
          <motion.div
            className={`h-2 rounded-full transition-colors duration-300 ${
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
        className="text-lg sm:text-2xl lg:text-3xl xl:text-4xl font-bold mb-4 sm:mb-8 text-center leading-relaxed max-w-full sm:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {question.question}
      </motion.h2>

      {/* Answer Options - vertical stack */}
      <div className="flex flex-col gap-2 sm:gap-4 items-stretch">
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
                className={`w-full max-w-full h-full py-2 sm:py-3 px-3 sm:px-6 text-left justify-start text-base sm:text-lg font-medium transition-all duration-200 group ${
                  selected !== null ? "pointer-events-none opacity-90" : ""
                }`}
                onClick={() => handleAnswer(index)}
                disabled={selected !== null}
              >
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 text-sm font-bold ${
                    btnColor === "battle"
                      ? "bg-battle-primary text-white"
                      : btnColor === "destructive"
                      ? "bg-battle-danger text-white"
                      : "bg-muted"
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </span>
                <span className="break-words whitespace-normal">{option}</span>
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Timer Warning */}
      {isLowTime && selected === null && (
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.p
            className="text-battle-danger font-bold text-lg"
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            ⚠️ Time's running out!
          </motion.p>
        </motion.div>
      )}
    </motion.div>
  );
};
