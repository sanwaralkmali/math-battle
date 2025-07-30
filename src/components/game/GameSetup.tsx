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

// Pre-define skill categories to avoid network requests
const SKILL_CATEGORIES = {
  integers: ["integers"],
  fractions: ["fractions"],
  decimals: ["decimals"],
  "order-of-operations": ["order-of-operations"],
  "mixed-problems": ["mixed-problems"],
  "algebra-basics": ["algebra-basics"],
  "fraction-decimal": ["fraction-decimal"],
  "fraction-percentage": ["fraction-percentage"],
  "decimal-percentage": ["decimal-percentage"],
  "mixed-conversion": ["mixed-conversion"],
  "classification-numbers": ["classification-numbers"],
  "basic-scientific-notation": ["basic-scientific-notation"],
  "operations-scientific-notation": ["operations-scientific-notation"],
  "simplify-expressions": ["simplify-expressions"],
  "solving-equations": ["solving-equations"],
  "solving-inequalities": ["solving-inequalities"],
  "gcf-factoring": ["gcf-factoring"],
  "factoring-by-grouping": ["factoring-by-grouping"],
  "factoring-trinomials-1": ["factoring-trinomials-1"],
  "factoring-trinomials-2": ["factoring-trinomials-2"],
  "perfect-squares": ["perfect-squares"],
  "difference-squares": ["difference-squares"],
  "difference-sum-of-cubes": ["difference-sum-of-cubes"],
  "solving-equations-by-factoring": ["solving-equations-by-factoring"],
  "quadratic-formula": ["quadratic-formula"],
  "understanding-polynomials": ["understanding-polynomials"],
  "adding-subtracting-polynomials": ["adding-subtracting-polynomials"],
  "multiplying-polynomials": ["multiplying-polynomials"],
  temp: ["temp"],
};

export const GameSetup = ({ onStartGame }: GameSetupProps) => {
  const [player1Name, setPlayer1Name] = useState("");
  const [player2Name, setPlayer2Name] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<string>("");
  const [skills, setSkills] = useState<Record<string, Skill>>({});
  const [loading, setLoading] = useState(false);
  const [skillCategory, setSkillCategory] = useState<string | null>(null);

  const location = useLocation();

  useEffect(() => {
    // Parse query parameter for skill category
    const params = new URLSearchParams(location.search);
    const skillParam = params.get("skill");
    setSkillCategory(skillParam);
  }, [location.search]);

  // Filter skills by category if present and auto-select if only one
  const [filteredSkillKeys, setFilteredSkillKeys] = useState<string[]>([]);
  useEffect(() => {
    const getFilteredSkills = () => {
      if (skillCategory) {
        // Filter to only show the selected skill
        const categorySkills =
          SKILL_CATEGORIES[skillCategory as keyof typeof SKILL_CATEGORIES] ||
          [];
        setFilteredSkillKeys(categorySkills);

        // Auto-select if only one skill in category
        if (categorySkills.length === 1) {
          setSelectedSkill(categorySkills[0]);
        }
      } else {
        // Show all available skills
        const allSkills = Object.values(SKILL_CATEGORIES).flat();
        setFilteredSkillKeys(allSkills);
      }
    };

    getFilteredSkills();
  }, [skillCategory]);

  // Load skill data only when a skill is selected
  useEffect(() => {
    if (!selectedSkill || skills[selectedSkill]) {
      return; // Already loaded or no skill selected
    }

    const loadSkill = async () => {
      setLoading(true);
      try {
        const skillResponse = await fetch(
          `/data/questions/${selectedSkill}.json`
        );
        if (!skillResponse.ok) {
          console.warn(
            `Failed to load skill: ${selectedSkill} - HTTP ${skillResponse.status}`
          );
          return;
        }
        const skillData = await skillResponse.json();
        setSkills((prev) => ({ ...prev, [selectedSkill]: skillData }));
      } catch (error) {
        console.warn(`Failed to load skill: ${selectedSkill}`, error);
      } finally {
        setLoading(false);
      }
    };

    loadSkill();
  }, [selectedSkill, skills]);

  const handleStartGame = () => {
    if (!selectedSkill || !skills[selectedSkill]) {
      return;
    }

    if (!player1Name.trim() || !player2Name.trim()) {
      return;
    }

    onStartGame(player1Name.trim(), player2Name.trim(), skills[selectedSkill]);
  };

  const getSkillIcon = (skillName: string) => {
    const icons: Record<string, React.ReactNode> = {
      integers: <Target className="w-4 h-4" />,
      fractions: <HelpCircle className="w-4 h-4" />,
      decimals: <Zap className="w-4 h-4" />,
      "order-of-operations": <Sparkles className="w-4 h-4" />,
      "mixed-problems": <Trophy className="w-4 h-4" />,
      "algebra-basics": <Users className="w-4 h-4" />,
      "fraction-decimal": <HelpCircle className="w-4 h-4" />,
      "fraction-percentage": <HelpCircle className="w-4 h-4" />,
      "decimal-percentage": <Zap className="w-4 h-4" />,
      "mixed-conversion": <Trophy className="w-4 h-4" />,
      "classification-numbers": <Target className="w-4 h-4" />,
      "basic-scientific-notation": <Zap className="w-4 h-4" />,
      "operations-scientific-notation": <Zap className="w-4 h-4" />,
      "simplify-expressions": <Sparkles className="w-4 h-4" />,
      "solving-equations": <Target className="w-4 h-4" />,
      "solving-inequalities": <Target className="w-4 h-4" />,
      "gcf-factoring": <Sparkles className="w-4 h-4" />,
      "factoring-by-grouping": <Sparkles className="w-4 h-4" />,
      "factoring-trinomials-1": <Sparkles className="w-4 h-4" />,
      "factoring-trinomials-2": <Sparkles className="w-4 h-4" />,
      "perfect-squares": <Sparkles className="w-4 h-4" />,
      "difference-squares": <Sparkles className="w-4 h-4" />,
      "difference-sum-of-cubes": <Sparkles className="w-4 h-4" />,
      "solving-equations-by-factoring": <Target className="w-4 h-4" />,
      "quadratic-formula": <Target className="w-4 h-4" />,
      "understanding-polynomials": <Users className="w-4 h-4" />,
      "adding-subtracting-polynomials": <Sparkles className="w-4 h-4" />,
      "multiplying-polynomials": <Sparkles className="w-4 h-4" />,
      temp: <Trophy className="w-4 h-4" />,
    };
    return icons[skillName] || <Target className="w-4 h-4" />;
  };

  const getSkillColor = (skillName: string) => {
    const colors: Record<string, string> = {
      integers: "bg-blue-100 text-blue-800 border-blue-200",
      fractions: "bg-green-100 text-green-800 border-green-200",
      decimals: "bg-purple-100 text-purple-800 border-purple-200",
      "order-of-operations": "bg-orange-100 text-orange-800 border-orange-200",
      "mixed-problems": "bg-red-100 text-red-800 border-red-200",
      "algebra-basics": "bg-indigo-100 text-indigo-800 border-indigo-200",
      "fraction-decimal": "bg-teal-100 text-teal-800 border-teal-200",
      "fraction-percentage":
        "bg-emerald-100 text-emerald-800 border-emerald-200",
      "decimal-percentage": "bg-cyan-100 text-cyan-800 border-cyan-200",
      "mixed-conversion": "bg-pink-100 text-pink-800 border-pink-200",
      "classification-numbers": "bg-blue-100 text-blue-800 border-blue-200",
      "basic-scientific-notation":
        "bg-yellow-100 text-yellow-800 border-yellow-200",
      "operations-scientific-notation":
        "bg-yellow-100 text-yellow-800 border-yellow-200",
      "simplify-expressions": "bg-green-100 text-green-800 border-green-200",
      "solving-equations": "bg-red-100 text-red-800 border-red-200",
      "solving-inequalities": "bg-red-100 text-red-800 border-red-200",
      "gcf-factoring": "bg-purple-100 text-purple-800 border-purple-200",
      "factoring-by-grouping":
        "bg-purple-100 text-purple-800 border-purple-200",
      "factoring-trinomials-1":
        "bg-purple-100 text-purple-800 border-purple-200",
      "factoring-trinomials-2":
        "bg-purple-100 text-purple-800 border-purple-200",
      "perfect-squares": "bg-purple-100 text-purple-800 border-purple-200",
      "difference-squares": "bg-purple-100 text-purple-800 border-purple-200",
      "difference-sum-of-cubes":
        "bg-purple-100 text-purple-800 border-purple-200",
      "solving-equations-by-factoring":
        "bg-red-100 text-red-800 border-red-200",
      "quadratic-formula": "bg-red-100 text-red-800 border-red-200",
      "understanding-polynomials":
        "bg-indigo-100 text-indigo-800 border-indigo-200",
      "adding-subtracting-polynomials":
        "bg-indigo-100 text-indigo-800 border-indigo-200",
      "multiplying-polynomials":
        "bg-indigo-100 text-indigo-800 border-indigo-200",
      temp: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return colors[skillName] || "bg-gray-100 text-gray-800 border-gray-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="game-card">
          <CardHeader className="text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h1 className="text-3xl sm:text-4xl font-bold mb-2">
                <span className="battle-gradient bg-clip-text text-transparent">
                  MathBattle
                </span>
              </h1>
              <p className="text-muted-foreground text-sm sm:text-base">
                Choose your battle arena and prepare for mathematical combat!
              </p>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Player Names */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-player-1">
                    Player 1 Name
                  </label>
                  <Input
                    placeholder="Enter Player 1 name"
                    value={player1Name}
                    onChange={(e) => setPlayer1Name(e.target.value)}
                    className="border-player-1 focus:border-player-1"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-player-2">
                    Player 2 Name
                  </label>
                  <Input
                    placeholder="Enter Player 2 name"
                    value={player2Name}
                    onChange={(e) => setPlayer2Name(e.target.value)}
                    className="border-player-2 focus:border-player-2"
                  />
                </div>
              </div>
            </motion.div>

            {/* Skill Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-semibold">
                  Select Battle Arena
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {filteredSkillKeys.map((skillName) => (
                    <motion.div
                      key={skillName}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <button
                        onClick={() => setSelectedSkill(skillName)}
                        className={`w-full p-3 rounded-lg border-2 transition-all duration-200 text-left ${
                          selectedSkill === skillName
                            ? "border-battle-primary bg-battle-primary/10"
                            : "border-border hover:border-battle-primary/50"
                        } ${getSkillColor(skillName)}`}
                      >
                        <div className="flex items-center gap-2">
                          {getSkillIcon(skillName)}
                          <span className="font-semibold text-sm">
                            {skillName
                              .split("-")
                              .map(
                                (word) =>
                                  word.charAt(0).toUpperCase() + word.slice(1)
                              )
                              .join(" ")}
                          </span>
                        </div>
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Start Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <Button
                onClick={handleStartGame}
                disabled={
                  !player1Name.trim() ||
                  !player2Name.trim() ||
                  !selectedSkill ||
                  loading
                }
                className="flex-1 h-12 text-lg font-semibold battle-gradient hover:opacity-90"
              >
                <Play className="w-5 h-5 mr-2" />
                {loading ? "Loading..." : "Start Battle!"}
              </Button>

              <LeaderboardModal>
                <Button variant="outline" className="h-12">
                  <Trophy className="w-5 h-5 mr-2" />
                  Leaderboard
                </Button>
              </LeaderboardModal>
            </motion.div>

            {/* Game Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center"
            >
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                  >
                    <HelpCircle className="w-4 h-4 mr-1" />
                    How to Play
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>How to Play MathBattle</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 text-sm">
                    <div>
                      <h3 className="font-semibold mb-2">🎯 Objective</h3>
                      <p>
                        Answer math questions correctly to attack your opponent
                        and reduce their lives!
                      </p>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">⚔️ Battle System</h3>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Each player starts with 3 lives</li>
                        <li>Correct answers let you attack your opponent</li>
                        <li>Wrong answers or timeouts cost you a life</li>
                        <li>First player to lose all lives loses!</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">🔥 Sudden Death</h3>
                      <p>
                        If the game ends in a tie, players face off in sudden
                        death mode with the fastest correct answer winning!
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
