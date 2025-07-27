import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, RotateCcw, Home, Star } from "lucide-react";
import { GameState, LeaderboardEntry } from "@/types/game";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface VictoryScreenProps {
  gameState: GameState;
  onRematch: () => void;
  onReturnHome: () => void;
  gameDuration: number;
}

export const VictoryScreen = ({
  gameState,
  onRematch,
  onReturnHome,
  gameDuration,
}: VictoryScreenProps) => {
  const [leaderboard, setLeaderboard] = useLocalStorage<LeaderboardEntry[]>(
    "mathbattle-leaderboard",
    []
  );

  const winner = gameState.winner!;
  const loser = gameState.players.find((p) => p !== winner)!;

  // Update leaderboard
  useEffect(() => {
    const updateLeaderboard = () => {
      const now = new Date().toISOString();

      // Update winner stats
      const winnerIndex = leaderboard.findIndex(
        (entry) => entry.playerName === winner.name
      );
      if (winnerIndex >= 0) {
        const existing = leaderboard[winnerIndex];
        leaderboard[winnerIndex] = {
          ...existing,
          wins: existing.wins + 1,
          gamesPlayed: existing.gamesPlayed + 1,
          winRate: (existing.wins + 1) / (existing.gamesPlayed + 1),
          bestTime: Math.min(existing.bestTime, gameDuration),
          date: now,
        };
      } else {
        leaderboard.push({
          playerName: winner.name,
          wins: 1,
          gamesPlayed: 1,
          winRate: 1,
          bestTime: gameDuration,
          date: now,
        });
      }

      // Update loser stats
      const loserIndex = leaderboard.findIndex(
        (entry) => entry.playerName === loser.name
      );
      if (loserIndex >= 0) {
        const existing = leaderboard[loserIndex];
        leaderboard[loserIndex] = {
          ...existing,
          gamesPlayed: existing.gamesPlayed + 1,
          winRate: existing.wins / (existing.gamesPlayed + 1),
          date: now,
        };
      } else {
        leaderboard.push({
          playerName: loser.name,
          wins: 0,
          gamesPlayed: 1,
          winRate: 0,
          bestTime: Infinity,
          date: now,
        });
      }

      setLeaderboard([...leaderboard]);
    };

    updateLeaderboard();
  }, [winner.name, loser.name, gameDuration, leaderboard, setLeaderboard]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getPerformanceRating = (score: number, total: number) => {
    const percentage = (score / total) * 100;
    if (percentage >= 80)
      return { rating: "Excellent!", color: "text-battle-success", stars: 3 };
    if (percentage >= 60)
      return { rating: "Good!", color: "text-battle-warning", stars: 2 };
    return {
      rating: "Keep Practicing!",
      color: "text-muted-foreground",
      stars: 1,
    };
  };

  const winnerRating = getPerformanceRating(
    winner.score,
    gameState.questions.length
  );
  const loserRating = getPerformanceRating(
    loser.score,
    gameState.questions.length
  );
  const isSuddenDeath =
    gameState.gameMode === "sudden-death" ||
    (winner.answerTime !== undefined && loser.answerTime !== undefined);

  return (
    <div className="h-full bg-gradient-to-br from-yellow-50 via-white to-orange-50 flex items-center justify-center p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {/* Victory Header */}
        <motion.div
          className="text-center mb-4 sm:mb-6"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <motion.div
            animate={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Trophy className="w-16 h-16 sm:w-24 sm:h-24 text-yellow-500 mx-auto mb-2 sm:mb-4" />
          </motion.div>

          <h1 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">
            <span className="victory-gradient bg-clip-text text-transparent">
              Victory!
            </span>
          </h1>

          <motion.p
            className="text-lg sm:text-2xl font-semibold"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <span
              className={
                winner === gameState.players[0]
                  ? "text-player-1"
                  : "text-player-2"
              }
            >
              {winner.name}
            </span>{" "}
            wins the battle!
          </motion.p>
        </motion.div>

        {/* Game Stats */}
        <Card className="game-card mb-4 sm:mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-center text-lg sm:text-xl">
              Battle Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6">
              {/* Winner Stats */}
              <motion.div
                className="text-center p-3 sm:p-4 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border-2 border-yellow-200"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-500 mx-auto mb-2" />
                <h3 className="font-bold text-sm sm:text-lg mb-1 sm:mb-2">
                  {winner.name}
                </h3>
                <div className="space-y-1 sm:space-y-2">
                  <Badge className="bg-yellow-500 text-white text-xs sm:text-sm">
                    Winner - {winner.score} points
                  </Badge>
                  <p
                    className={`font-semibold text-xs sm:text-sm ${winnerRating.color}`}
                  >
                    {winnerRating.rating}
                  </p>
                  <div className="flex justify-center gap-1">
                    {Array.from({ length: 3 }, (_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 sm:w-4 sm:h-4 ${
                          i < winnerRating.stars
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  {isSuddenDeath && winner.answerTime && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      SD Time:{" "}
                      <span className="font-bold text-battle-success">
                        {winner.answerTime.toFixed(2)}s
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Loser Stats */}
              <motion.div
                className="text-center p-3 sm:p-4 bg-muted/30 rounded-lg border"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-muted rounded-full mx-auto mb-2 flex items-center justify-center text-xs sm:text-sm font-bold">
                  2
                </div>
                <h3 className="font-bold text-sm sm:text-lg mb-1 sm:mb-2">
                  {loser.name}
                </h3>
                <div className="space-y-1 sm:space-y-2">
                  <Badge variant="secondary" className="text-xs sm:text-sm">
                    {loser.score} points
                  </Badge>
                  <p
                    className={`font-semibold text-xs sm:text-sm ${loserRating.color}`}
                  >
                    {loserRating.rating}
                  </p>
                  <div className="flex justify-center gap-1">
                    {Array.from({ length: 3 }, (_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 sm:w-4 sm:h-4 ${
                          i < loserRating.stars
                            ? "text-yellow-500 fill-yellow-500"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  {isSuddenDeath && loser.answerTime && (
                    <div className="mt-1 text-xs text-muted-foreground">
                      SD Time:{" "}
                      <span className="font-bold">
                        {loser.answerTime.toFixed(2)}s
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Game Details */}
            <motion.div
              className="mt-4 p-3 sm:p-4 bg-muted/20 rounded-lg"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-mono font-semibold text-sm sm:text-base">
                    {formatTime(gameDuration)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Questions</p>
                  <p className="font-semibold text-sm sm:text-base">
                    {gameState.currentQuestionIndex + 1}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Subject</p>
                  <p className="font-semibold text-sm sm:text-base truncate">
                    {gameState.skill?.title}
                  </p>
                </div>
              </div>
            </motion.div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-2 sm:gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            onClick={onRematch}
            className="flex-1 h-10 sm:h-12 text-sm sm:text-base font-semibold battle-gradient hover:opacity-90"
          >
            <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            Rematch
          </Button>
          <Button
            onClick={onReturnHome}
            variant="outline"
            className="flex-1 h-10 sm:h-12 px-4 text-sm sm:text-base"
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            New Game
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};
