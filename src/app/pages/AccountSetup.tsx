import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { AccountProfileForm } from "../components/AccountProfileForm";
import { useAuth } from "../context/AuthContext";
import { getAccountProfileDraft, validateAccountProfileDraft, type AccountProfileValidationErrors } from "../lib/accountProfile";
import { updateAccountById } from "../lib/accountStore";

export const AccountSetup: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser } = useAuth();
  const [draft, setDraft] = useState(() => getAccountProfileDraft(currentUser));
  const [errors, setErrors] = useState<AccountProfileValidationErrors>({});
  const [saving, setSaving] = useState(false);

  const nextPath = useMemo(() => {
    const pathname = typeof location.state?.from?.pathname === "string" ? location.state.from.pathname : "/";
    return pathname === "/account/setup" ? "/" : pathname;
  }, [location.state]);

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
    toast.success("基本信息已保存");
    setSaving(false);
    navigate(nextPath, { replace: true });
  };

  return (
    <div className="relative flex min-h-full items-center justify-center overflow-y-auto bg-[radial-gradient(circle_at_top,#dbeafe_0%,#fef9c3_34%,#dcfce7_100%)] p-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.6)_0%,rgba(255,255,255,0)_30%),radial-gradient(circle_at_80%_15%,rgba(125,211,252,0.25)_0%,rgba(125,211,252,0)_25%),radial-gradient(circle_at_50%_100%,rgba(74,222,128,0.18)_0%,rgba(74,222,128,0)_35%)]" />
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 w-full max-w-[620px]"
      >
        <Card className="rounded-[40px] border-white/70 bg-white/82 shadow-[0_24px_80px_rgba(59,130,246,0.16)] backdrop-blur-xl">
          <CardHeader className="px-6 pt-6 md:px-8 md:pt-8">
            <div className="inline-flex w-fit items-center gap-2 rounded-full bg-sky-100 px-4 py-2 text-sm font-black text-sky-700">
              <Sparkles className="h-4 w-4" />
              完善资料
            </div>
            <CardTitle className="pt-3 text-3xl font-black text-slate-800 md:text-4xl">先填一下基本信息</CardTitle>
          </CardHeader>

          <CardContent className="px-6 pb-6 pt-4 md:px-8 md:pb-8">
            <AccountProfileForm
              draft={draft}
              errors={errors}
              saving={saving}
              submitLabel="保存并开始学习"
              onChange={(patch) => {
                setDraft((previous) => ({ ...previous, ...patch }));
                setErrors((previous) => ({ ...previous, ...Object.fromEntries(Object.keys(patch).map((key) => [key, undefined])) }));
              }}
              onSubmit={handleSubmit}
            />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
