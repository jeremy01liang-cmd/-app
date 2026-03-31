import React, { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";

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

export const GameProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<GameState>({
    stars: 100,
    waterLeft: 3,
    fertilizers: 0,
    worms: 0,
    corns: 0,
    catchWormLeft: 1,
    treeLevel: 1,
    treeProgress: 0,
    chickenSkin: "default",
    cards: [],
    learnedWords: [],
  });

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
    if (state.stars >= 5) {
      setState((prev) => ({
        ...prev,
        stars: prev.stars - 5,
        fertilizers: prev.fertilizers + 1,
      }));
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
    if (state.stars >= 5) {
      setState((prev) => ({ ...prev, stars: prev.stars - 5, worms: prev.worms + 1 }));
      toast.success("购买了一条虫子！🐛");
    } else {
      toast.error("星星不足！");
    }
  };

  const buyCorn = () => {
    if (state.stars >= 5) {
      setState((prev) => ({ ...prev, stars: prev.stars - 5, corns: prev.corns + 1 }));
      toast.success("购买了一份玉米！🌽");
    } else {
      toast.error("星星不足！");
    }
  };

  const catchWorm = () => {
    if (state.catchWormLeft > 0) {
      setState((prev) => ({
        ...prev,
        catchWormLeft: prev.catchWormLeft - 1,
        worms: prev.worms + 1,
      }));
      toast.success("成功捉到一条大胖虫子！🐛");
    } else {
      toast.error("今天已经捉过虫子啦，小鸡让你明天再捉！");
    }
  };

  const catchCrawlingWorm = () => {
    setState((prev) => ({
      ...prev,
      worms: prev.worms + 1,
    }));
    toast.success("抓到地上的一只小虫子！🐛");
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
    if (state.stars >= 20) {
      const newCardId = Math.floor(Math.random() * 100);
      setState((prev) => ({
        ...prev,
        stars: prev.stars - 20,
        cards: [...prev.cards, { id: newCardId, name: `神秘卡牌 #${newCardId}` }],
      }));
      toast.success("哇！抽到了一张新卡片！🃏");
    } else {
      toast.error("星星不足20颗，无法抽卡哦！");
    }
  };

  return (
    <GameContext.Provider
      value={{
        ...state,
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
