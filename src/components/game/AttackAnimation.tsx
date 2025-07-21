import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface AttackAnimationProps {
  fromPlayer: 1 | 2;
  isVisible: boolean;
  onComplete?: () => void;
}

export const AttackAnimation = ({ fromPlayer, isVisible, onComplete }: AttackAnimationProps) => {
  const [showExplosion, setShowExplosion] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setShowExplosion(true);
        setTimeout(() => {
          setShowExplosion(false);
          onComplete?.();
        }, 500);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, onComplete]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {/* Attack Projectile */}
      <motion.div
        className="absolute w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-red-500 
                   shadow-lg shadow-orange-500/50"
        style={{
          left: fromPlayer === 1 ? '20%' : '80%',
          top: '50%'
        }}
        initial={{ 
          scale: 0,
          x: 0,
          y: 0
        }}
        animate={{ 
          scale: [0, 1.2, 1],
          x: fromPlayer === 1 ? '200px' : '-200px',
          y: [0, -30, 0]
        }}
        transition={{ 
          duration: 0.8,
          ease: 'easeOut'
        }}
      >
        {/* Fire Trail */}
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{
            boxShadow: [
              '0 0 10px #f97316',
              '0 0 20px #f97316, 0 0 30px #dc2626',
              '0 0 10px #f97316'
            ]
          }}
          transition={{ 
            duration: 0.3,
            repeat: Infinity,
            repeatType: 'reverse'
          }}
        />
        
        {/* Fire Emoji */}
        <div className="absolute inset-0 flex items-center justify-center text-xl">
          🔥
        </div>
      </motion.div>

      {/* Impact Explosion */}
      {showExplosion && (
        <motion.div
          className="absolute"
          style={{
            left: fromPlayer === 1 ? '60%' : '40%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: [0, 2, 1.5], opacity: [1, 1, 0] }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-6xl">💥</div>
          
          {/* Shockwave */}
          <motion.div
            className="absolute inset-0 rounded-full border-4 border-orange-400"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 3, opacity: 0 }}
            transition={{ duration: 0.4 }}
          />
        </motion.div>
      )}

      {/* Screen Flash */}
      <motion.div
        className="absolute inset-0 bg-orange-200"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: showExplosion ? [0, 0.3, 0] : 0 
        }}
        transition={{ duration: 0.2 }}
      />
    </div>
  );
};