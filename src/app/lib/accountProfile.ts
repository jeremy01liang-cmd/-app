import type { AccountProfile } from "./accountStore";

export type ChildGender = "boy" | "girl";

export interface AccountProfileDraft {
  nickname: string;
  gender: ChildGender | "";
  age: string;
}

export interface AccountProfileValidationErrors {
  nickname?: string;
  gender?: string;
  age?: string;
}

export const CHILD_GENDER_OPTIONS: Array<{ value: ChildGender; label: string }> = [
  { value: "boy", label: "男孩" },
  { value: "girl", label: "女孩" },
];

export const CHILD_AGE_OPTIONS = Array.from({ length: 14 }, (_, index) => {
  const age = index + 3;
  return { value: String(age), label: `${age} 岁` };
});

export function getAccountProfileDraft(account: AccountProfile | null): AccountProfileDraft {
  return {
    nickname: account?.nickname ?? "",
    gender: account?.gender ?? "",
    age: account?.age ? String(account.age) : "",
  };
}

export function validateAccountProfileDraft(draft: AccountProfileDraft): AccountProfileValidationErrors {
  const errors: AccountProfileValidationErrors = {};
  const nickname = draft.nickname.trim();
  const age = Number(draft.age);

  if (!nickname) {
    errors.nickname = "请输入孩子昵称";
  } else if (nickname.length > 12) {
    errors.nickname = "昵称最多 12 个字";
  }

  if (!draft.gender) {
    errors.gender = "请选择性别";
  }

  if (!draft.age) {
    errors.age = "请选择年龄";
  } else if (!Number.isInteger(age) || age < 3 || age > 16) {
    errors.age = "年龄请选择 3 到 16 岁";
  }

  return errors;
}

export function isAccountProfileComplete(account: AccountProfile | null | undefined) {
  if (!account) {
    return false;
  }

  return Boolean(
    account.nickname.trim() &&
      account.gender &&
      typeof account.age === "number" &&
      Number.isInteger(account.age) &&
      account.age >= 3 &&
      account.age <= 16,
  );
}

export function getGenderLabel(gender: ChildGender | null | undefined) {
  if (gender === "boy") {
    return "男孩";
  }

  if (gender === "girl") {
    return "女孩";
  }

  return "待填写";
}
