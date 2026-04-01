import React from "react";
import { Link } from "react-router";
import { useGame } from "../context/GameContext";
import { useAuth } from "../context/AuthContext";
import { Star, WalletCards, ClipboardList, Gamepad2, BookOpen, ChevronRight } from "lucide-react";
import { motion } from "motion/react";

export const Header: React.FC = () => {
  const { stars } = useGame();
  const { currentUser } = useAuth();

  return (
    <header className="mb-4 flex w-full flex-wrap items-center justify-between gap-4 rounded-3xl bg-white/70 p-4 shadow-sm backdrop-blur-md">
      {/* 个人信息 */}
      <Link to="/account">
        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          className="flex shrink-0 items-center gap-3 rounded-full border-2 border-purple-100 bg-white p-2 pr-4 shadow-inner transition-colors hover:bg-purple-50"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-400 text-2xl font-bold text-white shadow-md">
            🦄
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-700 text-lg">{currentUser?.nickname ?? "小葡萄"}</span>
            <ChevronRight className="h-4 w-4 text-purple-400" />
          </div>
        </motion.div>
      </Link>

      {/* 快捷操作区 */}
      <div className="flex flex-1 flex-wrap items-center justify-end gap-3">
        {/* 星星显示 */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center gap-2 rounded-full border-4 border-yellow-300 bg-yellow-100 px-4 py-2 shadow-sm"
        >
          <Star className="text-yellow-500 w-8 h-8 fill-yellow-500" />
          <span className="font-bold text-2xl text-yellow-700">{stars}</span>
        </motion.div>

        {/* 卡包入口 */}
        <Link to="/cards">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex cursor-pointer items-center gap-2 rounded-full border-4 border-purple-300 bg-purple-100 px-4 py-2 text-base font-bold text-purple-700 shadow-sm transition-colors hover:bg-purple-200"
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
            className="flex cursor-pointer items-center gap-2 rounded-full border-4 border-blue-300 bg-blue-100 px-4 py-2 text-base font-bold text-blue-700 shadow-sm transition-colors hover:bg-blue-200"
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
            className="flex cursor-pointer items-center gap-2 rounded-full border-4 border-emerald-300 bg-emerald-100 px-4 py-2 text-base font-bold text-emerald-700 shadow-sm transition-colors hover:bg-emerald-200"
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
            className="flex cursor-pointer items-center gap-2 rounded-full border-4 border-indigo-200 bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-2 text-lg font-extrabold text-white shadow-lg shadow-blue-500/30 transition-all hover:from-blue-400 hover:to-indigo-400 hover:shadow-blue-500/50"
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
