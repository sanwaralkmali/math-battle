import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Home, Sword, Shield } from "lucide-react";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 via-white to-orange-50">
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          className="text-center max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="mb-6"
            animate={{
              rotate: [0, -10, 10, -10, 0],
              scale: [1, 1.1, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatDelay: 3,
            }}
          >
            <div className="flex justify-center items-center gap-2 mb-4">
              <Sword className="w-12 h-12 text-battle-primary" />
              <Shield className="w-12 h-12 text-battle-secondary" />
            </div>
          </motion.div>

          <h1 className="text-6xl font-bold bg-gradient-to-r from-battle-primary to-battle-secondary bg-clip-text text-transparent mb-4">
            404
          </h1>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Battle Not Found!
          </h2>

          <p className="text-gray-600 mb-6">
            This math challenge doesn't exist in our arena. The skill you're
            looking for might have been moved or doesn't exist.
          </p>

          <Button
            onClick={() => (window.location.href = "/")}
            className="battle-gradient hover:opacity-90 text-white font-semibold px-6 py-3"
          >
            <Home className="w-5 h-5 mr-2" />
            Return to Battle Arena
          </Button>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;
