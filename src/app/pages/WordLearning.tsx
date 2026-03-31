import React, { useState, useMemo, useEffect } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, BarChart2, BookOpen, Gamepad2, Volume2, Mic, CheckCircle2, Star } from "lucide-react";
import { useGame } from "../context/GameContext";
import { toast } from "sonner";

const WORD_CATEGORIES = [
  { id: "animals", name: "动物", emoji: "🦁", color: "bg-orange-400", border: "border-orange-500" },
  { id: "fruits", name: "水果", emoji: "🍎", color: "bg-red-400", border: "border-red-500" },
  { id: "colors", name: "颜色", emoji: "🎨", color: "bg-purple-400", border: "border-purple-500" },
  { id: "family", name: "人物", emoji: "👨‍👩‍👧", color: "bg-blue-400", border: "border-blue-500" },
];

const WORDS: Record<string, { id: string; english: string; chinese: string; emoji: string }[]> = {
  animals: [
    { id: "cat", english: "Cat", chinese: "猫", emoji: "🐱" },
    { id: "dog", english: "Dog", chinese: "狗", emoji: "🐶" },
    { id: "elephant", english: "Elephant", chinese: "大象", emoji: "🐘" },
    { id: "lion", english: "Lion", chinese: "狮子", emoji: "🦁" },
    { id: "monkey", english: "Monkey", chinese: "猴子", emoji: "🐵" },
  ],
  fruits: [
    { id: "apple", english: "Apple", chinese: "苹果", emoji: "🍎" },
    { id: "banana", english: "Banana", chinese: "香蕉", emoji: "🍌" },
    { id: "orange", english: "Orange", chinese: "橘子", emoji: "🍊" },
    { id: "grape", english: "Grape", chinese: "葡萄", emoji: "🍇" },
    { id: "watermelon", english: "Watermelon", chinese: "西瓜", emoji: "🍉" },
  ],
  colors: [
    { id: "red", english: "Red", chinese: "红色", emoji: "🔴" },
    { id: "blue", english: "Blue", chinese: "蓝色", emoji: "🔵" },
    { id: "green", english: "Green", chinese: "绿色", emoji: "🟢" },
    { id: "yellow", english: "Yellow", chinese: "黄色", emoji: "🟡" },
    { id: "purple", english: "Purple", chinese: "紫色", emoji: "🟣" },
  ],
  family: [
    { id: "father", english: "Father", chinese: "爸爸", emoji: "👨" },
    { id: "mother", english: "Mother", chinese: "妈妈", emoji: "👩" },
    { id: "brother", english: "Brother", chinese: "兄弟", emoji: "👦" },
    { id: "sister", english: "Sister", chinese: "姐妹", emoji: "👧" },
    { id: "baby", english: "Baby", chinese: "宝宝", emoji: "👶" },
  ]
};

export const WordLearning: React.FC = () => {
  const { learnedWords, addLearnedWord, addStars, stars } = useGame();
  
  const [activeTab, setActiveTab] = useState<"learn" | "quiz">("learn");
  const [selectedCategory, setSelectedCategory] = useState<string>("animals");
  
  // Learning State
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  
  // Quiz State
  const [quizWordIndex, setQuizWordIndex] = useState(0);
  const [shadowPassed, setShadowPassed] = useState(false);
  const [quizSuccess, setQuizSuccess] = useState(false);

  const currentCategoryWords = useMemo(() => WORDS[selectedCategory] || [], [selectedCategory]);
  const currentWord = currentCategoryWords[currentWordIndex];
  const currentQuizWord = currentCategoryWords[quizWordIndex];

  // Reset states when changing category or tab
  useEffect(() => {
    setCurrentWordIndex(0);
    setQuizWordIndex(0);
    setShowMeaning(false);
    setShadowPassed(false);
    setQuizSuccess(false);
  }, [selectedCategory, activeTab]);

  // TTS Read Aloud
  const speakWord = (text: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  // Mock Shadow Reading
  const handleShadowRead = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      // In Learning mode, we just show a little animation. 
      // In Quiz mode, it passes the first step.
      if (activeTab === "quiz") {
        setShadowPassed(true);
      }
    }, 2000);
  };

  // Generate Quiz Options
  const quizOptions = useMemo(() => {
    if (!currentQuizWord) return [];
    
    // Get all words except current
    const allOtherWords = Object.values(WORDS).flat().filter(w => w.id !== currentQuizWord.id);
    
    // Pick 3 random wrong answers
    const shuffled = [...allOtherWords].sort(() => 0.5 - Math.random());
    const wrongs = shuffled.slice(0, 3).map(w => w.chinese);
    
    // Combine and shuffle options
    return [currentQuizWord.chinese, ...wrongs].sort(() => 0.5 - Math.random());
  }, [currentQuizWord]);

  const handleQuizChoice = (choice: string) => {
    if (!shadowPassed) return; // Must shadow read first
    
    if (choice === currentQuizWord.chinese) {
      setQuizSuccess(true);
      addLearnedWord(currentQuizWord.id);
      addStars(5);
      
      setTimeout(() => {
        setQuizSuccess(false);
        setShadowPassed(false);
        setQuizWordIndex((prev) => (prev + 1) % currentCategoryWords.length);
      }, 2000);
    } else {
      toast.error("哎呀，选错啦！再试一次~ 🤔");
    }
  };

  const totalWordsCount = Object.values(WORDS).flat().length;
  const learnedCount = learnedWords.length;

  return (
    <div className="flex flex-col h-screen bg-blue-50 p-6 overflow-hidden relative">
      {/* Background */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-100 via-blue-50 to-indigo-50"></div>

      {/* Header */}
      <header className="flex items-center justify-between w-full p-4 bg-white/80 backdrop-blur-xl rounded-[30px] shadow-sm border-[4px] border-white/60 mb-6 z-10">
        <div className="flex items-center gap-4 w-1/3">
          <Link to="/learning">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-gray-100 border-[4px] border-gray-200 px-5 py-2.5 rounded-full shadow-sm text-gray-700 font-bold text-lg cursor-pointer transition-colors hover:bg-gray-200"
            >
              <ArrowLeft className="w-6 h-6" />
              返回
            </motion.button>
          </Link>
          <h1 className="text-3xl font-extrabold text-blue-600 flex items-center gap-2 drop-shadow-sm whitespace-nowrap">
            开心背单词 🔤
          </h1>
        </div>

        {/* Center: Learning Stats */}
        <div className="w-1/3 flex justify-center">
          <div className="flex flex-col items-center justify-center bg-emerald-50 border-[4px] border-emerald-200 px-6 py-2 rounded-2xl shadow-sm min-w-[200px]">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">🏆</span>
              <span className="font-extrabold text-emerald-700 text-lg">学习进度: {learnedCount} / {totalWordsCount}</span>
            </div>
            <div className="w-full bg-emerald-100/50 rounded-full h-2.5 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(learnedCount / totalWordsCount) * 100}%` }}
                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full"
              />
            </div>
          </div>
        </div>
        
        <div className="w-1/3 flex justify-end">
          <div className="flex items-center gap-2 bg-yellow-50 border-[4px] border-yellow-200 px-6 py-2.5 rounded-full shadow-sm">
            <Star className="text-yellow-400 w-8 h-8 fill-yellow-400 drop-shadow-sm" />
            <span className="font-extrabold text-2xl text-yellow-600">{stars}</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 gap-6 min-h-0 z-10">
        {/* Left Sidebar - Tabs & Categories */}
        <div className="w-[280px] flex flex-col gap-6 shrink-0">
          {/* Tabs */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[30px] p-4 border-[4px] border-white/60 shadow-sm flex flex-col gap-3">
            <TabButton 
              active={activeTab === "learn"} 
              onClick={() => setActiveTab("learn")} 
              icon={<BookOpen />} 
              text="开始学习" 
              color="text-blue-600" 
              bg="bg-blue-100" 
            />
            <TabButton 
              active={activeTab === "quiz"} 
              onClick={() => setActiveTab("quiz")} 
              icon={<Gamepad2 />} 
              text="挑战测验" 
              color="text-emerald-600" 
              bg="bg-emerald-100" 
            />
          </div>

          {/* Categories */}
          <div className="bg-white/80 backdrop-blur-xl rounded-[30px] p-4 border-[4px] border-white/60 shadow-sm flex flex-col gap-3 flex-1 overflow-y-auto">
              <h3 className="text-lg font-extrabold text-gray-500 px-2">单词分类</h3>
              {WORD_CATEGORIES.map(cat => (
                <motion.button
                  key={cat.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-3 p-3 rounded-2xl border-[3px] transition-all text-left ${
                    selectedCategory === cat.id 
                      ? `${cat.color} ${cat.border} text-white shadow-md` 
                      : "bg-white border-gray-100 hover:border-gray-200 text-gray-700"
                  }`}
                >
                  <span className="text-3xl">{cat.emoji}</span>
                  <span className="font-extrabold text-lg">{cat.name}</span>
                </motion.button>
              ))}
            </div>
          )}
        </div>

        {/* Right Content Area */}
        <div className="flex-1 bg-white/80 backdrop-blur-xl rounded-[40px] border-[4px] border-white/60 shadow-lg p-8 relative overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">

            {/* --- LEARN TAB --- */}
            {activeTab === "learn" && currentWord && (
              <motion.div 
                key="learn"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex-1 flex flex-col items-center justify-center"
              >
                {/* Flashcard */}
                <div className="bg-white w-[400px] rounded-[40px] border-[6px] border-blue-200 shadow-xl p-8 flex flex-col items-center relative">
                  <div className="text-[120px] leading-none drop-shadow-xl mb-4">{currentWord.emoji}</div>
                  <h2 className="text-6xl font-extrabold text-gray-800 mb-2">{currentWord.english}</h2>
                  
                  <div className="h-16 flex items-center justify-center mt-2">
                    {showMeaning ? (
                      <span className="text-3xl font-bold text-blue-500 bg-blue-50 px-6 py-2 rounded-full border-[3px] border-blue-100">
                        {currentWord.chinese}
                      </span>
                    ) : (
                      <span className="text-xl font-bold text-gray-300">点击下方按钮查看意思</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-6 mt-10">
                  <ActionButton 
                    icon={<Volume2 className="w-8 h-8" />} 
                    text="读单词" 
                    color="bg-sky-400 border-sky-500" 
                    onClick={() => speakWord(currentWord.english)}
                  />
                  <ActionButton 
                    icon={<BookOpen className="w-8 h-8" />} 
                    text={showMeaning ? "隐藏意思" : "看意思"} 
                    color="bg-purple-400 border-purple-500" 
                    onClick={() => setShowMeaning(!showMeaning)}
                  />
                  <ActionButton 
                    icon={<Mic className="w-8 h-8" />} 
                    text={isRecording ? "听取中..." : "跟读"} 
                    color={isRecording ? "bg-red-400 border-red-500 animate-pulse" : "bg-emerald-400 border-emerald-500"} 
                    onClick={handleShadowRead}
                  />
                </div>

                {/* Navigation */}
                <div className="flex justify-between w-full max-w-[600px] mt-12">
                  <button 
                    onClick={() => {
                      setCurrentWordIndex(prev => (prev - 1 + currentCategoryWords.length) % currentCategoryWords.length);
                      setShowMeaning(false);
                    }}
                    className="text-gray-400 hover:text-blue-500 font-extrabold text-xl p-4 transition-colors"
                  >
                    ⬅️ 上一个
                  </button>
                  <button 
                    onClick={() => {
                      setCurrentWordIndex(prev => (prev + 1) % currentCategoryWords.length);
                      setShowMeaning(false);
                    }}
                    className="text-gray-400 hover:text-blue-500 font-extrabold text-xl p-4 transition-colors"
                  >
                    下一个 ➡️
                  </button>
                </div>
              </motion.div>
            )}

            {/* --- QUIZ TAB --- */}
            {activeTab === "quiz" && currentQuizWord && (
              <motion.div 
                key="quiz"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col items-center justify-center relative w-full h-full"
              >
                {quizSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-3xl"
                  >
                    <CheckCircle2 className="w-32 h-32 text-emerald-500 mb-6 drop-shadow-md" />
                    <h2 className="text-5xl font-extrabold text-emerald-600 mb-4 drop-shadow-sm">太棒啦！</h2>
                    <div className="flex items-center gap-2 bg-yellow-100 border-[4px] border-yellow-300 px-6 py-2 rounded-full">
                      <Star className="text-yellow-500 w-8 h-8 fill-yellow-500" />
                      <span className="font-extrabold text-2xl text-yellow-600">+5 星星</span>
                    </div>
                  </motion.div>
                )}

                <div className="text-center mb-8">
                  <div className="text-[100px] leading-none mb-4 drop-shadow-xl">{currentQuizWord.emoji}</div>
                  <h2 className="text-5xl font-extrabold text-gray-800 flex items-center justify-center gap-4">
                    {currentQuizWord.english}
                    <button onClick={() => speakWord(currentQuizWord.english)} className="p-2 bg-blue-100 text-blue-500 rounded-full hover:bg-blue-200 transition-colors">
                      <Volume2 className="w-6 h-6" />
                    </button>
                  </h2>
                </div>

                <div className="w-full max-w-[800px] flex gap-12">
                  {/* Step 1: Shadow Read */}
                  <div className={`flex-1 flex flex-col items-center p-8 rounded-[30px] border-[6px] transition-all ${shadowPassed ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-gray-200 shadow-md'}`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-4 ${shadowPassed ? 'bg-emerald-500 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                    <h3 className="text-2xl font-extrabold text-gray-700 mb-6">先跟读</h3>
                    
                    {shadowPassed ? (
                      <div className="flex items-center gap-2 text-emerald-500 font-bold text-xl">
                        <CheckCircle2 className="w-8 h-8" />
                        跟读通过
                      </div>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleShadowRead}
                        className={`w-32 h-32 rounded-full flex items-center justify-center shadow-lg border-b-[8px] active:border-b-0 active:translate-y-2 transition-all ${
                          isRecording 
                            ? 'bg-red-400 border-red-600 text-white animate-pulse' 
                            : 'bg-blue-400 border-blue-600 text-white hover:bg-blue-300'
                        }`}
                      >
                        <Mic className="w-12 h-12" />
                      </motion.button>
                    )}
                    <p className="text-gray-400 font-bold mt-4">
                      {isRecording ? "正在听..." : "点击开始录音"}
                    </p>
                  </div>

                  {/* Step 2: Choose Meaning */}
                  <div className={`flex-1 flex flex-col items-center p-8 rounded-[30px] border-[6px] transition-all ${shadowPassed ? 'bg-white border-blue-200 shadow-md' : 'bg-gray-50 border-gray-200 opacity-50 pointer-events-none'}`}>
                    <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center font-bold text-xl mb-4">2</div>
                    <h3 className="text-2xl font-extrabold text-gray-700 mb-6">选意思</h3>
                    
                    <div className="grid grid-cols-2 gap-4 w-full">
                      {quizOptions.map((opt, i) => (
                        <motion.button
                          key={i}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleQuizChoice(opt)}
                          className="bg-purple-50 hover:bg-purple-100 border-[3px] border-purple-200 text-purple-700 font-extrabold text-xl py-4 rounded-2xl transition-colors shadow-sm"
                        >
                          {opt}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

// Sub-components for cleaner code
const TabButton = ({ active, onClick, icon, text, color, bg }: any) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`flex items-center gap-3 p-4 rounded-[20px] transition-all ${
      active 
        ? `${bg} ${color} border-[3px] border-current font-extrabold shadow-sm` 
        : "bg-transparent text-gray-500 font-bold hover:bg-gray-50 border-[3px] border-transparent"
    }`}
  >
    <div className={active ? "" : "opacity-70"}>{icon}</div>
    <span className="text-xl">{text}</span>
  </motion.button>
);

const ActionButton = ({ icon, text, color, onClick }: any) => (
  <motion.button
    whileHover={{ scale: 1.05, y: -2 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`${color} text-white flex flex-col items-center justify-center w-[120px] h-[100px] rounded-3xl border-b-[6px] active:border-b-0 active:translate-y-1.5 shadow-md transition-all`}
  >
    <div className="mb-2">{icon}</div>
    <span className="font-extrabold">{text}</span>
  </motion.button>
);
