import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router";
import { AnimatePresence, motion } from "motion/react";
import { ArrowLeft, Calculator, Delete, Trophy } from "lucide-react";

type QuestionKind = "normal" | "gold" | "time";
type RaceMode = "ready" | "playing" | "result";

interface Question {
  id: number;
  expression: string;
  answer: number;
  kind: QuestionKind;
}

interface AnswerFeedback {
  id: number;
  tone: "good" | "bad";
  title: string;
  detail: string;
  enteredAnswer?: number;
}

interface ComboPopup {
  id: number;
  streak: number;
  bonus: number;
}

const ROUND_TIME_MS = 60_000;
const TIME_BONUS_MS = 3_000;
const RECORD_STORAGE_KEY = "oral-math-race-best-score";
const COMBO_BONUSES: Record<number, number> = {
  3: 15,
  5: 20,
  10: 30,
};

const KEYPAD_KEYS: Array<number | "clear" | "back"> = [1, 2, 3, 4, 5, 6, 7, 8, 9, "clear", 0, "back"];

const createQuestion = (id: number): Question => {
  const operatorPool = ["+", "+", "-", "-", "x"] as const;
  const operator = operatorPool[Math.floor(Math.random() * operatorPool.length)];

  let left = 0;
  let right = 0;
  let answer = 0;

  if (operator === "+") {
    left = Math.floor(Math.random() * 20) + 8;
    right = Math.floor(Math.random() * 20) + 1;
    answer = left + right;
  } else if (operator === "-") {
    left = Math.floor(Math.random() * 25) + 12;
    right = Math.floor(Math.random() * Math.max(1, left - 1)) + 1;
    answer = left - right;
  } else {
    left = Math.floor(Math.random() * 8) + 2;
    right = Math.floor(Math.random() * 8) + 2;
    answer = left * right;
  }

  const specialRoll = Math.random();
  const kind: QuestionKind =
    specialRoll < 0.1 ? "gold" : specialRoll < 0.22 ? "time" : "normal";

  return {
    id,
    expression: `${left} ${operator} ${right}`,
    answer,
    kind,
  };
};

const getKindBadge = (kind: QuestionKind) => {
  if (kind === "gold") {
    return {
      label: "金色题",
      hint: "+50分",
      className: "border-yellow-300 bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-100 text-amber-900",
    };
  }

  if (kind === "time") {
    return {
      label: "时间题",
      hint: "+3秒",
      className: "border-cyan-300 bg-gradient-to-r from-cyan-200 via-sky-100 to-cyan-50 text-cyan-900",
    };
  }

  return {
    label: "普通题",
    hint: "+10分",
    className: "border-orange-200 bg-white/80 text-orange-700",
  };
};

const loadBestScore = () => {
  if (typeof window === "undefined") {
    return 0;
  }

  const raw = window.localStorage.getItem(RECORD_STORAGE_KEY);
  const parsed = raw ? Number(raw) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
};

const getAnswerLength = (answer: number) => String(answer).length;

export const OralMathRace: React.FC = () => {
  const nextQuestionTimerRef = useRef<number | null>(null);
  const modeRef = useRef<RaceMode>("ready");

  const [mode, setMode] = useState<RaceMode>("ready");
  const [question, setQuestion] = useState<Question>(() => createQuestion(1));
  const [score, setScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [remainingMs, setRemainingMs] = useState(ROUND_TIME_MS);
  const [bestScore, setBestScore] = useState(loadBestScore);
  const [isRecordBroken, setIsRecordBroken] = useState(false);
  const [currentInput, setCurrentInput] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState<AnswerFeedback | null>(null);
  const [comboPopup, setComboPopup] = useState<ComboPopup | null>(null);

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    if (mode !== "playing" || endTime === null) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      const nextRemainingMs = Math.max(0, endTime - Date.now());
      setRemainingMs(nextRemainingMs);

      if (nextRemainingMs <= 0) {
        window.clearInterval(timer);
        setMode("result");
      }
    }, 100);

    return () => window.clearInterval(timer);
  }, [endTime, mode]);

  useEffect(() => {
    if (!answerFeedback) {
      return undefined;
    }

    const timer = window.setTimeout(() => setAnswerFeedback(null), 1000);
    return () => window.clearTimeout(timer);
  }, [answerFeedback]);

  useEffect(() => {
    if (!comboPopup) {
      return undefined;
    }

    const timer = window.setTimeout(() => setComboPopup(null), 900);
    return () => window.clearTimeout(timer);
  }, [comboPopup]);

  useEffect(() => {
    if (mode !== "result") {
      return;
    }

    const recordBroken = score > bestScore;
    setIsRecordBroken(recordBroken);

    if (recordBroken && typeof window !== "undefined") {
      window.localStorage.setItem(RECORD_STORAGE_KEY, String(score));
      setBestScore(score);
    }
  }, [bestScore, mode, score]);

  useEffect(() => {
    return () => {
      if (nextQuestionTimerRef.current !== null) {
        window.clearTimeout(nextQuestionTimerRef.current);
      }
    };
  }, []);

  const secondsLeft = useMemo(() => Math.max(0, Math.ceil(remainingMs / 1000)), [remainingMs]);
  const badge = getKindBadge(question.kind);

  const moveToNextQuestion = () => {
    if (nextQuestionTimerRef.current !== null) {
      window.clearTimeout(nextQuestionTimerRef.current);
    }

    nextQuestionTimerRef.current = window.setTimeout(() => {
      if (modeRef.current !== "playing") {
        return;
      }

      setCurrentInput("");
      setIsLocked(false);
      setAnswerFeedback(null);
      setQuestion(createQuestion(Date.now()));
    }, 900);
  };

  const resolveAnswer = (enteredAnswer: number) => {
    if (modeRef.current !== "playing" || isLocked) {
      return;
    }

    setIsLocked(true);

    if (enteredAnswer === question.answer) {
      const nextStreak = streak + 1;
      const comboBonus = COMBO_BONUSES[nextStreak] ?? 0;
      const goldBonus = question.kind === "gold" ? 50 : 0;
      const totalGain = 10 + comboBonus + goldBonus;

      setScore((prev) => prev + totalGain);
      setCorrectCount((prev) => prev + 1);
      setStreak(nextStreak);
      setMaxStreak((prev) => Math.max(prev, nextStreak));

      if (question.kind === "time") {
        setEndTime((prev) => (prev === null ? prev : prev + TIME_BONUS_MS));
        setRemainingMs((prev) => prev + TIME_BONUS_MS);
      }

      if (nextStreak >= 2) {
        setComboPopup({
          id: Date.now(),
          streak: nextStreak,
          bonus: comboBonus,
        });
      }

      const extraRewards = [
        comboBonus > 0 ? `连击 +${comboBonus}` : "",
        goldBonus > 0 ? "金色题 +50" : "",
        question.kind === "time" ? "+3秒" : "",
      ].filter(Boolean);

      setAnswerFeedback({
        id: Date.now(),
        tone: "good",
        title: `回答正确 +${totalGain}`,
        detail: extraRewards.length > 0 ? extraRewards.join("  ·  ") : "继续保持",
        enteredAnswer,
      });
    } else {
      setStreak(0);
      setAnswerFeedback({
        id: Date.now(),
        tone: "bad",
        title: "回答错误",
        detail: `你输入的是 ${enteredAnswer}，正确答案是 ${question.answer}`,
        enteredAnswer,
      });
    }

    moveToNextQuestion();
  };

  const handleDigitClick = (digit: number) => {
    if (mode !== "playing" || isLocked) {
      return;
    }

    const nextInput = currentInput === "0" ? String(digit) : `${currentInput}${digit}`;
    setCurrentInput(nextInput);

    const answerText = String(question.answer);
    if (nextInput === answerText) {
      resolveAnswer(Number(nextInput));
      return;
    }

    if (nextInput.length >= getAnswerLength(question.answer)) {
      resolveAnswer(Number(nextInput));
    }
  };

  const handleBackspace = () => {
    if (mode !== "playing" || isLocked || currentInput.length === 0) {
      return;
    }

    setCurrentInput((prev) => prev.slice(0, -1));
  };

  const handleClear = () => {
    if (mode !== "playing" || isLocked) {
      return;
    }

    setCurrentInput("");
  };

  const startGame = () => {
    if (nextQuestionTimerRef.current !== null) {
      window.clearTimeout(nextQuestionTimerRef.current);
      nextQuestionTimerRef.current = null;
    }

    setMode("playing");
    setQuestion(createQuestion(Date.now()));
    setScore(0);
    setCorrectCount(0);
    setStreak(0);
    setMaxStreak(0);
    setIsRecordBroken(false);
    setCurrentInput("");
    setIsLocked(false);
    setAnswerFeedback(null);
    setComboPopup(null);
    setRemainingMs(ROUND_TIME_MS);
    setEndTime(Date.now() + ROUND_TIME_MS);
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[#fff6ea] p-4">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.28),transparent_42%),radial-gradient(circle_at_bottom_right,_rgba(251,146,60,0.22),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.4),rgba(255,247,237,0.95))]" />

      <header className="z-10 mb-4 flex w-full items-center justify-between rounded-3xl bg-white/75 px-4 py-3 shadow-sm backdrop-blur-md">
        <Link to="/learning">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.96 }}
            className="flex cursor-pointer items-center gap-2 rounded-full bg-stone-100 px-4 py-2.5 text-base font-bold text-stone-700 shadow-sm transition-colors hover:bg-stone-200"
          >
            <ArrowLeft className="h-6 w-6" />
            返回课程
          </motion.button>
        </Link>
        <h1 className="flex items-center gap-3 text-2xl font-extrabold text-orange-600">
          <Calculator className="h-7 w-7" />
          口算竞赛
        </h1>
        <div className="flex min-w-[144px] items-center justify-end gap-2 rounded-full border-4 border-yellow-300 bg-yellow-100 px-4 py-2 shadow-sm">
          <Trophy className="h-6 w-6 text-yellow-600" />
          <span className="text-lg font-extrabold text-yellow-800">纪录 {bestScore}</span>
        </div>
      </header>

      <main className="relative z-10 flex min-h-0 flex-1 justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          {mode === "ready" && (
            <motion.section
              key="ready"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              className="flex h-full w-full max-w-4xl flex-col items-center justify-center rounded-[40px] border-4 border-orange-200 bg-white/80 px-8 py-10 text-center shadow-[0_24px_80px_rgba(251,146,60,0.18)]"
            >
              <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-[linear-gradient(135deg,#fb923c_0%,#facc15_100%)] text-white shadow-lg">
                <Calculator className="h-12 w-12" />
              </div>
              <div className="mt-6">
                <h2 className="text-4xl font-extrabold text-orange-600">口算竞赛</h2>
                <p className="mt-2 text-xl font-bold text-stone-500">准备开始</p>
              </div>

              <div className="mt-6 rounded-full border-4 border-yellow-200 bg-yellow-50 px-7 py-3 text-xl font-extrabold text-yellow-800 shadow-sm">
                最高纪录 {bestScore}
              </div>

              <div className="mt-8 flex justify-center">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={startGame}
                  className="rounded-full border-b-[10px] border-orange-700 bg-orange-500 px-12 py-5 text-2xl font-extrabold text-white shadow-[0_16px_32px_rgba(249,115,22,0.35)] transition-all hover:bg-orange-400 active:translate-y-[6px] active:border-b-[4px]"
                >
                  开始竞赛
                </motion.button>
              </div>
            </motion.section>
          )}

          {mode === "playing" && (
            <motion.section
              key="playing"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              className="flex h-full w-full max-w-5xl flex-col"
            >
              <div
                className={`relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[40px] border-4 bg-white/85 px-5 py-5 shadow-[0_20px_60px_rgba(251,146,60,0.14)] transition-colors ${
                  answerFeedback?.tone === "good"
                    ? "border-emerald-300"
                    : answerFeedback?.tone === "bad"
                      ? "border-rose-300"
                      : "border-orange-200"
                }`}
              >
                <div className="mb-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="rounded-[20px] border-4 border-rose-200 bg-rose-50 px-4 py-2.5 shadow-sm">
                      <p className="text-sm font-bold text-stone-500">得分</p>
                      <p className="mt-1 text-3xl font-extrabold text-rose-500">{score}</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-end gap-3">
                      <div className={`rounded-full border-2 px-4 py-2 text-base font-extrabold shadow-sm ${badge.className}`}>
                        {badge.label} · {badge.hint}
                      </div>
                      <div className="rounded-full border-2 border-amber-200 bg-amber-50 px-4 py-2 text-xl font-extrabold text-amber-500 shadow-sm">
                        {secondsLeft}s
                      </div>
                    </div>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-orange-100">
                    <motion.div
                      className="h-full bg-[linear-gradient(90deg,#fb923c_0%,#facc15_100%)]"
                      animate={{ width: `${Math.max(0, Math.min(100, (remainingMs / ROUND_TIME_MS) * 100))}%` }}
                      transition={{ ease: "linear", duration: 0.1 }}
                    />
                  </div>
                </div>

                <div className="flex flex-1 flex-col">
                  <div className="flex flex-1 flex-col items-center justify-center text-center">
                    <div className="text-6xl font-extrabold tracking-wide text-stone-800 md:text-7xl">
                      {question.expression} = ?
                    </div>

                    <div className="mt-5 flex h-18 min-w-[180px] items-center justify-center rounded-[24px] border-4 border-stone-200 bg-stone-50 px-6 text-4xl font-extrabold text-stone-700 shadow-sm">
                      {currentInput || "?"}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {KEYPAD_KEYS.map((key) => {
                      if (key === "clear") {
                        return (
                          <motion.button
                            key={key}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleClear}
                            disabled={isLocked}
                            className="rounded-[24px] border-b-[8px] border-cyan-700 bg-cyan-500 px-4 py-4 text-xl font-extrabold text-white shadow-lg transition-all hover:bg-cyan-400 active:translate-y-[5px] active:border-b-[3px] disabled:cursor-not-allowed disabled:border-b-[3px] disabled:bg-stone-300"
                          >
                            清空
                          </motion.button>
                        );
                      }

                      if (key === "back") {
                        return (
                          <motion.button
                            key={key}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.97 }}
                            onClick={handleBackspace}
                            disabled={isLocked}
                            className="flex items-center justify-center rounded-[24px] border-b-[8px] border-amber-700 bg-amber-500 px-4 py-4 text-xl font-extrabold text-white shadow-lg transition-all hover:bg-amber-400 active:translate-y-[5px] active:border-b-[3px] disabled:cursor-not-allowed disabled:border-b-[3px] disabled:bg-stone-300"
                          >
                            <Delete className="h-7 w-7" />
                          </motion.button>
                        );
                      }

                      return (
                        <motion.button
                          key={key}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleDigitClick(key)}
                          disabled={isLocked}
                          className="rounded-[24px] border-b-[8px] border-orange-300 bg-gradient-to-br from-orange-100 to-white px-4 py-4 text-3xl font-extrabold text-stone-800 shadow-md transition-all hover:border-orange-400 hover:from-orange-200 active:translate-y-[5px] active:border-b-[3px] disabled:cursor-not-allowed disabled:border-b-[3px] disabled:bg-stone-200"
                        >
                          {key}
                        </motion.button>
                      );
                    })}
                  </div>

                  <AnimatePresence>
                    {answerFeedback && (
                      <motion.div
                        key={answerFeedback.id}
                        initial={{ opacity: 0, y: 14, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.97 }}
                        className={`mt-3 rounded-[24px] px-5 py-3 text-center shadow-sm ${
                          answerFeedback.tone === "good"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-rose-100 text-rose-700"
                        }`}
                      >
                        <p className="text-2xl font-extrabold">{answerFeedback.title}</p>
                        <p className="mt-1 text-base font-bold opacity-95">{answerFeedback.detail}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.section>
          )}

          {mode === "result" && (
            <motion.section
              key="result"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -24 }}
              className="flex h-full w-full max-w-4xl flex-col items-center justify-center rounded-[40px] border-4 border-orange-200 bg-white/85 p-6 shadow-[0_24px_80px_rgba(251,146,60,0.18)]"
            >
              <div className="mb-6 text-center">
                <p className="text-base font-extrabold uppercase tracking-[0.35em] text-orange-300">Finished</p>
                <h2 className="mt-3 text-4xl font-extrabold text-orange-600">竞赛结束</h2>
              </div>

              <div className="grid w-full gap-4 md:grid-cols-2">
                <div className="rounded-[24px] border-4 border-orange-200 bg-orange-50 p-5 text-center">
                  <p className="text-base font-bold text-stone-500">答对题数</p>
                  <p className="mt-2 text-4xl font-extrabold text-orange-600">{correctCount}</p>
                </div>
                <div className="rounded-[24px] border-4 border-rose-200 bg-rose-50 p-5 text-center">
                  <p className="text-base font-bold text-stone-500">最高连击</p>
                  <p className="mt-2 text-4xl font-extrabold text-rose-500">{maxStreak}</p>
                </div>
                <div className="rounded-[24px] border-4 border-yellow-200 bg-yellow-50 p-5 text-center">
                  <p className="text-base font-bold text-stone-500">总分</p>
                  <p className="mt-2 text-4xl font-extrabold text-amber-500">{score}</p>
                </div>
                <div className="rounded-[24px] border-4 border-cyan-200 bg-cyan-50 p-5 text-center">
                  <p className="text-base font-bold text-stone-500">是否破纪录</p>
                  <p className="mt-2 text-4xl font-extrabold text-cyan-600">{isRecordBroken ? "是" : "否"}</p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={startGame}
                className="mt-8 rounded-full border-b-[10px] border-orange-700 bg-orange-500 px-14 py-5 text-2xl font-extrabold text-white shadow-[0_16px_32px_rgba(249,115,22,0.35)] transition-all hover:bg-orange-400 active:translate-y-[6px] active:border-b-[4px]"
              >
                再来一次
              </motion.button>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {mode === "playing" && comboPopup && (
          <motion.div
            key={comboPopup.id}
            initial={{ opacity: 0, y: 18, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.96 }}
            className="pointer-events-none absolute left-1/2 top-24 z-30 -translate-x-1/2 rounded-full border-4 border-orange-300 bg-[linear-gradient(135deg,#fb923c_0%,#facc15_100%)] px-7 py-3 text-center text-white shadow-[0_18px_36px_rgba(251,146,60,0.32)]"
          >
            <p className="text-2xl font-extrabold">🔥 {comboPopup.streak} 连击</p>
            <p className="mt-1 text-base font-bold">{comboPopup.bonus > 0 ? `连击奖励 +${comboPopup.bonus}` : "继续保持"}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
