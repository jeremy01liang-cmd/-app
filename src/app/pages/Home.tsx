import React from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { Header } from "../components/Header";
import { TreeArea } from "../components/TreeArea";
import { ChickenArea } from "../components/ChickenArea";
import { CrawlingBugs } from "../components/CrawlingBugs";

export const Home: React.FC = () => {
  return (
    <div className="flex flex-col h-screen bg-sky-100 p-6 overflow-hidden relative">
      {/* 装饰性背景 */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-yellow-300 via-sky-100 to-sky-200"></div>

      {/* 头部组件 */}
      <Header />

      {/* 中部核心区域 (左右布局 - 统一大背景) */}
      <main className="flex flex-1 gap-0 min-h-0 mb-6 relative z-10 bg-gradient-to-b from-sky-200 via-sky-100 to-green-100 rounded-[40px] border-4 border-green-300/50 shadow-inner overflow-hidden">
        {/* 自然风景装饰背景 - 远景丘陵 */}
        <div className="absolute bottom-[30%] left-[-10%] right-[40%] h-[40%] bg-gradient-to-b from-green-300/60 to-green-400/40 pointer-events-none rounded-[100%]" style={{ transform: "rotate(-5deg)" }}></div>
        <div className="absolute bottom-[25%] left-[30%] right-[-10%] h-[45%] bg-gradient-to-b from-green-300/80 to-green-400/50 pointer-events-none rounded-[100%]" style={{ transform: "rotate(3deg)" }}></div>
        
        {/* 自然风景装饰背景 - 近景草地 */}
        <div className="absolute bottom-0 left-0 right-0 h-[40%] bg-gradient-to-t from-green-500 via-green-400 to-green-300 pointer-events-none shadow-[0_-10px_20px_rgba(0,0,0,0.05)]" style={{ borderRadius: "100% 100% 0 0 / 15% 15% 0 0" }}></div>
        
        {/* 天空装饰 */}
        <div className="absolute top-8 left-12 text-6xl opacity-70 pointer-events-none animate-[pulse_4s_ease-in-out_infinite]">☁️</div>
        <div className="absolute top-16 right-40 text-5xl opacity-60 pointer-events-none animate-[pulse_5s_ease-in-out_infinite]">☁️</div>
        <div className="absolute top-6 left-1/2 text-7xl opacity-40 pointer-events-none drop-shadow-[0_0_20px_rgba(255,215,0,0.8)]">☀️</div>
        
        {/* 草地装饰 */}
        <div className="absolute bottom-6 left-[15%] text-3xl opacity-90 pointer-events-none">🌻</div>
        <div className="absolute bottom-12 right-[18%] text-3xl opacity-90 pointer-events-none">🍄</div>
        <div className="absolute bottom-4 left-[45%] text-2xl opacity-80 pointer-events-none">🌱</div>
        <div className="absolute bottom-16 left-[25%] text-xl opacity-60 pointer-events-none">🌿</div>
        <div className="absolute bottom-10 right-[35%] text-2xl opacity-70 pointer-events-none">🌼</div>
        
        {/* 满地爬的虫子 */}
        <CrawlingBugs />
        
        {/* 左侧成长树区域 */}
        <div className="flex-1 py-6 pl-8 pr-4 z-10">
          <TreeArea />
        </div>
        
        {/* 右侧宠物区域 */}
        <div className="w-[400px] py-6 pr-8 pl-4 z-10 shrink-0">
          <ChickenArea />
        </div>
      </main>
    </div>
  );
};
