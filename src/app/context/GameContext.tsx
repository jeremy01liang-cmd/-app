import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "sonner";

const DAILY_CRAWLING_WORM_LIMIT = 3;
const GAME_STATE_STORAGE_KEY = "codex-learning-home-state";

interface GameState {
  stars: number;
  waterLeft: number;
  fertilizers: number;
  worms: number;
  corns: number;
  catchWormLeft: number;
  treeLevel: number;
  treeProgress: number; // 0 to 100
  chickenSkin: string; // 'default' | 'pony'
  cards: any[];
  learnedWords: string[];
}

interface StoredGameState extends GameState {
  lastCatchResetDate: string;
}

interface GameContextType extends GameState {
  waterTree: () => void;
  buyFertilizer: () => void;
  useFertilizer: () => void;
  buyWorm: () => void;
  buyCorn: () => void;
  catchWorm: () => void;
  catchCrawlingWorm: () => void;
  feedWorm: () => void;
  feedCorn: () => void;
  changeSkin: (skin: string) => void;
  drawCard: () => void;
  addStars: (amount: number) => void;
  addLearnedWord: (word: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

const getTodayKey = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const createDefaultState = (): StoredGameState => ({
  stars: 100,
  waterLeft: 3,
  fertilizers: 0,
  worms: 0,
  corns: 0,
  catchWormLeft: DAILY_CRAWLING_WORM_LIMIT,
  treeLevel: 1,
  treeProgress: 0,
  chickenSkin: "default",
  cards: [],
  learnedWords: [],
  lastCatchResetDate: getTodayKey(),
});

const refreshDailyCatchLimit = (state: StoredGameState): StoredGameState => {
  const today = getTodayKey();
  if (state.lastCatchResetDate === today) {
    return state;
  }

  return {
    ...state,
    catchWormLeft: DAILY_CRAWLING_WORM_LIMIT,
    lastCatchResetDate: today,
  };
};

const loadStoredState = (): StoredGameState => {
  if (typeof window === "undefined") {
    return createDefaultState();
  }

  try {
    const raw = window.localStorage.getItem(GAME_STATE_STORAGE_KEY);
    if (!raw) {
      return createDefaultState();
    }

    const parsed = JSON.parse(raw) as Partial<StoredGameState>;
    return refreshDailyCatchLimit({
      ...createDefaultState(),
      ...parsed,
      lastCatchResetDate: typeof parsed.lastCatchResetDate === "string" ? parsed.lastCatchResetDate : getTodayKey(),
    });
  } catch {
    return createDefaultState();
  }
};

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<StoredGameState>(loadStoredState);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(GAME_STATE_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addStars = (amount: number) => {
    setState((prev) => ({ ...prev, stars: prev.stars + amount }));
  };

  const addLearnedWord = (word: string) => {
    setState((prev) => {
      if (!prev.learnedWords.includes(word)) {
        return { ...prev, learnedWords: [...prev.learnedWords, word] };
      }
      return prev;
    });
  };

  const increaseTreeProgress = (amount: number) => {
    setState((prev) => {
      let newProgress = prev.treeProgress + amount;
      let newLevel = prev.treeLevel;
      if (newProgress >= 100) {
        newLevel += 1;
        newProgress = newProgress - 100;
        toast.success(`恭喜！成长树升到 ${newLevel} 级啦！🎉`);
      }
      return { ...prev, treeProgress: newProgress, treeLevel: newLevel };
    });
  };

  const waterTree = () => {
    if (state.waterLeft > 0) {
      setState((prev) => ({ ...prev, waterLeft: prev.waterLeft - 1 }));
      increaseTreeProgress(20);
      toast.success("浇水成功！小树长高了一点~ 💧");
    } else {
      toast.error("今天浇水次数用光啦，明天再来吧！");
    }
  };

  const buyFertilizer = () => {
    let purchased = false;

    setState((prev) => {
      if (prev.stars < 5) {
        return prev;
      }

      purchased = true;
      return {
        ...prev,
        stars: prev.stars - 5,
        fertilizers: prev.fertilizers + 1,
      };
    });

    if (purchased) {
      toast.success("成功购买了一包化肥！🌱");
    } else {
      toast.error("星星不足哦，快去完成任务赚星星吧！");
    }
  };

  const useFertilizer = () => {
    if (state.fertilizers > 0) {
      setState((prev) => ({ ...prev, fertilizers: prev.fertilizers - 1 }));
      increaseTreeProgress(40);
      toast.success("施肥成功！小树长高了好多~ 🌿");
    } else {
      toast.error("你还没有化肥，快去用星星买一些吧！");
    }
  };

  const buyWorm = () => {
    let purchased = false;

    setState((prev) => {
      if (prev.stars < 5) {
        return prev;
      }

      purchased = true;
      return { ...prev, stars: prev.stars - 5, worms: prev.worms + 1 };
    });

    if (purchased) {
      toast.success("购买了一条虫子！🐛");
    } else {
      toast.error("星星不足！");
    }
  };

  const buyCorn = () => {
    let purchased = false;

    setState((prev) => {
      if (prev.stars < 5) {
        return prev;
      }

      purchased = true;
      return { ...prev, stars: prev.stars - 5, corns: prev.corns + 1 };
    });

    if (purchased) {
      toast.success("购买了一份玉米！🌽");
    } else {
      toast.error("星星不足！");
    }
  };

  const catchWorm = () => {
    let caught = false;

    setState((prev) => {
      const nextState = refreshDailyCatchLimit(prev);
      if (nextState.catchWormLeft <= 0) {
        return nextState;
      }

      caught = true;
      return {
        ...nextState,
        catchWormLeft: nextState.catchWormLeft - 1,
        worms: nextState.worms + 1,
      };
    });

    if (caught) {
      toast.success("成功捉到一条大胖虫子！🐛");
    } else {
      toast.error("今天只能抓 3 条虫子，明天再来吧！");
    }
  };

  const catchCrawlingWorm = () => {
    let caught = false;

    setState((prev) => {
      const nextState = refreshDailyCatchLimit(prev);
      if (nextState.catchWormLeft <= 0) {
        return nextState;
      }

      caught = true;
      return {
        ...nextState,
        catchWormLeft: nextState.catchWormLeft - 1,
        worms: nextState.worms + 1,
      };
    });

    if (caught) {
      toast.success("抓到地上的一只小虫子！🐛");
    } else {
      toast.error("今天只能抓 3 条虫子，明天再来吧！");
    }
  };

  const feedWorm = () => {
    if (state.worms > 0) {
      setState((prev) => ({ ...prev, worms: prev.worms - 1 }));
      toast.success("小鸡吃了一条虫子，开心地转圈圈！🐥");
    } else {
      toast.error("没有虫子啦，快去商店买或者去捉虫子！");
    }
  };

  const feedCorn = () => {
    if (state.corns > 0) {
      setState((prev) => ({ ...prev, corns: prev.corns - 1 }));
      toast.success("小鸡吃了一份玉米，感觉很满足！🌽🐥");
    } else {
      toast.error("没有玉米啦，快去用星星买一些吧！");
    }
  };

  const changeSkin = (skin: string) => {
    setState((prev) => ({ ...prev, chickenSkin: skin }));
    toast.success(skin === "pony" ? "换上了小马宝莉的新装扮！🦄" : "换回了经典的装扮！🐥");
  };

  const drawCard = () => {
    let drewCard = false;

    setState((prev) => {
      if (prev.stars < 20) {
        return prev;
      }

      const newCardId = Math.floor(Math.random() * 100);
      drewCard = true;
      return {
        ...prev,
        stars: prev.stars - 20,
        cards: [...prev.cards, { id: newCardId, name: `神秘卡牌 #${newCardId}` }],
      };
    });

    if (drewCard) {
      toast.success("哇！抽到了一张新卡片！🃏");
    } else {
      toast.error("星星不足20颗，无法抽卡哦！");
    }
  };

  return (
    <GameContext.Provider
      value={{
        stars: state.stars,
        waterLeft: state.waterLeft,
        fertilizers: state.fertilizers,
        worms: state.worms,
        corns: state.corns,
        catchWormLeft: state.catchWormLeft,
        treeLevel: state.treeLevel,
        treeProgress: state.treeProgress,
        chickenSkin: state.chickenSkin,
        cards: state.cards,
        learnedWords: state.learnedWords,
        waterTree,
        buyFertilizer,
        useFertilizer,
        buyWorm,
        buyCorn,
        catchWorm,
        catchCrawlingWorm,
        feedWorm,
        feedCorn,
        changeSkin,
        drawCard,
        addStars,
        addLearnedWord,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
};
