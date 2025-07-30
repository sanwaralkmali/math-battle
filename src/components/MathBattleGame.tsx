import { useState, useEffect } from "react";
import { useGameState } from "@/hooks/useGameState";
import { GameSetup } from "./game/GameSetup";
import { BattleScreen } from "./game/BattleScreen";
import { VictoryScreen } from "./game/VictoryScreen";
import { Skill } from "@/types/game";

export const MathBattleGame = () => {
  const {
    gameState,
    initializeGame,
    handleAnswer,
    resetGame,
    decrementTimer,
    triggerMissedAttack,
  } = useGameState();
  const [gameStartTime, setGameStartTime] = useState<number>(0);
  const [gameDuration, setGameDuration] = useState<number>(0);

  // Track game duration - start when the game actually begins (questions are loaded)
  useEffect(() => {
    // Start tracking when we have questions loaded and the game is active
    if (
      (gameState.gameMode === "battle" ||
        gameState.gameMode === "sudden-death") &&
      gameState.questions.length > 0 &&
      gameStartTime === 0
    ) {
      setGameStartTime(Date.now());
    }
  }, [gameState.gameMode, gameState.questions.length, gameStartTime]);

  // Calculate duration when game ends
  useEffect(() => {
    if (gameState.gameMode === "victory" && gameStartTime > 0) {
      setGameDuration(Math.floor((Date.now() - gameStartTime) / 1000));
    }
  }, [gameState.gameMode, gameStartTime]);

  const handleStartGame = (
    player1Name: string,
    player2Name: string,
    skill: Skill
  ) => {
    initializeGame(player1Name, player2Name, skill);
    setGameStartTime(0);
    setGameDuration(0);
  };

  const handleRematch = () => {
    if (gameState.skill) {
      const player1 = gameState.players[0];
      const player2 = gameState.players[1];
      initializeGame(player1.name, player2.name, gameState.skill);
      setGameStartTime(0);
      setGameDuration(0);
    }
  };

  const handleReturnHome = () => {
    resetGame();
    setGameStartTime(0);
    setGameDuration(0);
  };

  switch (gameState.gameMode) {
    case "setup":
      return <GameSetup onStartGame={handleStartGame} />;

    case "battle":
    case "sudden-death":
      return (
        <BattleScreen
          gameState={gameState}
          onAnswer={handleAnswer}
          decrementTimer={decrementTimer}
          triggerMissedAttack={triggerMissedAttack}
        />
      );

    case "victory":
      return (
        <VictoryScreen
          gameState={gameState}
          onRematch={handleRematch}
          onReturnHome={handleReturnHome}
          gameDuration={gameDuration}
        />
      );

    default:
      return <GameSetup onStartGame={handleStartGame} />;
  }
};
