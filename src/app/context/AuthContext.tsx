import React, { createContext, useContext, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { buildDefaultNickname, isValidPhone, normalizePhone, UNIVERSAL_TEST_CODE } from "../lib/auth";
import {
  ACCOUNT_PROFILE_UPDATED_EVENT,
  type AccountProfile,
  loadAccounts,
  loadCurrentUser,
  notifyAccountProfileUpdated,
  persistSession,
  saveAccounts,
} from "../lib/accountStore";

const OTP_CACHE_STORAGE_KEY = "codex-learning-otp-cache";
const OTP_EXPIRE_MS = 5 * 60 * 1000;

interface StoredOtpRecord {
  code: string;
  expiresAt: number;
}

type StoredOtpCache = Record<string, StoredOtpRecord>;

interface LoginResult {
  user: AccountProfile;
  isNewUser: boolean;
}

interface AuthContextType {
  currentUser: AccountProfile | null;
  isAuthenticated: boolean;
  sendVerificationCode: (phone: string) => string;
  loginWithCode: (phone: string, code: string) => LoginResult;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function loadOtpCache(): StoredOtpCache {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(OTP_CACHE_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    return JSON.parse(raw) as StoredOtpCache;
  } catch {
    return {};
  }
}

function saveOtpCache(cache: StoredOtpCache) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(OTP_CACHE_STORAGE_KEY, JSON.stringify(cache));
}

function pruneExpiredOtps(cache: StoredOtpCache) {
  const now = Date.now();
  return Object.fromEntries(Object.entries(cache).filter(([, record]) => record.expiresAt > now));
}

function generateVerificationCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AccountProfile | null>(loadCurrentUser);

  React.useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const syncCurrentUser = () => {
      setCurrentUser(loadCurrentUser());
    };

    window.addEventListener("storage", syncCurrentUser);
    window.addEventListener(ACCOUNT_PROFILE_UPDATED_EVENT, syncCurrentUser);

    return () => {
      window.removeEventListener("storage", syncCurrentUser);
      window.removeEventListener(ACCOUNT_PROFILE_UPDATED_EVENT, syncCurrentUser);
    };
  }, []);

  const sendVerificationCode = (rawPhone: string) => {
    const phone = normalizePhone(rawPhone);
    if (!isValidPhone(phone)) {
      throw new Error("请输入正确的 11 位手机号");
    }

    const nextCache = pruneExpiredOtps(loadOtpCache());
    const verificationCode = generateVerificationCode();
    nextCache[phone] = {
      code: verificationCode,
      expiresAt: Date.now() + OTP_EXPIRE_MS,
    };
    saveOtpCache(nextCache);

    return verificationCode;
  };

  const loginWithCode = (rawPhone: string, rawCode: string): LoginResult => {
    const phone = normalizePhone(rawPhone);
    const code = rawCode.trim();

    if (!isValidPhone(phone)) {
      throw new Error("请输入正确的 11 位手机号");
    }

    if (!/^\d{6}$/.test(code)) {
      throw new Error("请输入 6 位数字验证码");
    }

    const nextCache = pruneExpiredOtps(loadOtpCache());
    const cachedCode = nextCache[phone];
    const isUniversalCode = code === UNIVERSAL_TEST_CODE;
    const matchesCachedCode = cachedCode && cachedCode.code === code && cachedCode.expiresAt > Date.now();

    if (!isUniversalCode && !matchesCachedCode) {
      throw new Error("验证码不正确或已过期");
    }

    const accounts = loadAccounts();
    const now = new Date().toISOString();
    const existingUser = accounts[phone];
    const nextUser: AccountProfile = existingUser
      ? {
          ...existingUser,
          lastLoginAt: now,
        }
      : {
          accountId: phone,
          phone,
          nickname: buildDefaultNickname(phone),
          gender: null,
          age: null,
          gradeLabel: "家长待设置年级",
          createdAt: now,
          lastLoginAt: now,
          childGrade: null,
        };

    accounts[phone] = nextUser;
    saveAccounts(accounts);

    delete nextCache[phone];
    saveOtpCache(nextCache);
    persistSession(nextUser.accountId);
    setCurrentUser(nextUser);
    notifyAccountProfileUpdated();

    return {
      user: nextUser,
      isNewUser: !existingUser,
    };
  };

  const logout = () => {
    persistSession(null);
    setCurrentUser(null);
    toast.success("已退出当前账号");
  };

  const value: AuthContextType = {
    currentUser,
    isAuthenticated: currentUser !== null,
    sendVerificationCode,
    loginWithCode,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
