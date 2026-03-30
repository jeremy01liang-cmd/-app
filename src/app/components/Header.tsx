import React from "react";
import { Link } from "react-router";
import { useGame } from "../context/GameContext";
import { Star, WalletCards, ClipboardList, Gamepad2, BookOpen } from "lucide-react";
import { motion } from "motion/react";

export const Header: React.FC = () => {
  const { stars } = useGame();

  return (
    <header className="flex items-center justify-between w-full p-4 bg-white/70 backdrop-blur-md rounded-3xl shadow-sm mb-4">
      {/* 个人信息 */}
      <div className="flex items-center gap-3 bg-white p-2 pr-6 rounded-full shadow-inner border-2 border-purple-100">
        <div className="w-12 h-12 bg-purple-400 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-md">
          🦄
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-gray-700 text-lg">小葡萄</span>
          <span className="text-xs text-gray-400 font-medium">小学二年级</span>
        </div>
      </div>

      {/* 快捷操作区 */}
      <div className="flex items-center gap-4">
        {/* 星星显示 */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 bg-yellow-100 border-4 border-yellow-300 px-5 py-2 rounded-full shadow-sm"
        >
          <Star className="text-yellow-500 w-8 h-8 fill-yellow-500" />
          <span className="font-bold text-2xl text-yellow-700">{stars}</span>
        </motion.div>

        {/* 卡包入口 */}
        <Link to="/cards">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-purple-100 border-4 border-purple-300 px-5 py-2 rounded-full shadow-sm text-purple-700 font-bold text-lg cursor-pointer transition-colors hover:bg-purple-200"
          >
            <WalletCards className="w-6 h-6" />
            卡包
          </motion.button>
        </Link>

        {/* 任务入口 */}
        <Link to="/tasks">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-blue-100 border-4 border-blue-300 px-5 py-2 rounded-full shadow-sm text-blue-700 font-bold text-lg cursor-pointer transition-colors hover:bg-blue-200"
          >
            <ClipboardList className="w-6 h-6" />
            任务
          </motion.button>
        </Link>

        {/* 游戏入口 */}
        <Link to="/game">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-emerald-100 border-4 border-emerald-300 px-5 py-2 rounded-full shadow-sm text-emerald-700 font-bold text-lg cursor-pointer transition-colors hover:bg-emerald-200"
          >
            <Gamepad2 className="w-6 h-6" />
            游戏
          </motion.button>
        </Link>

        {/* 开始学习入口 */}
        <Link to="/learning">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-500 border-4 border-indigo-200 px-8 py-2 rounded-full shadow-lg shadow-blue-500/30 text-white font-extrabold text-xl cursor-pointer transition-all hover:shadow-blue-500/50 hover:from-blue-400 hover:to-indigo-400"
          >
            <BookOpen className="w-6 h-6 text-white drop-shadow-sm" />
            <span className="drop-shadow-sm tracking-wide">开始学习</span>
            <span className="text-xl animate-bounce ml-1">🚀</span>
          </motion.button>
        </Link>
      </div>
    </header>
  );
};
