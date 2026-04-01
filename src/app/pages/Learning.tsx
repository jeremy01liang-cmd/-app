import React from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, BookOpen, Calculator, Globe2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { type GradeKey, getCourseRecommendation, getGradeOption } from "../lib/parentPortal";

export const Learning: React.FC = () => {
  const { currentUser } = useAuth();
  const childGrade = (currentUser?.childGrade ?? null) as GradeKey | null;
  const currentGrade = getGradeOption(childGrade);
  const recommendation = getCourseRecommendation(childGrade);

  const courses = [
    {
      id: "words",
      title: "开心背单词",
      desc: recommendation?.wordLearning.description ?? "看图识字，边玩边学",
      badge: recommendation?.wordLearning.label ?? "默认推荐",
      color: "bg-blue-400",
      shadow: "shadow-blue-700/50",
      border: "border-blue-600",
      icon: <Globe2 className="w-16 h-16 text-white mb-4" />,
      link: "/learning/words"
    },
    {
      id: "oral-math-race",
      title: "口算竞赛",
      desc: recommendation?.oralMath.description ?? "60秒冲分，连击翻倍",
      badge: recommendation?.oralMath.label ?? "默认推荐",
      color: "bg-amber-400",
      shadow: "shadow-amber-700/40",
      border: "border-amber-600",
      icon: <Calculator className="w-16 h-16 text-white mb-4" />,
      link: "/learning/oral-math-race"
    }
  ];

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-orange-50 p-6">
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
        <div className="mb-8 w-full max-w-5xl px-4">
          <div className="rounded-[28px] border border-white/80 bg-white/70 px-6 py-5 text-left shadow-sm backdrop-blur-sm">
            <div className="text-sm font-black text-sky-700">家长端已同步学习建议</div>
            <div className="mt-2 text-2xl font-black text-slate-800">
              {currentGrade && recommendation ? `${currentGrade.label} · ${recommendation.overallLabel}` : "暂未设置孩子年级"}
            </div>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              {recommendation?.summary ?? "前往首页的【家长端】入口，选择孩子年级后，系统会自动匹配更合适的课程难度。"}
            </p>
          </div>
        </div>
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
          {courses.map((course, index) => (
            <Link key={course.id} to={course.link} className="block">
              <motion.div
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
                <div className="mt-4 rounded-full bg-white/20 px-4 py-2 text-sm font-black text-white shadow-sm">
                  当前匹配：{course.badge}
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};
