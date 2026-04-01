import React from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import {
  CHILD_AGE_OPTIONS,
  CHILD_GENDER_OPTIONS,
  type AccountProfileDraft,
  type AccountProfileValidationErrors,
} from "../lib/accountProfile";

interface AccountProfileFormProps {
  draft: AccountProfileDraft;
  errors: AccountProfileValidationErrors;
  saving: boolean;
  submitLabel: string;
  footer?: React.ReactNode;
  onChange: (patch: Partial<AccountProfileDraft>) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

export const AccountProfileForm: React.FC<AccountProfileFormProps> = ({
  draft,
  errors,
  saving,
  submitLabel,
  footer,
  onChange,
  onSubmit,
}) => {
  return (
    <form className="grid gap-5" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-[minmax(0,1.2fr)_minmax(180px,0.8fr)]">
        <div className="grid gap-3">
          <Label htmlFor="nickname" className="text-sm font-black text-slate-700">
            孩子昵称
          </Label>
          <Input
            id="nickname"
            value={draft.nickname}
            maxLength={12}
            placeholder="输入孩子昵称"
            onChange={(event) => onChange({ nickname: event.target.value })}
            className="h-13 rounded-[18px] border-slate-200 bg-slate-50 px-4 text-base"
          />
          {errors.nickname ? <p className="text-sm font-bold text-rose-500">{errors.nickname}</p> : null}
        </div>

        <div className="grid gap-3">
          <Label htmlFor="age" className="text-sm font-black text-slate-700">
            年龄
          </Label>
          <Select value={draft.age} onValueChange={(value) => onChange({ age: value })}>
            <SelectTrigger id="age" className="h-13 rounded-[18px] border-slate-200 bg-slate-50 px-4 text-base font-medium">
              <SelectValue placeholder="选择年龄" />
            </SelectTrigger>
            <SelectContent>
              {CHILD_AGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.age ? <p className="text-sm font-bold text-rose-500">{errors.age}</p> : null}
        </div>
      </div>

      <div className="grid gap-3">
        <Label className="text-sm font-black text-slate-700">性别</Label>
        <RadioGroup
          value={draft.gender}
          onValueChange={(value) => onChange({ gender: value as AccountProfileDraft["gender"] })}
          className="grid grid-cols-2 gap-3"
        >
          {CHILD_GENDER_OPTIONS.map((option) => (
            <Label
              key={option.value}
              htmlFor={`gender-${option.value}`}
              className={`flex cursor-pointer items-center gap-3 rounded-[18px] border px-4 py-3 transition-colors ${
                draft.gender === option.value
                  ? "border-sky-300 bg-sky-50 text-sky-700"
                  : "border-slate-200 bg-slate-50 text-slate-600"
              }`}
            >
              <RadioGroupItem id={`gender-${option.value}`} value={option.value} />
              <span className="text-base font-black">{option.label}</span>
            </Label>
          ))}
        </RadioGroup>
        {errors.gender ? <p className="text-sm font-bold text-rose-500">{errors.gender}</p> : null}
      </div>

      <Button
        type="submit"
        disabled={saving}
        className="mt-1 h-12 rounded-[20px] bg-[linear-gradient(135deg,#2563eb_0%,#0ea5e9_55%,#22c55e_100%)] text-base font-black text-white shadow-[0_14px_28px_rgba(37,99,235,0.24)] hover:opacity-95"
      >
        {saving ? "保存中..." : submitLabel}
      </Button>

      {footer}
    </form>
  );
};
