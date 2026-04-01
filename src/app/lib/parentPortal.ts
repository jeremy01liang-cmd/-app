import type { AccountProfile } from "./accountStore";

declare const __APP_LAN_ORIGIN__: string;

export type GradeKey =
  | "kindergarten"
  | "grade1"
  | "grade2"
  | "grade3"
  | "grade4"
  | "grade5"
  | "grade6";

export interface GradeOption {
  value: GradeKey;
  label: string;
  stage: string;
}

export interface CourseDifficultyRecommendation {
  overallLabel: string;
  summary: string;
  parentAdvice: string;
  wordLearning: {
    label: string;
    description: string;
  };
  oralMath: {
    label: string;
    description: string;
    addMax: number;
    subtractMax: number;
    multiplyMax: number;
    operatorPool: Array<"+" | "-" | "x">;
  };
}

interface ParentPortalTokenPayload {
  v: 2;
  accountId: string;
  createdAt: string;
}

export const GRADE_OPTIONS: GradeOption[] = [
  { value: "kindergarten", label: "幼儿园大班", stage: "启蒙阶段" },
  { value: "grade1", label: "一年级", stage: "基础起步" },
  { value: "grade2", label: "二年级", stage: "巩固进阶" },
  { value: "grade3", label: "三年级", stage: "能力提升" },
  { value: "grade4", label: "四年级", stage: "稳定提升" },
  { value: "grade5", label: "五年级", stage: "综合挑战" },
  { value: "grade6", label: "六年级", stage: "冲刺衔接" },
];

const RECOMMENDATIONS_BY_GRADE: Record<GradeKey, CourseDifficultyRecommendation> = {
  kindergarten: {
    overallLabel: "启蒙难度",
    summary: "更适合用轻任务建立兴趣和自信。",
    parentAdvice: "建议每次学习 10 分钟左右，优先保证孩子愿意开口和愿意继续学。",
    wordLearning: {
      label: "启蒙词汇",
      description: "先从动物、水果、颜色这些高频主题词开始，重在看图识词和模仿发音。",
    },
    oralMath: {
      label: "10 以内加法",
      description: "只出简单加法题，帮助孩子建立数字感。",
      addMax: 10,
      subtractMax: 0,
      multiplyMax: 0,
      operatorPool: ["+"],
    },
  },
  grade1: {
    overallLabel: "基础难度",
    summary: "以熟悉规则、建立节奏感为主。",
    parentAdvice: "建议先做基础题，稳定正确率后再逐步提高速度。",
    wordLearning: {
      label: "基础主题词",
      description: "适合围绕生活场景积累词汇，做到看到图片能快速说出英文。",
    },
    oralMath: {
      label: "20 以内加减",
      description: "重点练习 20 以内加减法，兼顾速度与准确率。",
      addMax: 20,
      subtractMax: 20,
      multiplyMax: 0,
      operatorPool: ["+", "+", "-"],
    },
  },
  grade2: {
    overallLabel: "进阶难度",
    summary: "开始从基础正确过渡到稳定提速。",
    parentAdvice: "建议每天保持短频快练习，让孩子先稳住正确率，再追求连击。",
    wordLearning: {
      label: "高频拓展词",
      description: "可以加入更多高频词和简单分类，慢慢提升识记范围。",
    },
    oralMath: {
      label: "100 以内加减",
      description: "系统会偏向 100 以内加减法，练习心算速度。",
      addMax: 100,
      subtractMax: 100,
      multiplyMax: 0,
      operatorPool: ["+", "+", "-", "-"],
    },
  },
  grade3: {
    overallLabel: "提升难度",
    summary: "逐步加入乘法，训练运算切换能力。",
    parentAdvice: "建议让孩子交替练习口算和单词，保持学习的新鲜感。",
    wordLearning: {
      label: "场景词汇",
      description: "适合在主题词基础上增加场景表达，帮助孩子理解词与词之间的关系。",
    },
    oralMath: {
      label: "乘法入门",
      description: "会出现 100 以内加减和乘法基础题，适合三年级过渡。",
      addMax: 100,
      subtractMax: 100,
      multiplyMax: 9,
      operatorPool: ["+", "-", "x"],
    },
  },
  grade4: {
    overallLabel: "巩固难度",
    summary: "强化多类型题目切换，提升熟练度。",
    parentAdvice: "可以适当鼓励孩子挑战更高分数，但优先保证计算过程清晰。",
    wordLearning: {
      label: "拓展词汇",
      description: "适合增加更细分的主题和更有层次的词汇复习。",
    },
    oralMath: {
      label: "乘除前置难度",
      description: "加减和乘法会更均衡，题目跨度也会更大。",
      addMax: 200,
      subtractMax: 200,
      multiplyMax: 12,
      operatorPool: ["+", "-", "x", "x"],
    },
  },
  grade5: {
    overallLabel: "挑战难度",
    summary: "更强调稳定速度和复杂度并行。",
    parentAdvice: "建议结合孩子当下薄弱点安排学习，避免长期只刷同一类题型。",
    wordLearning: {
      label: "综合词汇",
      description: "可以尝试更高频的学科词和场景词，增强理解与记忆联动。",
    },
    oralMath: {
      label: "高阶口算",
      description: "题目会加入更大的数值范围和更密集的乘法练习。",
      addMax: 500,
      subtractMax: 500,
      multiplyMax: 12,
      operatorPool: ["+", "-", "x", "x"],
    },
  },
  grade6: {
    overallLabel: "冲刺难度",
    summary: "适合做升学前的熟练度冲刺。",
    parentAdvice: "建议把练习拆成更短的小段，优先保持专注和节奏感。",
    wordLearning: {
      label: "表达拓展",
      description: "可继续在高频词基础上做表达延展，帮助孩子更自然地输出。",
    },
    oralMath: {
      label: "综合冲刺",
      description: "会更多出现跨度较大的口算题，强化反应速度。",
      addMax: 1000,
      subtractMax: 1000,
      multiplyMax: 12,
      operatorPool: ["+", "-", "x", "x", "x"],
    },
  },
};

function encodeBase64Url(raw: string) {
  const bytes = new TextEncoder().encode(raw);
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function decodeBase64Url(raw: string) {
  const normalized = raw.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  const binary = atob(`${normalized}${padding}`);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function getGradeOption(grade: GradeKey | null | undefined) {
  if (!grade) {
    return null;
  }

  return GRADE_OPTIONS.find((option) => option.value === grade) ?? null;
}

export function getCourseRecommendation(grade: GradeKey | null | undefined) {
  if (!grade) {
    return null;
  }

  return RECOMMENDATIONS_BY_GRADE[grade] ?? null;
}

export function createParentPortalToken(account: AccountProfile) {
  return encodeBase64Url(
    JSON.stringify({
      v: 2,
      accountId: account.accountId,
      createdAt: account.createdAt,
    } satisfies ParentPortalTokenPayload),
  );
}

export function parseParentPortalToken(token: string | null) {
  if (!token) {
    return null;
  }

  try {
    const payload = JSON.parse(decodeBase64Url(token)) as Partial<ParentPortalTokenPayload>;
    if (payload.v !== 2 || typeof payload.accountId !== "string" || typeof payload.createdAt !== "string") {
      return null;
    }

    return payload as ParentPortalTokenPayload;
  } catch {
    return null;
  }
}

export function buildParentPortalUrl(origin: string, account: AccountProfile) {
  const publicOrigin = import.meta.env.VITE_PARENT_PORTAL_PUBLIC_ORIGIN?.trim().replace(/\/$/, "");
  const currentOrigin = origin.replace(/\/$/, "");
  const currentUrl = new URL(currentOrigin);
  const isLocalOnlyHost = ["localhost", "127.0.0.1", "0.0.0.0"].includes(currentUrl.hostname);
  const resolvedOrigin = publicOrigin || (isLocalOnlyHost && __APP_LAN_ORIGIN__ ? __APP_LAN_ORIGIN__ : currentOrigin);
  const token = createParentPortalToken(account);
  return `${resolvedOrigin}/parent?token=${encodeURIComponent(token)}`;
}
