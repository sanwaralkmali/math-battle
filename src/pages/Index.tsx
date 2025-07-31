import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { MathBattleGame } from "@/components/MathBattleGame";
import NotFound from "./NotFound";
import Footer from "@/components/Footer";

// Pre-define valid skills to avoid network requests
const VALID_SKILLS = [
  "integers",
  "fractions",
  "decimals",
  "order-of-operations",
  "mixed-problems",
  "algebra-basics",
  "fraction-decimal",
  "fraction-percentage",
  "decimal-percentage",
  "mixed-conversion",
  "classification-numbers",
  "basic-scientific-notation",
  "operations-scientific-notation",
  "simplify-expressions",
  "solving-equations",
  "solving-inequalities",
  "gcf-factoring",
  "factoring-by-grouping",
  "factoring-trinomials-1",
  "factoring-trinomials-2",
  "perfect-squares",
  "difference-squares",
  "difference-sum-of-cubes",
  "solving-equations-by-factoring",
  "quadratic-formula",
  "understanding-polynomials",
  "adding-subtracting-polynomials",
  "multiplying-polynomials",
];

const Index = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isValidSkill, setIsValidSkill] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateSkill = () => {
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

        // Check if the skill exists in our pre-defined list
        const skillExists = VALID_SKILLS.includes(skillParam);

        setIsValidSkill(skillExists);
        setLoading(false);
      } catch (error) {
        console.error("Error validating skill:", error);
        setIsValidSkill(false);
        setLoading(false);
      }
    };

    // Use setTimeout to ensure this runs after the component mounts
    // This prevents blocking the initial render
    const timer = setTimeout(validateSkill, 0);

    return () => clearTimeout(timer);
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
