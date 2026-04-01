import React from "react";
import { Link } from "react-router";
import { useGame } from "../context/GameContext";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, WalletCards, Star } from "lucide-react";

export const Cards: React.FC = () => {
  const { cards, drawCard, stars } = useGame();

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-purple-50 p-6">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-300 via-purple-50 to-pink-100"></div>

      {/* 头部导航 */}
      <header className="flex items-center justify-between w-full p-4 bg-white/70 backdrop-blur-md rounded-3xl shadow-sm mb-6 z-10">
        <Link to="/">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 bg-gray-100 px-5 py-3 rounded-full shadow-sm text-gray-700 font-bold text-lg cursor-pointer transition-colors hover:bg-gray-200"
          >
            <ArrowLeft className="w-6 h-6" />
            返回首页
          </motion.button>
        </Link>
        <h1 className="text-3xl font-extrabold text-purple-700 flex items-center gap-3">
          <WalletCards className="w-8 h-8" />
          我的卡包
        </h1>
        <div className="flex items-center gap-2 bg-yellow-100 border-4 border-yellow-300 px-5 py-2 rounded-full shadow-sm">
          <Star className="text-yellow-500 w-8 h-8 fill-yellow-500" />
          <span className="font-bold text-2xl text-yellow-700">{stars}</span>
        </div>
      </header>

      {/* 卡片展示区 */}
      <main className="flex-1 overflow-y-auto bg-white/40 rounded-[40px] shadow-inner p-8 border-4 border-purple-200 grid grid-cols-4 gap-6 z-10 place-content-start">
        <AnimatePresence>
          {cards.map((card, index) => (
            <motion.div
              key={card.id + "-" + index}
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5 }}
              whileHover={{ y: -10, scale: 1.05 }}
              className="bg-gradient-to-br from-indigo-400 to-purple-600 rounded-2xl p-4 shadow-xl border-4 border-purple-300 aspect-[3/4] flex flex-col justify-center items-center text-white relative group cursor-pointer"
            >
              <div className="text-6xl mb-4 group-hover:animate-pulse">🃏</div>
              <span className="font-bold text-xl text-center">{card.name}</span>
              <div className="absolute top-2 left-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-full shadow">
                稀有
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {cards.length === 0 && (
          <div className="col-span-4 flex flex-col items-center justify-center text-gray-400 h-full">
            <span className="text-6xl mb-4 opacity-50">📭</span>
            <p className="text-2xl font-bold">还没有卡片，快去抽卡吧！</p>
          </div>
        )}
      </main>

      {/* 底部抽卡按钮 */}
      <div className="mt-6 flex justify-center z-10">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={drawCard}
          className="flex items-center justify-center gap-4 bg-yellow-400 rounded-full border-b-[8px] border-yellow-600 shadow-xl px-12 py-5 hover:bg-yellow-300 active:border-b-0 active:translate-y-[8px] transition-all"
        >
          <div className="text-3xl">✨</div>
          <span className="text-yellow-900 font-extrabold text-3xl">抽 一 次 卡</span>
          <div className="bg-yellow-600 text-white rounded-full px-4 py-1 text-xl font-bold flex items-center gap-1 shadow-inner">
            <Star className="w-5 h-5 fill-current" /> 20
          </div>
        </motion.button>
      </div>
    </div>
  );
};
