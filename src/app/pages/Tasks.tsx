import React from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, ClipboardList, CheckCircle2, Circle } from "lucide-react";

export const Tasks: React.FC = () => {
  const tasks = [
    { id: 1, title: "完成一节数学课", reward: 20, completed: false },
    { id: 2, title: "读完一本英语故事绘本", reward: 15, completed: false },
    { id: 3, title: "给成长树浇水 1 次", reward: 5, completed: true },
    { id: 4, title: "抽卡 1 次", reward: 10, completed: false },
  ];

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-blue-50 p-6">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-blue-300 via-blue-50 to-indigo-100"></div>

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
        <h1 className="text-3xl font-extrabold text-blue-700 flex items-center gap-3">
          <ClipboardList className="w-8 h-8" />
          今日任务
        </h1>
        <div className="w-[140px]"></div> {/* 占位以居中标题 */}
      </header>

      {/* 任务列表区 */}
      <main className="flex-1 overflow-y-auto z-10 flex justify-center">
        <div className="w-full max-w-4xl bg-white/60 rounded-[40px] shadow-lg p-8 border-4 border-blue-200 flex flex-col gap-6">
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className={`flex items-center justify-between p-6 rounded-3xl shadow-sm border-2 ${
                task.completed ? "bg-green-50 border-green-200" : "bg-white border-blue-100"
              }`}
            >
              <div className="flex items-center gap-4">
                {task.completed ? (
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                ) : (
                  <Circle className="w-10 h-10 text-gray-300" />
                )}
                <span className={`text-2xl font-bold ${task.completed ? "text-gray-400 line-through" : "text-gray-700"}`}>
                  {task.title}
                </span>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 bg-yellow-100 px-4 py-2 rounded-full border-2 border-yellow-300">
                  <span className="text-yellow-700 font-bold text-xl">+{task.reward}</span>
                  <span className="text-2xl">⭐</span>
                </div>
                {!task.completed && (
                  <Link to="/learning">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-blue-500 text-white font-bold text-xl px-6 py-3 rounded-full shadow-md border-b-4 border-blue-700 active:border-b-0 active:translate-y-1 hover:bg-blue-400"
                    >
                      去完成
                    </motion.button>
                  </Link>
                )}
                {task.completed && (
                  <button className="bg-gray-300 text-gray-500 font-bold text-xl px-6 py-3 rounded-full cursor-not-allowed">
                    已完成
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};
