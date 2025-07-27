import { motion } from "framer-motion";
import { Heart, Zap, Crown, Shield, Sword, Trophy } from "lucide-react";
import { Player } from "@/types/game";

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
  className = "",
}: PlayerPanelProps) => {
  const playerColorClass = playerNumber === 1 ? "player-1" : "player-2";
  const borderColor =
    playerNumber === 1 ? "border-player-1" : "border-player-2";
  const bgGradient =
    playerNumber === 1
      ? "bg-gradient-to-br from-blue-50 to-blue-100"
      : "bg-gradient-to-br from-orange-50 to-orange-100";

  return (
    <motion.div
      className={`game-card p-2 sm:p-4 ${bgGradient} ${
        player.isActive
          ? `${borderColor} border-2 sm:border-4 ring-2 ring-${playerColorClass} ring-opacity-60 shadow-lg shadow-${playerColorClass}/30 animate-pulse`
          : ""
      } 
                  ${
                    isLastChance
                      ? "ring-2 ring-battle-danger ring-opacity-75"
                      : ""
                  } ${className} relative overflow-hidden`}
      animate={{
        scale: player.isActive ? 1.02 : 1,
        boxShadow: player.isActive
          ? `0 0 20px hsl(var(--${playerColorClass}) / 0.3)`
          : "0 4px 6px -1px rgb(0 0 0 / 0.1)",
      }}
      transition={{ duration: 0.3 }}
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute text-sm text-blue-300/20"
            initial={{ 
              x: Math.random() * 200,
              y: -20,
              rotate: 0
            }}
            animate={{ 
              y: 150,
              rotate: 180,
              x: Math.random() * 200
            }}
            transition={{ 
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              ease: "linear"
            }}
          >
            {['⚔️', '🛡️', '⚡'][i]}
          </motion.div>
        ))}
      </div>

      {/* Player Name */}
      <motion.h3
        className={`text-sm sm:text-lg font-bold mb-1 sm:mb-2 text-${playerColorClass} relative z-10 flex items-center gap-2`}
        animate={{
          color: player.isActive
            ? `hsl(var(--${playerColorClass}))`
            : "hsl(var(--foreground))",
        }}
      >
        {player.isActive && (
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
            <Crown className="w-4 h-4 text-yellow-500" />
          </motion.div>
        )}
        {player.name}
        {player.isActive && (
          <motion.span
            className="ml-1 text-sm"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            ⚡
          </motion.span>
        )}
      </motion.h3>

      {/* Lives */}
      <div className="flex items-center gap-1 mb-1 sm:mb-2 relative z-10">
        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          <motion.div
            animate={isLastChance ? { scale: [1, 1.2, 1] } : {}}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Heart className="w-3 h-3 text-battle-danger" />
          </motion.div>
          Lives:
        </span>
        <div className="flex gap-0.5 sm:gap-1">
          {Array.from({ length: 3 }, (_, index) => (
            <motion.div
              key={index}
              animate={{
                scale: index < player.lives ? 1 : 0.5,
                opacity: index < player.lives ? 1 : 0.3,
              }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Heart
                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                  index < player.lives
                    ? `text-battle-danger fill-battle-danger ${
                        isLastChance ? "heart-animation" : ""
                      }`
                    : "text-muted-foreground"
                }`}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Score */}
      <div className="flex items-center gap-1 relative z-10">
        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          >
            <Trophy className="w-3 h-3 text-yellow-500" />
          </motion.div>
          Score:
        </span>
        <motion.span
          className={`text-sm sm:text-base font-bold text-${playerColorClass}`}
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
          className="mt-2 p-1 sm:p-2 bg-battle-danger/10 border border-battle-danger/20 rounded-lg relative z-10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-center justify-center gap-1">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Zap className="w-3 h-3 text-battle-danger" />
            </motion.div>
            <p className="text-xs font-semibold text-battle-danger text-center">
              ⚠️ LAST CHANCE! ⚠️
            </p>
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, -10, 10, 0]
              }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Shield className="w-3 h-3 text-battle-danger" />
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Active player indicator */}
      {player.isActive && (
        <motion.div
          className="absolute top-1 right-1"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 360]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Sword className="w-4 h-4 text-battle-primary" />
        </motion.div>
      )}
    </motion.div>
  );
};
