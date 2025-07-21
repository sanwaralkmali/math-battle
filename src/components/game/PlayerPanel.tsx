import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Player } from '@/types/game';

interface PlayerPanelProps {
  player: Player;
  playerNumber: 1 | 2;
  isLastChance?: boolean;
  className?: string;
}

export const PlayerPanel = ({ 
  player, 
  playerNumber, 
  isLastChance = false,
  className = '' 
}: PlayerPanelProps) => {
  const playerColorClass = playerNumber === 1 ? 'player-1' : 'player-2';
  const borderColor = playerNumber === 1 ? 'border-player-1' : 'border-player-2';
  const bgGradient = playerNumber === 1 
    ? 'bg-gradient-to-br from-blue-50 to-blue-100' 
    : 'bg-gradient-to-br from-orange-50 to-orange-100';

  return (
    <motion.div
      className={`game-card p-3 sm:p-6 ${bgGradient} ${player.isActive ? `${borderColor} border-2` : ''} 
                  ${isLastChance ? 'ring-2 ring-battle-danger ring-opacity-75' : ''} ${className}`}
      animate={{
        scale: player.isActive ? 1.05 : 1,
        boxShadow: player.isActive 
          ? `0 0 20px hsl(var(--${playerColorClass}) / 0.3)` 
          : '0 4px 6px -1px rgb(0 0 0 / 0.1)'
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Player Name */}
      <motion.h3 
        className={`text-base sm:text-xl font-bold mb-2 sm:mb-3 text-${playerColorClass}`}
        animate={{ 
          color: player.isActive ? `hsl(var(--${playerColorClass}))` : 'hsl(var(--foreground))' 
        }}
      >
        {player.name}
        {player.isActive && (
          <motion.span 
            className="ml-2 text-sm"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            ⚡
          </motion.span>
        )}
      </motion.h3>

      {/* Lives */}
      <div className="flex items-center gap-1 sm:gap-2 mb-2 sm:mb-3">
        <span className="text-xs sm:text-sm font-medium text-muted-foreground">Lives:</span>
        <div className="flex gap-1">
          {Array.from({ length: 3 }, (_, index) => (
            <motion.div
              key={index}
              animate={{
                scale: index < player.lives ? 1 : 0.5,
                opacity: index < player.lives ? 1 : 0.3
              }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Heart 
                className={`w-5 h-5 ${
                  index < player.lives 
                    ? `text-battle-danger fill-battle-danger ${isLastChance ? 'heart-animation' : ''}` 
                    : 'text-muted-foreground'
                }`}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Score */}
      <div className="flex items-center gap-1 sm:gap-2">
        <span className="text-xs sm:text-sm font-medium text-muted-foreground">Score:</span>
        <motion.span 
          className={`text-base sm:text-lg font-bold text-${playerColorClass}`}
          key={player.score}
          initial={{ scale: 1.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {player.score}
        </motion.span>
      </div>

      {/* Last Chance Warning */}
      {isLastChance && (
        <motion.div
          className="mt-3 p-2 bg-battle-danger/10 border border-battle-danger/20 rounded-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-xs font-semibold text-battle-danger text-center">
            ⚠️ LAST CHANCE! ⚠️
          </p>
        </motion.div>
      )}
    </motion.div>
  );
};