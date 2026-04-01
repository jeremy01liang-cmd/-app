import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, BookOpen, ChevronLeft, ChevronRight, Gamepad2, Volume2, Mic, CheckCircle2, Star } from "lucide-react";
import { useGame } from "../context/GameContext";
import { toast } from "sonner";
import { startWavRecording, type RecordingSession } from "../lib/audioRecorder";
import { recognizeWordAudio, synthesizeWordAudio } from "../lib/aliyunSpeech";

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

type ShadowFeedback = {
  score: number;
  label: string;
  message: string;
  passed: boolean;
  transcript: string;
  tone: "emerald" | "amber" | "rose";
};

type QuizFeedbackPopup = {
  title: string;
  message: string;
  detail?: string;
  scoreText?: string;
  tone: "emerald" | "amber" | "rose";
};

export const WordLearning: React.FC = () => {
  const { learnedWords, addLearnedWord, addStars, stars } = useGame();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const recordingSessionRef = useRef<RecordingSession | null>(null);
  
  const [activeTab, setActiveTab] = useState<"learn" | "quiz">("learn");
  const [selectedCategory, setSelectedCategory] = useState<string>("animals");
  
  // Learning State
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [showMeaning, setShowMeaning] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");
  const [recordingIssue, setRecordingIssue] = useState<string | null>(null);
  const [shadowFeedback, setShadowFeedback] = useState<ShadowFeedback | null>(null);
  const [quizFeedbackPopup, setQuizFeedbackPopup] = useState<QuizFeedbackPopup | null>(null);
  
  // Quiz State
  const [quizWordIndex, setQuizWordIndex] = useState(0);
  const [hasShadowAttempt, setHasShadowAttempt] = useState(false);
  const [quizSuccess, setQuizSuccess] = useState(false);

  const currentCategoryWords = useMemo(() => WORDS[selectedCategory] || [], [selectedCategory]);
  const currentWord = currentCategoryWords[currentWordIndex];
  const currentQuizWord = currentCategoryWords[quizWordIndex];
  const currentTargetWord = activeTab === "quiz" ? currentQuizWord?.english : currentWord?.english;
  const learnWordProgress = currentCategoryWords.length > 0 ? `${currentWordIndex + 1} / ${currentCategoryWords.length}` : "0 / 0";

  // Reset states when changing category or tab
  useEffect(() => {
    setCurrentWordIndex(0);
    setQuizWordIndex(0);
    setShowMeaning(false);
    setQuizSuccess(false);
    setHasShadowAttempt(false);
    setLastTranscript("");
    setRecordingIssue(null);
    setShadowFeedback(null);
    setQuizFeedbackPopup(null);
  }, [selectedCategory, activeTab]);

  useEffect(() => {
    if (!quizFeedbackPopup || activeTab !== "quiz") {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setQuizFeedbackPopup(null);
    }, 2800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [activeTab, quizFeedbackPopup]);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = null;
      }
      void recordingSessionRef.current?.cancel();
    };
  }, []);

  const normalizeEnglish = (value: string) => value.toLowerCase().replace(/[^a-z]/g, "");

  const getEditDistance = (source: string, target: string) => {
    const rows = source.length + 1;
    const cols = target.length + 1;
    const matrix = Array.from({ length: rows }, () => Array(cols).fill(0));

    for (let row = 0; row < rows; row += 1) {
      matrix[row][0] = row;
    }

    for (let col = 0; col < cols; col += 1) {
      matrix[0][col] = col;
    }

    for (let row = 1; row < rows; row += 1) {
      for (let col = 1; col < cols; col += 1) {
        const cost = source[row - 1] === target[col - 1] ? 0 : 1;
        matrix[row][col] = Math.min(
          matrix[row - 1][col] + 1,
          matrix[row][col - 1] + 1,
          matrix[row - 1][col - 1] + cost,
        );
      }
    }

    return matrix[source.length][target.length];
  };

  const evaluateShadowFeedback = (transcript: string, targetWord: string): ShadowFeedback => {
    const normalizedTranscript = normalizeEnglish(transcript);
    const normalizedTarget = normalizeEnglish(targetWord);

    if (!normalizedTranscript) {
      return {
        score: 0,
        label: "没听清",
        message: "这次识别得不太清楚，靠近一点麦克风再试试。",
        passed: false,
        transcript,
        tone: "rose",
      };
    }

    const longestLength = Math.max(normalizedTranscript.length, normalizedTarget.length, 1);
    const editDistance = getEditDistance(normalizedTranscript, normalizedTarget);
    const editScore = Math.max(0, 1 - editDistance / longestLength);
    const inclusionScore =
      normalizedTranscript.includes(normalizedTarget) || normalizedTarget.includes(normalizedTranscript)
        ? Math.min(normalizedTranscript.length, normalizedTarget.length) / longestLength
        : 0;
    const score = Math.max(editScore, inclusionScore);

    if (score >= 0.9) {
      return {
        score,
        label: "非常棒",
        message: "发音很准，继续选意思吧。",
        passed: true,
        transcript,
        tone: "emerald",
      };
    }

    if (score >= 0.7) {
      return {
        score,
        label: "不错",
        message: "已经比较接近了，可以继续答题。",
        passed: true,
        transcript,
        tone: "amber",
      };
    }

    return {
      score,
      label: "再练练",
      message: "我已经记录下你的跟读了，建议再读清楚一点后继续。",
      passed: false,
      transcript,
      tone: "rose",
    };
  };

  const showQuizFeedbackPopup = (popup: QuizFeedbackPopup) => {
    if (activeTab !== "quiz") {
      return;
    }

    setQuizFeedbackPopup(popup);
  };

  const handleSpeakWord = async (text: string) => {
    if (!text || isSpeaking) {
      return;
    }

    try {
      setIsSpeaking(true);
      const audioBlob = await synthesizeWordAudio(text);
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audioRef.current?.pause();
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
      audioRef.current = audio;
      audioUrlRef.current = audioUrl;

      audio.onended = () => {
        URL.revokeObjectURL(audioUrl);
        if (audioUrlRef.current === audioUrl) {
          audioUrlRef.current = null;
        }
        setIsSpeaking(false);
      };

      audio.onerror = () => {
        URL.revokeObjectURL(audioUrl);
        if (audioUrlRef.current === audioUrl) {
          audioUrlRef.current = null;
        }
        setIsSpeaking(false);
        toast.error("单词音频播放失败");
      };

      await audio.play();
    } catch (error) {
      setIsSpeaking(false);
      toast.error(error instanceof Error ? error.message : "读单词失败");
    }
  };

  const resetLearnWordState = () => {
    audioRef.current?.pause();
    audioRef.current = null;
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }

    const activeSession = recordingSessionRef.current;
    recordingSessionRef.current = null;
    if (activeSession) {
      void activeSession.cancel();
    }

    setIsSpeaking(false);
    setIsRecording(false);
    setShowMeaning(false);
    setLastTranscript("");
  };

  const handleLearnWordNavigation = (direction: "previous" | "next") => {
    if (currentCategoryWords.length === 0) {
      return;
    }

    resetLearnWordState();
    setCurrentWordIndex((prev) =>
      direction === "previous"
        ? (prev - 1 + currentCategoryWords.length) % currentCategoryWords.length
        : (prev + 1) % currentCategoryWords.length,
    );
  };

  const handleShadowRead = async () => {
    if (!currentTargetWord) {
      return;
    }

    if (!isRecording) {
      try {
        setLastTranscript("");
        setRecordingIssue(null);
        setShadowFeedback(null);
        setQuizFeedbackPopup(null);
        setHasShadowAttempt(false);
        recordingSessionRef.current = await startWavRecording();
        setIsRecording(true);
        toast.message("开始录音，再点一次按钮结束跟读");
      } catch (error) {
        const message = error instanceof Error ? error.message : "无法启动麦克风";
        setRecordingIssue(message);
        showQuizFeedbackPopup({
          title: "麦克风暂时不可用",
          message,
          detail: "请允许浏览器访问麦克风后再试一次。",
          tone: "rose",
        });
        toast.error(message);
      }
      return;
    }

    const activeSession = recordingSessionRef.current;
    recordingSessionRef.current = null;
    setIsRecording(false);

    if (!activeSession) {
      return;
    }

    try {
      const wavBlob = await activeSession.stop();
      const result = await recognizeWordAudio(wavBlob);
      const transcript = result.transcript.trim();
      const feedback = evaluateShadowFeedback(transcript, currentTargetWord);

      setLastTranscript(transcript);
      setRecordingIssue(null);
      setShadowFeedback(feedback);
      setHasShadowAttempt(true);
      showQuizFeedbackPopup({
        title: feedback.label,
        message: feedback.message,
        detail: feedback.transcript ? `识别结果：${feedback.transcript}` : "这次没有识别到清晰英文",
        scoreText: `匹配度 ${Math.round(feedback.score * 100)}%`,
        tone: feedback.tone,
      });

      if (!feedback.passed) {
        toast.error(feedback.message);
        return;
      }

      toast.success(`${feedback.label}：${transcript || currentTargetWord}`);
    } catch (error) {
      setShadowFeedback(null);
      setHasShadowAttempt(false);
      const message = error instanceof Error ? error.message : "跟读识别失败";
      setRecordingIssue(message);
      showQuizFeedbackPopup({
        title: "跟读失败",
        message,
        detail: "稍等一下，重新点麦克风再试试。",
        tone: "rose",
      });
      toast.error(message);
    }
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
    if (!hasShadowAttempt) {
      toast.message("先完成一次跟读，再来选意思。");
      return;
    }
    
    if (choice === currentQuizWord.chinese) {
      setQuizSuccess(true);
      addLearnedWord(currentQuizWord.id);
      addStars(5);
      
      setTimeout(() => {
        setQuizSuccess(false);
        setHasShadowAttempt(false);
        setShadowFeedback(null);
        setQuizFeedbackPopup(null);
        setLastTranscript("");
        setQuizWordIndex((prev) => (prev + 1) % currentCategoryWords.length);
      }, 2000);
    } else {
      toast.error("哎呀，选错啦！再试一次~ 🤔");
    }
  };

  const totalWordsCount = Object.values(WORDS).flat().length;
  const learnedCount = learnedWords.length;

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-blue-50 p-6">
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
        </div>

        {/* Right Content Area */}
        <div className="flex-1 bg-white/80 backdrop-blur-xl rounded-[40px] border-[4px] border-white/60 shadow-lg p-8 relative overflow-hidden flex flex-col">
          {activeTab === "quiz" && quizSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 z-50 flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.96),_rgba(236,253,245,0.96)_45%,_rgba(209,250,229,0.98))] backdrop-blur-md"
            >
              <div className="flex w-full max-w-[420px] flex-col items-center rounded-[36px] border-[5px] border-emerald-200 bg-white/95 px-10 py-12 shadow-[0_24px_80px_rgba(16,185,129,0.18)]">
                <div className="mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-16 w-16 text-emerald-500 drop-shadow-sm" />
                </div>
                <h2 className="text-5xl font-extrabold text-emerald-600 mb-3 drop-shadow-sm">太棒啦！</h2>
                <p className="text-lg font-bold text-emerald-700/80">跟读和选意思都完成啦</p>
                <div className="mt-8 flex items-center gap-3 rounded-full border-[4px] border-yellow-300 bg-yellow-100 px-7 py-3 shadow-sm">
                  <Star className="h-8 w-8 fill-yellow-500 text-yellow-500" />
                  <span className="text-2xl font-extrabold text-yellow-600">+5 星星</span>
                </div>
                <p className="mt-6 text-sm font-bold text-gray-400">正在为你准备下一个单词...</p>
              </div>
            </motion.div>
          )}
          <AnimatePresence mode="wait">

            {/* --- LEARN TAB --- */}
            {activeTab === "learn" && currentWord && (
              <motion.div 
                key="learn"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-1 flex-col items-center justify-center px-4 py-3"
              >
                <div className="flex w-full max-w-[720px] flex-col items-center gap-4">
                  {/* Flashcard */}
                  <div className="relative flex w-full max-w-[340px] flex-col items-center rounded-[32px] border-[5px] border-blue-200 bg-white px-6 py-5 shadow-xl">
                    <div className="mb-2 text-[88px] leading-none drop-shadow-xl">{currentWord.emoji}</div>
                    <span
                      className="mb-2 rounded-full bg-sky-50 px-4 py-1 text-xs font-extrabold tracking-[0.3em] text-sky-500"
                      lang="en"
                      translate="no"
                    >
                      ENGLISH
                    </span>
                    <h2
                      className="notranslate mb-2 text-5xl font-extrabold text-gray-800"
                      lang="en"
                      translate="no"
                    >
                      {currentWord.english}
                    </h2>
                    
                    <div className="mt-1 flex min-h-12 items-center justify-center">
                      {showMeaning ? (
                        <span className="rounded-full border-[3px] border-blue-100 bg-blue-50 px-6 py-2 text-2xl font-bold text-blue-500">
                          {currentWord.chinese}
                        </span>
                      ) : (
                        <div className="flex items-center gap-2 rounded-full border border-dashed border-sky-200 px-5 py-2 text-xs font-bold uppercase tracking-[0.3em] text-sky-300">
                          <span>Translation</span>
                          <span>Hidden</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Secondary Navigation */}
                  <div className="flex items-center justify-center gap-3 text-sm font-bold text-gray-400">
                    <WordNavButton
                      direction="previous"
                      label="上一个"
                      icon={<ChevronLeft className="h-4 w-4" />}
                      onClick={() => handleLearnWordNavigation("previous")}
                    />
                    <span className="rounded-full bg-sky-50 px-3 py-1.5 text-sky-600">
                      {learnWordProgress}
                    </span>
                    <WordNavButton
                      direction="next"
                      label="下一个"
                      icon={<ChevronRight className="h-4 w-4" />}
                      onClick={() => handleLearnWordNavigation("next")}
                    />
                  </div>

                  {/* Primary Actions */}
                  <div className="flex flex-wrap justify-center gap-4">
                    <ActionButton 
                      icon={<Volume2 className="w-8 h-8" />} 
                      text={isSpeaking ? "播放中..." : "读单词"} 
                      color="bg-sky-400 border-sky-500" 
                      onClick={() => handleSpeakWord(currentWord.english)}
                    />
                    <ActionButton 
                      icon={<BookOpen className="w-8 h-8" />} 
                      text={showMeaning ? "隐藏中文" : "显示中文"} 
                      color="bg-purple-400 border-purple-500" 
                      onClick={() => setShowMeaning(!showMeaning)}
                    />
                    <ActionButton 
                      icon={<Mic className="w-8 h-8" />} 
                      text={isRecording ? "结束跟读" : "跟读"} 
                      color={isRecording ? "bg-red-400 border-red-500 animate-pulse" : "bg-emerald-400 border-emerald-500"} 
                      onClick={handleShadowRead}
                    />
                  </div>

                  <div className="min-h-8 text-center">
                    {recordingIssue ? (
                      <span className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-bold text-rose-600">
                        {recordingIssue}
                      </span>
                    ) : lastTranscript ? (
                      <span
                        className="notranslate rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-600"
                        lang="en"
                        translate="no"
                      >
                        识别结果：{lastTranscript}
                      </span>
                    ) : (
                      <span className="text-sm font-bold text-gray-300">先听英文，再按跟读进行识别</span>
                    )}
                  </div>
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
                <AnimatePresence>
                  {quizFeedbackPopup && !quizSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -18, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -12, scale: 0.98 }}
                      className="absolute left-1/2 top-4 z-40 w-full max-w-[420px] -translate-x-1/2 px-4"
                    >
                      <div
                        className={`rounded-[28px] border-[4px] bg-white/96 px-6 py-5 shadow-[0_18px_60px_rgba(15,23,42,0.16)] backdrop-blur-sm ${
                          quizFeedbackPopup.tone === "emerald"
                            ? "border-emerald-200 text-emerald-700"
                            : quizFeedbackPopup.tone === "amber"
                              ? "border-amber-200 text-amber-700"
                              : "border-rose-200 text-rose-700"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <span className="text-2xl font-extrabold">{quizFeedbackPopup.title}</span>
                          {quizFeedbackPopup.scoreText && (
                            <span className="rounded-full bg-black/5 px-3 py-1 text-sm font-extrabold">
                              {quizFeedbackPopup.scoreText}
                            </span>
                          )}
                        </div>
                        <p className="mt-3 text-sm font-bold opacity-90">{quizFeedbackPopup.message}</p>
                        {quizFeedbackPopup.detail && (
                          <p className="mt-2 text-sm font-bold opacity-75">{quizFeedbackPopup.detail}</p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="text-center mb-8">
                  <h2 className="text-5xl font-extrabold text-gray-800 flex items-center justify-center gap-4">
                    <span className="notranslate" lang="en" translate="no">
                      {currentQuizWord.english}
                    </span>
                    <button onClick={() => handleSpeakWord(currentQuizWord.english)} className="p-2 bg-blue-100 text-blue-500 rounded-full hover:bg-blue-200 transition-colors">
                      <Volume2 className="w-6 h-6" />
                    </button>
                  </h2>
                </div>

                <div className="w-full max-w-[800px] flex gap-12">
                  {/* Step 1: Shadow Read */}
                  <div className={`flex-1 flex flex-col items-center p-8 rounded-[30px] border-[6px] transition-all ${
                    shadowFeedback
                      ? shadowFeedback.tone === "emerald"
                        ? "bg-emerald-50 border-emerald-300"
                        : shadowFeedback.tone === "amber"
                          ? "bg-amber-50 border-amber-300"
                          : "bg-rose-50 border-rose-200"
                      : "bg-white border-gray-200 shadow-md"
                  }`}>
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl mb-4 ${
                      shadowFeedback
                        ? shadowFeedback.tone === "emerald"
                          ? "bg-emerald-500 text-white"
                          : shadowFeedback.tone === "amber"
                            ? "bg-amber-400 text-white"
                            : "bg-rose-400 text-white"
                        : "bg-gray-200 text-gray-500"
                    }`}>1</div>
                    <h3 className="text-2xl font-extrabold text-gray-700 mb-6">先跟读</h3>
                    
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
                    <p className="mt-4 text-gray-400 font-bold">
                      {isRecording ? "再点一次结束录音" : hasShadowAttempt ? "可以重新录一次，争取更高分" : "点击开始录音"}
                    </p>
                    <p className="mt-3 text-sm font-bold text-gray-500">
                      {hasShadowAttempt ? "跟读完成，可以去右侧选意思。" : "跟读结果会以弹窗形式提示。"}
                    </p>
                  </div>

                  {/* Step 2: Choose Meaning */}
                  <div className={`flex-1 flex flex-col items-center p-8 rounded-[30px] border-[6px] transition-all ${
                    hasShadowAttempt ? 'bg-white border-blue-200 shadow-md' : 'bg-gray-50 border-gray-200'
                  }`}>
                    <div className={`w-12 h-12 flex items-center justify-center rounded-full font-bold text-xl mb-4 ${
                      hasShadowAttempt ? "bg-blue-500 text-white" : "bg-blue-100 text-blue-500"
                    }`}>2</div>
                    <h3 className="text-2xl font-extrabold text-gray-700 mb-6">选意思</h3>
                    <p className={`mb-5 text-sm font-bold ${hasShadowAttempt ? "text-blue-500" : "text-gray-400"}`}>
                      {hasShadowAttempt ? "现在可以点击答案了" : "先完成左侧跟读，这里就会解锁"}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-4 w-full">
                      {quizOptions.map((opt, i) => (
                        <motion.button
                          key={i}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleQuizChoice(opt)}
                          disabled={!hasShadowAttempt}
                          className={`border-[3px] font-extrabold text-xl py-4 rounded-2xl transition-colors shadow-sm ${
                            hasShadowAttempt
                              ? "bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700 cursor-pointer"
                              : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                          }`}
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
    className={`${color} text-white flex h-[96px] w-[112px] flex-col items-center justify-center rounded-3xl border-b-[6px] active:translate-y-1.5 active:border-b-0 shadow-md transition-all`}
  >
    <div className="mb-2">{icon}</div>
    <span className="font-extrabold">{text}</span>
  </motion.button>
);

const WordNavButton = ({ direction, icon, label, onClick }: any) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.97 }}
    onClick={onClick}
    className="flex items-center justify-center gap-1 rounded-full px-2 py-1 text-sm font-bold text-gray-400 transition-colors hover:bg-white/80 hover:text-sky-600"
    aria-label={label}
  >
    {direction === "previous" ? (
      <>
        <span className="text-sky-400">{icon}</span>
        <span>{label}</span>
      </>
    ) : (
      <>
        <span>{label}</span>
        <span className="text-sky-400">{icon}</span>
      </>
    )}
  </motion.button>
);
