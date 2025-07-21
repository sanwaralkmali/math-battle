import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Question } from '@/types/game';
import { Clock } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  timeRemaining: number;
  onAnswer: (answer: number) => void;
  className?: string;
}

export const QuestionCard = ({
  question,
  questionNumber,
  totalQuestions,
  timeRemaining,
  onAnswer,
  className = ''
}: QuestionCardProps) => {
  const isLowTime = timeRemaining <= 5;
  const timePercentage = (timeRemaining / 25) * 100; // Assuming 25 seconds default

  return (
    <motion.div
      className={`game-card p-8 max-w-2xl mx-auto ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.5 }}
      key={question.id}
    >
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Question {questionNumber} of {totalQuestions}</span>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <motion.span
              className={isLowTime ? 'text-battle-danger font-bold' : ''}
              animate={isLowTime ? { scale: [1, 1.1, 1] } : {}}
              transition={{ duration: 0.5, repeat: isLowTime ? Infinity : 0 }}
            >
              {timeRemaining}s
            </motion.span>
          </div>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <motion.div 
            className={`h-2 rounded-full transition-colors duration-300 ${
              isLowTime ? 'bg-battle-danger' : 'bg-battle-primary'
            }`}
            initial={{ width: '100%' }}
            animate={{ width: `${timePercentage}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </div>

      {/* Question */}
      <motion.h2 
        className="text-2xl font-bold mb-8 text-center leading-relaxed"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {question.question}
      </motion.h2>

      {/* Answer Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.options.map((option, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              variant="outline"
              className="w-full p-6 h-auto text-left justify-start text-lg font-medium
                         hover:bg-battle-primary hover:text-white hover:border-battle-primary
                         transition-all duration-200 group"
              onClick={() => onAnswer(index)}
            >
              <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center 
                             mr-4 text-sm font-bold group-hover:bg-white group-hover:text-battle-primary">
                {String.fromCharCode(65 + index)}
              </span>
              {option}
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Timer Warning */}
      {isLowTime && (
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