import React, { useState } from "react";
import { useGame } from "../context/GameContext";
import { motion, AnimatePresence } from "motion/react";
import { Droplet, Leaf, ShoppingCart } from "lucide-react";

export const TreeArea: React.FC = () => {
  const { treeLevel, treeProgress, waterLeft, fertilizers, waterTree, useFertilizer, buyFertilizer } = useGame();
  const [isWatering, setIsWatering] = useState(false);
  const [isFertilizing, setIsFertilizing] = useState(false);

  // 根据等级渲染不同的树 Emoji
  const getTreeEmoji = () => {
    if (treeLevel === 1) return "🌱";
    if (treeLevel === 2) return "🌿";
    if (treeLevel === 3) return "🌳";
    return "🌲";
  };

  const handleWater = () => {
    if (waterLeft > 0) {
      setIsWatering(true);
      setTimeout(() => setIsWatering(false), 500);
      waterTree();
    } else {
      waterTree(); // 触发提示
    }
  };

  const handleFertilize = () => {
    if (fertilizers > 0) {
      setIsFertilizing(true);
      setTimeout(() => setIsFertilizing(false), 600);
      useFertilizer();
    } else {
      useFertilizer(); // 触发提示
    }
  };

  return (
    <div className="flex-1 flex flex-col relative h-full min-h-0 z-10 px-4">
      {/* 树的主体与进度条 */}
      <div className="flex-1 flex flex-col justify-center items-center z-10 relative mt-2 mb-2 min-h-0">
        <motion.div
          animate={{
            scale: isWatering ? [1, 1.1, 0.9, 1] : isFertilizing ? [1, 1.2, 0.8, 1.1, 1] : 1,
            rotate: isWatering ? [0, -5, 5, 0] : isFertilizing ? [0, -15, 15, -10, 10, 0] : 0,
          }}
          transition={{ duration: isFertilizing ? 0.6 : 0.5 }}
          className="text-[180px] drop-shadow-2xl cursor-pointer select-none relative leading-none"
        >
          {getTreeEmoji()}
          
          <AnimatePresence>
            {isWatering && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.5 }}
                animate={{ opacity: 1, y: -60, scale: 1.5 }}
                exit={{ opacity: 0, y: -80, scale: 0 }}
                className="absolute top-0 left-[50%] ml-[-20px] text-5xl z-20"
              >
                💧
              </motion.div>
            )}
            {isFertilizing && (
              <motion.div
                initial={{ opacity: 0, y: 0, scale: 0.5 }}
                animate={{ opacity: 1, y: -60, scale: 1.8 }}
                exit={{ opacity: 0, y: -100, scale: 0 }}
                className="absolute top-0 right-[-10px] text-5xl z-20"
              >
                ✨
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* 极简经验条 - 位于树正下方 */}
        <div className="mt-4 flex items-center gap-2 bg-white/40 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm border border-white/50 w-[140px]">
          <span className="text-green-700/80 font-bold text-[11px] whitespace-nowrap">
            Lv.{treeLevel}
          </span>
          <div className="flex-1 h-[6px] bg-black/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${treeProgress}%` }}
              className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full"
            />
          </div>
          <span className="font-bold text-gray-500/80 text-[10px] text-right min-w-[24px]">{treeProgress}%</span>
        </div>
      </div>

      {/* 底部操作按钮 */}
      <div className="flex flex-col gap-4 mt-auto z-10 shrink-0">
        <div className="flex gap-4 justify-center">
          {/* 浇水区域 */}
          <div className="flex flex-col gap-2 items-center w-[120px]">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleWater}
              className={`w-full h-[54px] flex items-center justify-center gap-2 rounded-2xl border-b-[4px] shadow-sm transition-colors ${
                waterLeft > 0
                  ? "bg-blue-400 border-blue-600 hover:bg-blue-300 active:border-b-0 active:translate-y-1 text-white"
                  : "bg-gray-300 border-gray-400 text-gray-500 cursor-not-allowed"
              }`}
            >
              <Droplet className="w-5 h-5 fill-current" />
              <span className="font-bold text-sm">浇水</span>
            </motion.button>
            <div className="h-[28px] w-full flex items-center justify-center text-[11px] text-green-700/70 font-bold bg-green-100/80 rounded-full border border-green-200">
              剩余 {waterLeft} 次
            </div>
          </div>

          {/* 施肥区域 */}
          <div className="flex flex-col gap-2 items-center w-[120px]">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleFertilize}
              className="w-full h-[54px] flex items-center justify-center gap-2 rounded-2xl bg-green-500 border-green-700 border-b-[4px] hover:bg-green-400 active:border-b-0 active:translate-y-1 text-white shadow-sm"
            >
              <Leaf className="w-5 h-5 fill-current" />
              <span className="font-bold text-sm">施肥 ({fertilizers})</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={buyFertilizer}
              className="flex items-center justify-center w-full h-[28px] rounded-full bg-white border-yellow-400 border-2 text-yellow-700 text-[11px] font-bold shadow-sm"
            >
              买化肥 <span className="ml-1 text-yellow-500">⭐5</span>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};