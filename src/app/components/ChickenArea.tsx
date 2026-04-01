import React, { useState } from "react";
import { useGame } from "../context/GameContext";
import { motion, AnimatePresence } from "motion/react";
import { Bug, ShoppingBag, Carrot } from "lucide-react";

export const ChickenArea: React.FC = () => {
  const {
    chickenSkin,
    catchWormLeft,
    worms,
    corns,
    catchWorm,
    feedWorm,
    feedCorn,
    buyWorm,
    buyCorn,
    changeSkin,
  } = useGame();

  const [isFeeding, setIsFeeding] = useState(false);

  // 获取小鸡皮肤对应的 Emoji
  const getChickenEmoji = () => {
    return chickenSkin === "pony" ? "🦄" : "🐥";
  };

  const handleFeed = (type: "worm" | "corn") => {
    setIsFeeding(true);
    setTimeout(() => setIsFeeding(false), 500);
    if (type === "worm") feedWorm();
    if (type === "corn") feedCorn();
  };

  const toggleSkin = () => {
    changeSkin(chickenSkin === "pony" ? "default" : "pony");
  };

  return (
    <div className="w-full flex flex-col relative h-full shrink-0 min-h-0 z-10 px-4">
      {/* 宠物主体 */}
      <div className="flex-1 flex justify-center items-center z-10 relative mt-2 mb-2 min-h-0">
        <motion.div
          onClick={toggleSkin}
          title="点击换装"
          animate={{
            y: isFeeding ? [0, -30, 0] : [0, -15, 0],
            rotate: isFeeding ? [0, -10, 10, 0] : 0,
          }}
          transition={{
            duration: isFeeding ? 0.3 : 2,
            repeat: isFeeding ? 0 : Infinity,
            ease: "easeInOut",
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="cursor-pointer select-none text-[clamp(6rem,16vh,8.75rem)] leading-none drop-shadow-2xl"
        >
          {getChickenEmoji()}
          
          <AnimatePresence>
            {isFeeding && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1.5, y: -60 }}
                exit={{ opacity: 0, scale: 0 }}
                className="absolute top-0 right-[-20px] text-5xl z-20"
              >
                💖
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* 底部操作按钮 */}
      <div className="flex flex-col gap-4 mt-auto z-10 shrink-0">
        <div className="flex justify-center">
          <div className="rounded-full border border-red-200 bg-white/85 px-4 py-1.5 text-xs font-bold text-red-500 shadow-sm">
            今日还能抓 {catchWormLeft} 条虫子
          </div>
        </div>
        <div className="flex gap-4 justify-center">
          {/* 喂虫子区域 */}
          <div className="flex w-[120px] flex-col items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFeed("worm")}
              className="w-full h-[54px] flex items-center justify-center gap-2 rounded-2xl bg-red-400 border-red-600 border-b-[4px] hover:bg-red-300 active:border-b-0 active:translate-y-1 text-white shadow-sm"
            >
              <Bug className="w-5 h-5" />
              <span className="font-bold text-sm">喂虫子 ({worms})</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={buyWorm}
              className="flex items-center justify-center w-full h-[28px] rounded-full bg-white border-yellow-400 border-2 text-yellow-700 text-[11px] font-bold shadow-sm"
            >
              买虫子 <span className="ml-1 text-yellow-500">⭐5</span>
            </motion.button>
          </div>

          {/* 喂玉米区域 */}
          <div className="flex w-[120px] flex-col items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleFeed("corn")}
              className="w-full h-[54px] flex items-center justify-center gap-2 rounded-2xl bg-yellow-400 border-yellow-600 border-b-[4px] hover:bg-yellow-300 active:border-b-0 active:translate-y-1 text-yellow-900 shadow-sm"
            >
              <Carrot className="w-5 h-5" />
              <span className="font-bold text-sm">喂玉米 ({corns})</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={buyCorn}
              className="flex items-center justify-center w-full h-[28px] rounded-full bg-white border-yellow-400 border-2 text-yellow-700 text-[11px] font-bold shadow-sm"
            >
              买玉米 <span className="ml-1 text-yellow-500">⭐5</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};
