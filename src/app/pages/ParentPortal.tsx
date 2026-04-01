import React, { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, BookOpenCheck, Calculator, QrCode, Sparkles } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { getAccountById, updateAccountById } from "../lib/accountStore";
import { maskPhone } from "../lib/auth";
import {
  GRADE_OPTIONS,
  type GradeKey,
  getCourseRecommendation,
  getGradeOption,
  parseParentPortalToken,
} from "../lib/parentPortal";

export const ParentPortal: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const tokenPayload = useMemo(() => parseParentPortalToken(token), [token]);
  const storedAccount = tokenPayload ? getAccountById(tokenPayload.accountId) : null;

  const initialGrade = useMemo<GradeKey>(() => {
    if (storedAccount?.childGrade) {
      return storedAccount.childGrade as GradeKey;
    }

    return "grade1";
  }, [storedAccount?.childGrade]);

  const [selectedGrade, setSelectedGrade] = useState<GradeKey>(initialGrade);

  const currentGrade = getGradeOption(selectedGrade);
  const recommendation = getCourseRecommendation(selectedGrade);

  const handleGradeChange = (nextGrade: string) => {
    const nextSelectedGrade = nextGrade as GradeKey;
    setSelectedGrade(nextSelectedGrade);

    const nextGradeOption = getGradeOption(nextSelectedGrade);
    if (!tokenPayload || !storedAccount || storedAccount.createdAt !== tokenPayload.createdAt || !nextGradeOption) {
      return;
    }

    updateAccountById(tokenPayload.accountId, (account) => ({
      ...account,
      childGrade: nextSelectedGrade,
      gradeLabel: nextGradeOption.label,
      lastLoginAt: account.lastLoginAt,
    }));
  };

  if (!tokenPayload) {
    return (
      <div className="flex min-h-full items-center justify-center bg-[radial-gradient(circle_at_top,#e0f2fe_0%,#f8fafc_40%,#ecfccb_100%)] p-6">
        <Card className="w-full max-w-[560px] rounded-[32px] border-white/70 bg-white/85 shadow-[0_24px_70px_rgba(15,23,42,0.12)]">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 text-rose-500">
              <QrCode className="h-8 w-8" />
            </div>
            <CardTitle className="text-3xl font-black text-slate-800">家长端 H5 链接已失效</CardTitle>
          </CardHeader>
          <CardContent className="pb-8 text-center text-sm leading-7 text-slate-500">
            请回到学生端首页，重新点击【家长端】入口，直接打开家长端 H5 页面。
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="relative min-h-full overflow-y-auto bg-[radial-gradient(circle_at_top,#d1fae5_0%,#eff6ff_38%,#f8fafc_100%)] px-4 py-6 md:px-6">
      <div className="mx-auto max-w-6xl">
        <header className="mb-5 flex flex-wrap items-center justify-between gap-4 rounded-[30px] border border-white/70 bg-white/80 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-sm md:p-5">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-sm font-black text-emerald-700">
              <Sparkles className="h-4 w-4" />
              家长端 H5
            </div>
            <h1 className="mt-3 text-3xl font-black text-slate-800 md:text-4xl">年级内容匹配</h1>
            <p className="mt-2 text-sm font-medium text-slate-500">
              当前账号：{storedAccount?.phone ? maskPhone(storedAccount.phone) : storedAccount?.nickname ?? "当前孩子账号"}
            </p>
          </div>

          <Button type="button" variant="outline" asChild className="h-11 rounded-2xl border-slate-200 bg-white px-5 text-sm font-black">
            <Link to="/">
              <ArrowLeft className="h-4 w-4" />
              返回学生端
            </Link>
          </Button>
        </header>

        <main className="grid gap-5 lg:grid-cols-[0.84fr_1.16fr]">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="rounded-[34px] border-white/70 bg-white/86 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-black text-slate-800">选择年级</CardTitle>
              </CardHeader>
              <CardContent className="pb-8">
                <div className="rounded-[28px] border border-emerald-100 bg-[linear-gradient(135deg,#ecfdf5_0%,#f0fdfa_100%)] p-5">
                  <div className="text-sm font-black text-emerald-700">孩子年级</div>
                  <div className="mt-3">
                    <Select value={selectedGrade} onValueChange={handleGradeChange}>
                      <SelectTrigger className="h-14 rounded-[20px] border-emerald-200 bg-white px-4 text-base font-black text-slate-800 shadow-sm">
                        <SelectValue placeholder="请选择年级" />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label} · {option.stage}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {currentGrade ? (
                    <div className="mt-4 rounded-2xl bg-white px-4 py-3 text-sm font-bold text-slate-600 shadow-sm">
                      当前年级：{currentGrade.label}
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="grid gap-5"
          >
            <Card className="rounded-[34px] border-white/70 bg-white/86 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-2xl font-black text-slate-800">
                  <BookOpenCheck className="h-6 w-6 text-indigo-500" />
                  单词课程推荐
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-8">
                <div className="rounded-[28px] border border-indigo-100 bg-[linear-gradient(135deg,#eef2ff_0%,#f8fafc_100%)] p-5">
                  <div className="text-2xl font-black text-slate-800">{recommendation?.wordLearning.label ?? "默认词汇内容"}</div>
                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    {recommendation?.wordLearning.description ?? "根据当前年级展示对应的背单词内容。"}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[34px] border-white/70 bg-white/86 shadow-[0_24px_70px_rgba(15,23,42,0.08)]">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-3 text-2xl font-black text-slate-800">
                  <Calculator className="h-6 w-6 text-amber-500" />
                  口算课程推荐
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-8">
                <div className="rounded-[28px] border border-amber-100 bg-[linear-gradient(135deg,#fff7ed_0%,#fffbeb_100%)] p-5">
                  <div className="text-2xl font-black text-slate-800">{recommendation?.oralMath.label ?? "默认口算内容"}</div>
                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    {recommendation?.oralMath.description ?? "根据当前年级展示对应的口算内容。"}
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.section>
        </main>
      </div>
    </div>
  );
};
