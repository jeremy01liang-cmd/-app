import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, CalendarDays, LogOut, ShieldCheck, Smartphone, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { AccountProfileForm } from "../components/AccountProfileForm";
import { useAuth } from "../context/AuthContext";
import { type AccountProfileValidationErrors, getAccountProfileDraft, validateAccountProfileDraft } from "../lib/accountProfile";
import { updateAccountById } from "../lib/accountStore";
import { maskPhone } from "../lib/auth";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export const Account: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const [draft, setDraft] = useState(() => getAccountProfileDraft(currentUser));
  const [errors, setErrors] = useState<AccountProfileValidationErrors>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraft(getAccountProfileDraft(currentUser));
  }, [currentUser]);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!currentUser) {
      return;
    }

    const nextErrors = validateAccountProfileDraft(draft);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSaving(true);
    updateAccountById(currentUser.accountId, (account) => ({
      ...account,
      nickname: draft.nickname.trim(),
      gender: draft.gender,
      age: Number(draft.age),
    }));
    setSaving(false);
    toast.success("个人信息已更新");
  };

  return (
    <div className="relative min-h-full overflow-y-auto bg-[radial-gradient(circle_at_top,#dbeafe_0%,#f8fafc_42%,#ecfccb_100%)] px-4 py-4 md:px-5 md:py-5">
      <div className="mx-auto max-w-4xl">
        <header className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-[26px] border border-white/70 bg-white/82 p-4 shadow-[0_16px_44px_rgba(15,23,42,0.08)] backdrop-blur-sm">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-sm font-black text-sky-700">
              <Sparkles className="h-4 w-4" />
              账号中心
            </div>
            <h1 className="mt-2 text-2xl font-black text-slate-800 md:text-3xl">个人资料</h1>
          </div>

          <Button type="button" variant="outline" asChild className="h-10 rounded-2xl border-slate-200 bg-white px-5 text-sm font-black">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              返回首页
            </Link>
          </Button>
        </header>

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="overflow-hidden rounded-[30px] border-white/70 bg-white/88 shadow-[0_20px_56px_rgba(15,23,42,0.08)]">
            <div className="relative overflow-hidden bg-[linear-gradient(140deg,#2563eb_0%,#38bdf8_55%,#a7f3d0_100%)] px-5 py-5 text-white md:px-6">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.3)_0%,rgba(255,255,255,0)_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.18)_0%,rgba(255,255,255,0)_28%)]" />
              <div className="relative flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/22 text-3xl shadow-lg backdrop-blur-sm">
                    🦄
                  </div>
                  <div>
                    <div className="text-2xl font-black md:text-3xl">{currentUser?.nickname ?? "--"}</div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-bold text-white/95 md:text-sm">
                      <span className="rounded-full bg-white/18 px-3 py-1">{currentUser?.gradeLabel ?? "--"}</span>
                      <span className="rounded-full bg-white/18 px-3 py-1">
                        {currentUser?.phone ? maskPhone(currentUser.phone) : "--"}
                      </span>
                      <span className="rounded-full bg-white/18 px-3 py-1">{currentUser ? formatDate(currentUser.lastLoginAt) : "--"}</span>
                    </div>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={handleLogout}
                  className="h-10 rounded-2xl bg-white/16 px-4 text-sm font-black text-white shadow-none backdrop-blur-sm hover:bg-white/22"
                >
                  <LogOut className="h-4 w-4" />
                  退出登录
                </Button>
              </div>
            </div>

            <CardHeader className="pb-2 pt-4 md:px-6">
              <CardTitle className="text-xl font-black text-slate-800">基本信息</CardTitle>
            </CardHeader>

            <CardContent className="grid gap-4 pb-5 md:px-6">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="rounded-[20px] border border-sky-100 bg-sky-50/80 p-3">
                  <div className="flex items-center gap-2 text-sm font-black text-sky-700">
                    <Smartphone className="h-4 w-4" />
                    手机号
                  </div>
                  <div className="mt-2 text-base font-black text-slate-800">{currentUser?.phone ? maskPhone(currentUser.phone) : "--"}</div>
                </div>

                <div className="rounded-[20px] border border-amber-100 bg-amber-50/80 p-3">
                  <div className="flex items-center gap-2 text-sm font-black text-amber-700">
                    <ShieldCheck className="h-4 w-4" />
                    学习档位
                  </div>
                  <div className="mt-2 text-base font-black text-slate-800">{currentUser?.gradeLabel ?? "--"}</div>
                </div>

                <div className="rounded-[20px] border border-cyan-100 bg-cyan-50/80 p-3">
                  <div className="flex items-center gap-2 text-sm font-black text-cyan-700">
                    <CalendarDays className="h-4 w-4" />
                    创建时间
                  </div>
                  <div className="mt-2 text-sm font-black text-slate-800">{currentUser ? formatDate(currentUser.createdAt) : "--"}</div>
                </div>

                <div className="rounded-[20px] border border-orange-100 bg-orange-50/80 p-3">
                  <div className="flex items-center gap-2 text-sm font-black text-orange-700">
                    <Sparkles className="h-4 w-4" />
                    最近登录
                  </div>
                  <div className="mt-2 text-sm font-black text-slate-800">{currentUser ? formatDate(currentUser.lastLoginAt) : "--"}</div>
                </div>
              </div>

              <div className="rounded-[24px] border border-slate-100 bg-slate-50/65 p-4 md:p-5">
                <AccountProfileForm
                  draft={draft}
                  errors={errors}
                  saving={saving}
                  submitLabel="保存修改"
                  onChange={(patch) => {
                    setDraft((previous) => ({ ...previous, ...patch }));
                    setErrors((previous) => ({ ...previous, ...Object.fromEntries(Object.keys(patch).map((key) => [key, undefined])) }));
                  }}
                  onSubmit={handleSubmit}
                />
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  );
};
