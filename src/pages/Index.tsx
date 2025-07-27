import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MathBattleGame } from "@/components/MathBattleGame";
import NotFound from "./NotFound";
import Footer from "@/components/Footer";

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isValidSkill, setIsValidSkill] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateSkill = async () => {
      try {
        // Parse query parameter for skill
        const params = new URLSearchParams(location.search);
        const skillParam = params.get("skill");

        if (!skillParam) {
          // No skill parameter provided, show 404
          setIsValidSkill(false);
          setLoading(false);
          return;
        }

        // Load skills data to validate
        const skillsResponse = await fetch("/data/skills.json");
        const skillCategories = await skillsResponse.json();

        // Check if the skill exists in any category
        const skillExists = Object.values(skillCategories).some(
          (category: any) =>
            Array.isArray(category) && category.includes(skillParam)
        );

        setIsValidSkill(skillExists);
        setLoading(false);
      } catch (error) {
        console.error("Error validating skill:", error);
        setIsValidSkill(false);
        setLoading(false);
      }
    };

    validateSkill();
  }, [location.search]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-orange-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-battle-primary border-t-transparent"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isValidSkill) {
    return <NotFound />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="flex-1">
        <MathBattleGame />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
