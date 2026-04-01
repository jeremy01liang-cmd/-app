export interface AccountProfile {
  accountId: string;
  phone: string;
  nickname: string;
  gender: "boy" | "girl" | null;
  age: number | null;
  gradeLabel: string;
  createdAt: string;
  lastLoginAt: string;
  childGrade: string | null;
}

interface StoredSession {
  accountId?: string;
  phone?: string;
}

const ACCOUNTS_STORAGE_KEY = "codex-learning-accounts";
const SESSION_STORAGE_KEY = "codex-learning-session";

export const ACCOUNT_PROFILE_UPDATED_EVENT = "codex-learning-account-updated";

export function loadAccounts(): Record<string, AccountProfile> {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw) as Record<string, Partial<AccountProfile>>;
    return Object.fromEntries(
      Object.entries(parsed).map(([phone, profile]) => [
        profile.accountId ?? phone,
        {
          accountId: profile.accountId ?? phone,
          phone: typeof profile.phone === "string" ? profile.phone : /^1\d{10}$/.test(phone) ? phone : "",
          nickname:
            profile.nickname ??
            (typeof profile.phone === "string" && /^1\d{10}$/.test(profile.phone)
              ? `小朋友${profile.phone.slice(-4)}`
              : "学习小朋友"),
          gender: profile.gender === "boy" || profile.gender === "girl" ? profile.gender : null,
          age: typeof profile.age === "number" && Number.isFinite(profile.age) ? profile.age : null,
          gradeLabel: profile.gradeLabel ?? "家长待设置年级",
          createdAt: profile.createdAt ?? new Date().toISOString(),
          lastLoginAt: profile.lastLoginAt ?? new Date().toISOString(),
          childGrade: typeof profile.childGrade === "string" ? profile.childGrade : null,
        },
      ]),
    );
  } catch {
    return {};
  }
}

export function saveAccounts(accounts: Record<string, AccountProfile>) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
}

export function getAccountById(accountId: string) {
  const accounts = loadAccounts();
  return accounts[accountId] ?? null;
}

export function getAccountByPhone(phone: string) {
  const accounts = loadAccounts();
  return Object.values(accounts).find((account) => account.phone === phone) ?? null;
}

export function updateAccountById(accountId: string, updater: (account: AccountProfile) => AccountProfile) {
  const accounts = loadAccounts();
  const currentAccount = accounts[accountId];
  if (!currentAccount) {
    return null;
  }

  const nextAccount = updater(currentAccount);
  accounts[accountId] = nextAccount;
  saveAccounts(accounts);
  notifyAccountProfileUpdated();
  return nextAccount;
}

export function updateAccountByPhone(phone: string, updater: (account: AccountProfile) => AccountProfile) {
  const currentAccount = getAccountByPhone(phone);
  if (!currentAccount) {
    return null;
  }

  return updateAccountById(currentAccount.accountId, updater);
}

export function loadCurrentUser(): AccountProfile | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const rawSession = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!rawSession) {
      return null;
    }

    const session = JSON.parse(rawSession) as StoredSession;
    const accountId = typeof session.accountId === "string" ? session.accountId : session.phone;
    if (!accountId) {
      return null;
    }

    return getAccountById(accountId);
  } catch {
    return null;
  }
}

export function persistSession(accountId: string | null) {
  if (typeof window === "undefined") {
    return;
  }

  if (!accountId) {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ accountId }));
}

export function notifyAccountProfileUpdated() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(ACCOUNT_PROFILE_UPDATED_EVENT));
}
