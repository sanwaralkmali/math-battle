import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  HelpCircle,
  Trophy,
  Play,
  Users,
  Sparkles,
  Zap,
  Target,
} from "lucide-react";
import { Skill } from "@/types/game";
import { LeaderboardModal } from "./LeaderboardModal";
import { useLocation } from "react-router-dom";

interface GameSetupProps {
  onStartGame: (player1: string, player2: string, skill: Skill) => void;
}

export const GameSetup = ({ onStartGame }: GameSetupProps) => {
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [skills, setSkills] = useState<Record<string, Skill>>({});
  const [loading, setLoading] = useState(true);
  const [skillCategory, setSkillCategory] = useState<string | null>(null);

  const location = useLocation();

  useEffect(() => {
    // Parse query parameter for skill category
    const params = new URLSearchParams(location.search);
    const skillParam = params.get("skill");
    setSkillCategory(skillParam);
  }, [location.search]);

  useEffect(() => {
    const loadSkills = async () => {
      try {
        // Load available skills
        const skillsResponse = await fetch("/data/skills.json");
        const skillCategories = await skillsResponse.json();

        const loadedSkills: Record<string, Skill> = {};

        // Load each skill file
        for (const category of Object.values(skillCategories)) {
          for (const skillName of category as string[]) {
            try {
              const skillResponse = await fetch(
                `/data/questions/${skillName}.json`
              );
              if (!skillResponse.ok) {
                console.warn(
                  `Failed to load skill: ${skillName} - HTTP ${skillResponse.status}`
                );
                continue;
              }
              const skillData = await skillResponse.json();
              loadedSkills[skillName] = skillData;
            } catch (error) {
              console.warn(`Failed to load skill: ${skillName}`, error);
            }
          }
        }

        setSkills(loadedSkills);
      } catch (error) {
        console.error("Failed to load skills:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSkills();
  }, []);

  // Filter skills by category if present and auto-select if only one
  const [filteredSkillKeys, setFilteredSkillKeys] = useState<string[]>([]);
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const skillsResponse = await fetch("/data/skills.json");
        const skillCategories = await skillsResponse.json();

        if (skillCategory && skillCategories[skillCategory]) {
          const categorySkills = skillCategories[skillCategory];
          // Only show skills that are actually loaded
          const availableSkills = categorySkills.filter(
            (skillName: string) => skills[skillName]
          );
          setFilteredSkillKeys(availableSkills);

          // Auto-select if only one skill in category
          if (availableSkills.length === 1) {
            setSelectedSkill(availableSkills[0]);
          }
        } else {
          // Show all available skills if no category
          const allSkillKeys = Object.values(
            skillCategories
          ).flat() as string[];
          const availableSkills = allSkillKeys.filter(
            (skillName: string) => skills[skillName]
          );
          setFilteredSkillKeys(availableSkills);
        }
      } catch (error) {
        console.error("Failed to fetch skill categories:", error);
        setFilteredSkillKeys([]);
      }
    };
    fetchCategories();
  }, [skillCategory, skills]);

  const canStartGame =
    player1Name.trim() &&
    player2Name.trim() &&
    selectedSkill &&
    skills[selectedSkill];

  const handleStartGame = () => {
    if (canStartGame) {
      onStartGame(
        player1Name.trim(),
        player2Name.trim(),
        skills[selectedSkill]
      );
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-battle-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  // Show error if no skills are available
  if (filteredSkillKeys.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4 text-red-600">
            No skills available
          </h2>
          <p className="text-muted-foreground mb-4">
            {skillCategory
              ? `No skills found for category: ${skillCategory}`
              : "Failed to load any skills. Please try refreshing the page."}
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="battle-gradient"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        {/* Header with enhanced game elements */}
        <motion.div
          className="text-center mb-4 sm:mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex justify-center items-center gap-2 mb-2">
            <motion.div
              animate={{
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <Sparkles className="w-6 h-6 text-yellow-500" />
            </motion.div>
            <h1
              className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-battle-primary to-battle-secondary 
                           bg-clip-text text-transparent"
            >
              MathBattle
            </h1>
            <motion.div
              animate={{
                rotate: [0, -360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <Zap className="w-6 h-6 text-orange-500" />
            </motion.div>
          </div>
          <p className="text-sm sm:text-lg text-muted-foreground">
            Challenge your friends in mathematical combat!
          </p>
        </motion.div>

        <Card className="game-card shadow-lg">
          <CardHeader className="text-center pb-4">
            <CardTitle className="flex items-center justify-center gap-2 text-lg sm:text-xl">
              <Users className="w-5 h-5 text-battle-primary" />
              Game Setup
            </CardTitle>
            <CardDescription>
              Enter player names and choose your math challenge
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Player Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-sm font-medium mb-2 text-player-1">
                  Player 1 (Blue)
                </label>
                <Input
                  placeholder="Enter player 1 name"
                  value={player1Name}
                  onChange={(e) => setPlayer1Name(e.target.value)}
                  className="border-player-1/30 focus:border-player-1"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-sm font-medium mb-2 text-player-2">
                  Player 2 (Orange)
                </label>
                <Input
                  placeholder="Enter player 2 name"
                  value={player2Name}
                  onChange={(e) => setPlayer2Name(e.target.value)}
                  className="border-player-2/30 focus:border-player-2"
                />
              </motion.div>
            </div>

            {/* Skill Selection - Only show if multiple skills or no auto-selection */}
            {filteredSkillKeys.length > 1 ||
            (filteredSkillKeys.length === 1 && !selectedSkill) ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <label className="block text-sm font-medium mb-3">
                  {skillCategory && filteredSkillKeys.length > 0
                    ? `Choose Math Challenge (${skillCategory.replace(
                        /-/g,
                        " "
                      )})`
                    : "Choose Math Challenge"}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                  {filteredSkillKeys.map((skillKey) => {
                    const skill = skills[skillKey];
                    if (!skill) return null;
                    return (
                      <motion.div
                        key={skillKey}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Card
                          className={`cursor-pointer transition-all duration-200 ${
                            selectedSkill === skillKey
                              ? "ring-2 ring-battle-primary bg-battle-primary/5"
                              : "hover:shadow-md"
                          }`}
                          onClick={() => setSelectedSkill(skillKey)}
                        >
                          <CardContent className="p-3">
                            <div className="flex items-start gap-2">
                              <Target className="w-4 h-4 text-battle-primary mt-0.5 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold mb-1 text-sm">
                                  {skill.title}
                                </h3>
                                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                  {skill.description}
                                </p>
                                <Badge variant="outline" className="text-xs">
                                  {skill.timePerQuestion}s per question
                                </Badge>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ) : filteredSkillKeys.length === 1 && selectedSkill ? (
              // Show selected skill info when auto-selected
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-battle-primary/5 border border-battle-primary/20 rounded-lg p-3"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-5 h-5 text-battle-primary" />
                  <span className="font-semibold text-sm">
                    Selected Challenge:
                  </span>
                </div>
                <h3 className="font-semibold text-sm mb-1">
                  {skills[selectedSkill]?.title}
                </h3>
                <p className="text-xs text-muted-foreground mb-2">
                  {skills[selectedSkill]?.description}
                </p>
                <Badge variant="outline" className="text-xs">
                  {skills[selectedSkill]?.timePerQuestion}s per question
                </Badge>
              </motion.div>
            ) : null}

            {/* Action Buttons */}
            <motion.div
              className="flex flex-col gap-3 pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                onClick={handleStartGame}
                disabled={!canStartGame}
                className="w-full h-12 text-base font-semibold battle-gradient hover:opacity-90"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Battle!
              </Button>

              <div className="flex gap-2 w-full">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-12 px-4 flex-1"
                    >
                      <HelpCircle className="w-5 h-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="text-xl">
                        How to Play MathBattle
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-battle-primary text-white text-sm flex items-center justify-center font-bold flex-shrink-0">
                          1
                        </div>
                        <p className="text-sm">
                          Each player starts with 3 lives (hearts)
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-battle-primary text-white text-sm flex items-center justify-center font-bold flex-shrink-0">
                          2
                        </div>
                        <p className="text-sm">
                          Players take turns answering math questions
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-battle-primary text-white text-sm flex items-center justify-center font-bold flex-shrink-0">
                          3
                        </div>
                        <p className="text-sm">
                          Correct answer = Attack! Remove 1 life from opponent
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-battle-primary text-white text-sm flex items-center justify-center font-bold flex-shrink-0">
                          4
                        </div>
                        <p className="text-sm">
                          Wrong answer or timeout = Missed attack
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-battle-primary text-white text-sm flex items-center justify-center font-bold flex-shrink-0">
                          5
                        </div>
                        <p className="text-sm">
                          When a player reaches 0 lives, they get one "Last
                          Chance"
                        </p>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-battle-primary text-white text-sm flex items-center justify-center font-bold flex-shrink-0">
                          6
                        </div>
                        <p className="text-sm">
                          After 10 questions, enter Sudden Death mode!
                        </p>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>

                <LeaderboardModal>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-12 px-4 flex-1"
                  >
                    <Trophy className="w-5 h-5" />
                  </Button>
                </LeaderboardModal>
              </div>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
