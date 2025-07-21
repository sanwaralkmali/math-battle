import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { HelpCircle, Trophy, Play, Users } from 'lucide-react';
import { Skill } from '@/types/game';
import { LeaderboardModal } from './LeaderboardModal';
import { useLocation } from 'react-router-dom';

interface GameSetupProps {
  onStartGame: (player1: string, player2: string, skill: Skill) => void;
}

export const GameSetup = ({ onStartGame }: GameSetupProps) => {
  const [player1Name, setPlayer1Name] = useState('');
  const [player2Name, setPlayer2Name] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<string>('');
  const [skills, setSkills] = useState<Record<string, Skill>>({});
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string | null>(null);

  const location = useLocation();

  useEffect(() => {
    // Parse query parameter for skill category
    const params = new URLSearchParams(location.search);
    const cat = params.get('skills');
    setCategory(cat);
  }, [location.search]);

  useEffect(() => {
    const loadSkills = async () => {
      try {
        // Load available skills
        const skillsResponse = await fetch('/data/skills.json');
        const skillCategories = await skillsResponse.json();
        
        const loadedSkills: Record<string, Skill> = {};
        
        // Load each skill file
        for (const category of Object.values(skillCategories)) {
          for (const skillName of category as string[]) {
            try {
              const skillResponse = await fetch(`/data/questions/${skillName}.json`);
              const skillData = await skillResponse.json();
              loadedSkills[skillName] = skillData;
            } catch (error) {
              console.warn(`Failed to load skill: ${skillName}`, error);
            }
          }
        }
        
        setSkills(loadedSkills);
      } catch (error) {
        console.error('Failed to load skills:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSkills();
  }, []);

  // Filter skills by category if present
  const [filteredSkillKeys, setFilteredSkillKeys] = useState<string[]>([]);
  useEffect(() => {
    const fetchCategories = async () => {
      const skillsResponse = await fetch('/data/skills.json');
      const skillCategories = await skillsResponse.json();
      if (category && skillCategories[category]) {
        setFilteredSkillKeys(skillCategories[category]);
      } else {
        // Show all skills if no category
        setFilteredSkillKeys(Object.keys(skills));
      }
    };
    fetchCategories();
  }, [category, skills]);

  const canStartGame = player1Name.trim() && player2Name.trim() && selectedSkill && skills[selectedSkill];

  const handleStartGame = () => {
    if (canStartGame) {
      onStartGame(player1Name.trim(), player2Name.trim(), skills[selectedSkill]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-4 border-battle-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-2 sm:p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl"
      >
        {/* Header */}
        <motion.div 
          className="text-center mb-6 sm:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-battle-primary to-battle-secondary 
                         bg-clip-text text-transparent mb-2 sm:mb-4">
            MathBattle
          </h1>
          <p className="text-base sm:text-xl text-muted-foreground">
            Challenge your friends in mathematical combat!
          </p>
        </motion.div>

        <Card className="game-card">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-lg sm:text-2xl">
              <Users className="w-6 h-6 text-battle-primary" />
              Game Setup
            </CardTitle>
            <CardDescription>
              Enter player names and choose your math challenge
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 sm:space-y-6">
            {/* Player Names */}
            <div className="grid md:grid-cols-2 gap-2 sm:gap-4">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-player-1">
                  Player 1 (Blue)
                </label>
                <Input
                  placeholder="Enter player 1 name"
                  value={player1Name}
                  onChange={(e) => setPlayer1Name(e.target.value)}
                  className="border-player-1/30 focus:border-player-1 text-xs sm:text-base py-2 sm:py-3"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="block text-xs sm:text-sm font-medium mb-1 sm:mb-2 text-player-2">
                  Player 2 (Orange)
                </label>
                <Input
                  placeholder="Enter player 2 name"
                  value={player2Name}
                  onChange={(e) => setPlayer2Name(e.target.value)}
                  className="border-player-2/30 focus:border-player-2 text-xs sm:text-base py-2 sm:py-3"
                />
              </motion.div>
            </div>

            {/* Skill Selection */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <label className="block text-xs sm:text-sm font-medium mb-2 sm:mb-3">
                {category && filteredSkillKeys.length > 0
                  ? `Choose Math Challenge (${category.replace(/-/g, ' ')})`
                  : 'Choose Math Challenge'}
              </label>
              <div className="grid md:grid-cols-2 gap-2 sm:gap-3">
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
                            ? 'ring-2 ring-battle-primary bg-battle-primary/5'
                            : 'hover:shadow-md'
                        }`}
                        onClick={() => setSelectedSkill(skillKey)}
                      >
                        <CardContent className="p-2 sm:p-4">
                          <h3 className="font-semibold mb-1 text-sm sm:text-base">{skill.title}</h3>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-1 sm:mb-2">
                            {skill.description}
                          </p>
                          <div className="flex gap-1 sm:gap-2">
                            <Badge variant="outline" className="text-xs sm:text-sm">
                              {skill.timePerQuestion}s per question
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-2 sm:gap-4 pt-2 sm:pt-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                onClick={handleStartGame}
                disabled={!canStartGame}
                className="flex-1 h-10 sm:h-12 text-base sm:text-lg font-semibold battle-gradient hover:opacity-90"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Battle!
              </Button>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="h-10 sm:h-12 px-4 sm:px-6">
                    <HelpCircle className="w-5 h-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle className="text-lg sm:text-2xl">How to Play MathBattle</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-battle-primary text-white text-sm flex items-center justify-center font-bold flex-shrink-0">1</div>
                      <p className="text-sm sm:text-base">Each player starts with 3 lives (hearts)</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-battle-primary text-white text-sm flex items-center justify-center font-bold flex-shrink-0">2</div>
                      <p className="text-sm sm:text-base">Players take turns answering math questions</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-battle-primary text-white text-sm flex items-center justify-center font-bold flex-shrink-0">3</div>
                      <p className="text-sm sm:text-base">Correct answer = Attack! Remove 1 life from opponent</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-battle-primary text-white text-sm flex items-center justify-center font-bold flex-shrink-0">4</div>
                      <p className="text-sm sm:text-base">Wrong answer or timeout = Missed attack</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-battle-primary text-white text-sm flex items-center justify-center font-bold flex-shrink-0">5</div>
                      <p className="text-sm sm:text-base">When a player reaches 0 lives, they get one "Last Chance"</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-battle-primary text-white text-sm flex items-center justify-center font-bold flex-shrink-0">6</div>
                      <p className="text-sm sm:text-base">After 10 questions, enter Sudden Death mode!</p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <LeaderboardModal>
                <Button variant="outline" size="sm" className="h-10 sm:h-12 px-4 sm:px-6">
                  <Trophy className="w-5 h-5" />
                </Button>
              </LeaderboardModal>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};