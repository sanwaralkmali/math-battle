import { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { LeaderboardEntry } from '@/types/game';

interface LeaderboardModalProps {
  children: ReactNode;
}

export const LeaderboardModal = ({ children }: LeaderboardModalProps) => {
  const [leaderboard] = useLocalStorage<LeaderboardEntry[]>('mathbattle-leaderboard', []);

  const sortedLeaderboard = [...leaderboard]
    .sort((a, b) => {
      if (b.winRate !== a.winRate) return b.winRate - a.winRate;
      if (b.wins !== a.wins) return b.wins - a.wins;
      return a.bestTime - b.bestTime;
    })
    .slice(0, 10);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1: return <Medal className="w-5 h-5 text-gray-400" />;
      case 2: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <div className="w-5 h-5 flex items-center justify-center text-sm font-bold text-muted-foreground">{index + 1}</div>;
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Trophy className="w-6 h-6 text-battle-primary" />
            Leaderboard
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {sortedLeaderboard.length === 0 ? (
            <motion.div 
              className="text-center py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg text-muted-foreground">No games played yet!</p>
              <p className="text-sm text-muted-foreground">Start battling to see your stats here.</p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {sortedLeaderboard.map((entry, index) => (
                <motion.div
                  key={`${entry.playerName}-${entry.date}`}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    index < 3 
                      ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' 
                      : 'bg-muted/30 border-border'
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getRankIcon(index)}
                      <div>
                        <h3 className="font-semibold text-lg">{entry.playerName}</h3>
                        <div className="flex gap-2 mt-1">
                          <Badge variant={index < 3 ? 'default' : 'secondary'}>
                            {(entry.winRate * 100).toFixed(0)}% Win Rate
                          </Badge>
                          <Badge variant="outline">
                            {entry.wins}W / {entry.gamesPlayed - entry.wins}L
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Best Time</p>
                      <p className="font-mono font-semibold">{formatTime(entry.bestTime)}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};