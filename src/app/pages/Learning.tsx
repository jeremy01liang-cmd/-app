import React from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, BookOpen, Calculator, Globe2, Shapes } from "lucide-react";

export const Learning: React.FC = () => {
  const courses = [
    {
      id: "math",
      title: "奇妙数学",
      desc: "认识数字和图形",
      color: "bg-red-400",
      shadow: "shadow-red-700/50",
      border: "border-red-600",
      icon: <Calculator className="w-16 h-16 text-white mb-4" />,
    },
    {
      id: "english",
      title: "趣味英语",
      desc: "跟着儿歌学字母",
      color: "bg-blue-400",
      shadow: "shadow-blue-700/50",
      border: "border-blue-600",
      icon: <Globe2 className="w-16 h-16 text-white mb-4" />,
    },
    {
      id: "chinese",
      title: "汉字乐园",
      desc: "有趣的象形字",
      color: "bg-green-400",
      shadow: "shadow-green-700/50",
      border: "border-green-600",
      icon: <BookOpen className="w-16 h-16 text-white mb-4" />,
    },
    {
      id: "art",
      title: "创意美术",
      desc: "画出彩色世界",
      color: "bg-purple-400",
      shadow: "shadow-purple-700/50",
      border: "border-purple-600",
      icon: <Shapes className="w-16 h-16 text-white mb-4" />,
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-orange-50 p-6 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-200 via-orange-100 to-red-50"></div>

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
        <h1 className="text-3xl font-extrabold text-orange-600 flex items-center gap-3">
          <BookOpen className="w-8 h-8" />
          选择课程
        </h1>
        <div className="w-[140px]"></div> {/* 占位以居中标题 */}
      </header>

      {/* 课程列表区 */}
      <main className="flex-1 overflow-y-auto z-10 flex flex-col items-center">
        <h2 className="text-4xl font-extrabold text-gray-800 mb-8 drop-shadow-sm">
          今天想学点什么呢？🤔
        </h2>
        <div className="w-full max-w-5xl grid grid-cols-2 gap-8 px-4">
          {courses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className={`${course.color} rounded-[40px] p-8 flex flex-col items-center justify-center text-center cursor-pointer border-b-[8px] ${course.border} ${course.shadow} shadow-2xl hover:brightness-110 active:border-b-0 active:translate-y-2 transition-all`}
            >
              {course.icon}
              <h3 className="text-4xl font-extrabold text-white mb-2 drop-shadow-md tracking-wider">
                {course.title}
              </h3>
              <p className="text-xl text-white/90 font-bold bg-black/10 px-4 py-2 rounded-full mt-2">
                {course.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};
