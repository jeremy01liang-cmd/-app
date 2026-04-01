import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useGame } from "../context/GameContext";

interface Bug {
  id: number;
  startX: number;
  endX: number;
  yPosition: number; // Percentage from bottom
  duration: number; // Seconds to cross
  direction: "left" | "right";
}

export const CrawlingBugs: React.FC = () => {
  const { catchCrawlingWorm, catchWormLeft } = useGame();
  const [bugs, setBugs] = useState<Bug[]>([]);

  useEffect(() => {
    // Spawn a bug every 5-10 seconds
    const interval = setInterval(() => {
      setBugs((prev) => {
        // Keep a maximum of 3 bugs on screen at once
        if (prev.length >= 3) return prev;

        const id = Date.now();
        const direction = Math.random() > 0.5 ? "right" : "left";
        const startX = direction === "right" ? -10 : 110; // Start outside the screen
        const endX = direction === "right" ? 110 : -10; // End outside the screen
        const yPosition = Math.random() * 12 + 26; // Lift bugs above the bottom action buttons
        const duration = Math.random() * 15 + 10; // 10 to 25 seconds to cross

        const newBug: Bug = {
          id,
          startX,
          endX,
          yPosition,
          duration,
          direction,
        };

        // Auto remove bug after it finishes crossing
        setTimeout(() => {
          setBugs((current) => current.filter((b) => b.id !== id));
        }, duration * 1000);

        return [...prev, newBug];
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const handleCatch = (id: number) => {
    if (catchWormLeft <= 0) {
      catchCrawlingWorm();
      return;
    }

    catchCrawlingWorm();
    setBugs((prev) => prev.filter((b) => b.id !== id));
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      <AnimatePresence>
        {bugs.map((bug) => (
          <motion.div
            key={bug.id}
            initial={{ left: `${bug.startX}%`, bottom: `${bug.yPosition}%`, opacity: 0 }}
            animate={{ left: `${bug.endX}%`, opacity: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{
              left: { duration: bug.duration, ease: "linear" },
              opacity: { duration: 0.5 },
              scale: { duration: 0.2 },
            }}
            className="absolute cursor-pointer pointer-events-auto drop-shadow-md p-4 -m-4"
            onClick={() => handleCatch(bug.id)}
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
          >
            <motion.div
              animate={{ rotate: [-5, 5, -5], y: [0, -2, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }}
              className="text-3xl"
              style={{
                transform: bug.direction === "left" ? "scaleX(-1)" : "scaleX(1)",
              }}
            >
              🐛
            </motion.div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
