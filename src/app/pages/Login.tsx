import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { LogIn, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { isValidPhone, maskPhone, normalizePhone, UNIVERSAL_TEST_CODE } from "../lib/auth";

const LearningMascotArt: React.FC = () => {
  return (
    <div className="relative mx-auto aspect-[1.04] w-full max-w-[460px]">
      <motion.div
        animate={{ y: [0, -10, 0], rotate: [0, -2, 0] }}
        transition={{ duration: 4.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        className="absolute left-3 top-8 rounded-full bg-white/30 px-5 py-3 text-3xl shadow-lg backdrop-blur-sm"
      >
        ☁️
      </motion.div>
      <motion.div
        animate={{ y: [0, -8, 0], rotate: [0, 3, 0] }}
        transition={{ duration: 3.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.5 }}
        className="absolute right-4 top-12 rounded-full bg-white/25 px-4 py-2 text-2xl shadow-lg backdrop-blur-sm"
      >
        ⭐
      </motion.div>
      <motion.div
        animate={{ y: [0, -7, 0], rotate: [0, 4, 0] }}
        transition={{ duration: 3.4, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.2 }}
        className="absolute left-8 bottom-20 rounded-[24px] bg-[#fef3c7] px-4 py-3 text-3xl shadow-[0_20px_40px_rgba(250,204,21,0.25)]"
      >
        ✏️
      </motion.div>
      <motion.div
        animate={{ y: [0, -6, 0], rotate: [0, -5, 0] }}
        transition={{ duration: 3.9, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut", delay: 0.8 }}
        className="absolute right-10 bottom-28 rounded-[24px] bg-[#dbeafe] px-4 py-3 text-3xl shadow-[0_20px_40px_rgba(59,130,246,0.22)]"
      >
        📚
      </motion.div>

      <div className="absolute inset-x-6 bottom-0 h-28 rounded-[999px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0)_72%)] blur-xl" />

      <motion.svg
        viewBox="0 0 420 420"
        className="absolute inset-0 h-full w-full drop-shadow-[0_30px_60px_rgba(14,165,233,0.24)]"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
      >
        <defs>
          <linearGradient id="skyBoard" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.94" />
            <stop offset="100%" stopColor="#dbeafe" stopOpacity="0.9" />
          </linearGradient>
          <linearGradient id="ponyBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fdf2f8" />
            <stop offset="100%" stopColor="#fbcfe8" />
          </linearGradient>
          <linearGradient id="ponyHair" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#f472b6" />
          </linearGradient>
          <linearGradient id="bookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="100%" stopColor="#f59e0b" />
          </linearGradient>
        </defs>

        <ellipse cx="210" cy="357" rx="120" ry="28" fill="#1d4ed8" opacity="0.12" />
        <path d="M52 304C86 255 140 230 207 230C273 230 329 255 367 304V331H52V304Z" fill="#4ade80" opacity="0.7" />
        <path d="M83 286C114 257 156 241 210 241C262 241 304 257 337 286V322H83V286Z" fill="#86efac" />

        <g transform="translate(185 60)">
          <circle cx="26" cy="26" r="26" fill="#fde047" />
          <g stroke="#f59e0b" strokeWidth="6" strokeLinecap="round">
            <path d="M26 -8V-24" />
            <path d="M26 60V76" />
            <path d="M-8 26H-24" />
            <path d="M60 26H76" />
            <path d="M3 3L-9 -9" />
            <path d="M49 49L61 61" />
            <path d="M3 49L-9 61" />
            <path d="M49 3L61 -9" />
          </g>
        </g>

        <g transform="translate(96 110)">
          <rect x="0" y="0" width="230" height="146" rx="28" fill="url(#skyBoard)" />
          <rect x="18" y="18" width="194" height="110" rx="22" fill="#eff6ff" />
          <path d="M115 128L115 146" stroke="#93c5fd" strokeWidth="7" strokeLinecap="round" />
          <path d="M79 48C89 34 111 31 125 42C138 25 164 26 176 44C191 43 203 52 204 67C205 83 193 92 175 92H83C63 92 49 80 50 63C51 47 63 37 79 48Z" fill="#ffffff" />
          <path d="M70 109H164" stroke="#bfdbfe" strokeWidth="10" strokeLinecap="round" />
          <path d="M70 126H140" stroke="#bfdbfe" strokeWidth="10" strokeLinecap="round" />
        </g>

        <g transform="translate(118 184)">
          <ellipse cx="106" cy="124" rx="68" ry="22" fill="#c084fc" opacity="0.18" />
          <path d="M119 22C135 18 150 26 157 40C166 58 157 79 139 88L132 94L96 93C78 83 71 58 79 40C85 26 102 18 119 22Z" fill="url(#ponyHair)" />
          <path d="M114 55C148 55 176 83 176 119C176 155 148 186 114 186C80 186 52 155 52 119C52 83 80 55 114 55Z" fill="url(#ponyBody)" />
          <path d="M155 108C182 112 200 131 200 157C200 184 182 202 156 206L144 187C159 180 167 170 167 157C167 146 160 136 148 131L155 108Z" fill="url(#ponyBody)" />
          <path d="M77 178C69 192 56 203 38 209" stroke="#f9a8d4" strokeWidth="18" strokeLinecap="round" />
          <path d="M109 187L103 223" stroke="#f9a8d4" strokeWidth="18" strokeLinecap="round" />
          <path d="M147 184L154 223" stroke="#f9a8d4" strokeWidth="18" strokeLinecap="round" />
          <path d="M76 100C62 110 52 126 48 142L31 131C37 112 48 96 65 84L76 100Z" fill="#fbcfe8" />
          <ellipse cx="92" cy="116" rx="9" ry="13" fill="#1f2937" />
          <ellipse cx="132" cy="116" rx="9" ry="13" fill="#1f2937" />
          <ellipse cx="89" cy="112" rx="3" ry="4" fill="#ffffff" />
          <ellipse cx="129" cy="112" rx="3" ry="4" fill="#ffffff" />
          <path d="M101 140C108 147 120 147 127 140" stroke="#db2777" strokeWidth="6" strokeLinecap="round" />
          <circle cx="78" cy="134" r="8" fill="#f9a8d4" opacity="0.7" />
          <circle cx="149" cy="134" r="8" fill="#f9a8d4" opacity="0.7" />
          <path d="M155 85C168 84 181 94 187 107C193 119 192 132 184 143L158 136C163 127 163 118 160 109C157 100 151 93 143 89L155 85Z" fill="url(#ponyHair)" />
          <path d="M100 52C96 37 102 22 116 15C131 7 150 12 160 26L143 43C138 36 130 33 122 36C115 39 111 46 112 54L100 52Z" fill="#facc15" />
        </g>

        <g transform="translate(242 214) rotate(10)">
          <path d="M0 18C0 8 8 0 18 0H88C98 0 106 8 106 18V80C106 90 98 98 88 98H18C8 98 0 90 0 80V18Z" fill="url(#bookGrad)" />
          <path d="M53 0V98" stroke="#ffffff" strokeWidth="6" opacity="0.85" />
          <path d="M18 20H42" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" opacity="0.8" />
          <path d="M64 20H88" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" opacity="0.8" />
          <path d="M18 42H42" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" opacity="0.8" />
          <path d="M64 42H88" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" opacity="0.8" />
        </g>
      </motion.svg>
    </div>
  );
};

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithCode, sendVerificationCode } = useAuth();
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setCountdown((previous) => {
        if (previous <= 1) {
          window.clearInterval(timer);
          return 0;
        }

        return previous - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [countdown]);

  const handleSendCode = async () => {
    const normalizedPhone = normalizePhone(phone);
    if (!isValidPhone(normalizedPhone)) {
      toast.error("请输入正确的 11 位手机号");
      return;
    }

    setSending(true);
    try {
      sendVerificationCode(normalizedPhone);
      setPhone(normalizedPhone);
      setCountdown(60);
      toast.success(`验证码已发送到 ${maskPhone(normalizedPhone)}，测试可直接输入 ${UNIVERSAL_TEST_CODE}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "验证码发送失败");
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setLoggingIn(true);
    try {
      const result = loginWithCode(phone, code);
      toast.success(result.isNewUser ? "新账号创建成功，欢迎开始学习" : `欢迎回来，${result.user.nickname}`);
      navigate("/", { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "登录失败，请稍后再试");
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <div className="relative flex h-full min-h-0 items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,#fde68a_0%,#fef3c7_28%,#dbeafe_100%)] p-5">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.65)_0%,rgba(255,255,255,0)_30%),radial-gradient(circle_at_80%_15%,rgba(125,211,252,0.35)_0%,rgba(125,211,252,0)_25%),radial-gradient(circle_at_50%_100%,rgba(74,222,128,0.2)_0%,rgba(74,222,128,0)_35%)]" />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35 }}
        className="relative z-10 w-full max-w-[980px]"
      >
        <Card className="grid overflow-hidden rounded-[40px] border-white/70 bg-white/78 shadow-[0_24px_80px_rgba(59,130,246,0.16)] backdrop-blur-xl md:grid-cols-[1.12fr_0.88fr]">
          <div className="relative overflow-hidden bg-[linear-gradient(165deg,#2563eb_0%,#38bdf8_46%,#a7f3d0_76%,#fef08a_100%)] px-6 py-8 md:px-8 md:py-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.34)_0%,rgba(255,255,255,0)_34%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0)_28%)]" />
            <div className="relative flex h-full items-center justify-center">
              <LearningMascotArt />
            </div>
          </div>

          <div className="p-6 md:p-8 lg:p-10">
            <CardHeader className="px-0 pt-0">
              <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full bg-sky-100 px-4 py-2 text-sm font-black text-sky-700">
                <Smartphone className="h-4 w-4" />
                登录
              </div>
              <CardTitle className="text-3xl font-black tracking-tight text-slate-800 md:text-4xl">欢迎回来</CardTitle>
            </CardHeader>

            <CardContent className="px-0 pt-4">
              <form className="grid gap-6" onSubmit={handleSubmit}>
                <div className="grid gap-3">
                  <Label htmlFor="phone" className="text-sm font-black text-slate-700">
                    手机号
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={11}
                    placeholder="输入手机号"
                    value={phone}
                    onChange={(event) => setPhone(normalizePhone(event.target.value).slice(0, 11))}
                    className="h-14 rounded-[22px] border-slate-200 bg-slate-50 px-5 text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
                  />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="code" className="text-sm font-black text-slate-700">
                    验证码
                  </Label>
                  <div className="flex gap-3 max-[420px]:flex-col">
                    <Input
                      id="code"
                      type="tel"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder={UNIVERSAL_TEST_CODE}
                      value={code}
                      onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="h-14 rounded-[22px] border-slate-200 bg-slate-50 px-5 text-base shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={sending || countdown > 0}
                      onClick={handleSendCode}
                      className="h-14 min-w-[140px] rounded-[22px] border-sky-200 bg-sky-50 px-5 font-black text-sky-700 shadow-[0_12px_24px_rgba(14,165,233,0.12)] hover:bg-sky-100"
                    >
                      {countdown > 0 ? `${countdown}s后重发` : sending ? "发送中..." : "发送验证码"}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loggingIn}
                  className="mt-2 h-14 rounded-[22px] bg-[linear-gradient(135deg,#2563eb_0%,#0ea5e9_55%,#22c55e_100%)] text-base font-black shadow-[0_16px_34px_rgba(37,99,235,0.28)] hover:opacity-95"
                >
                  <LogIn className="h-5 w-5" />
                  {loggingIn ? "登录中..." : "进入学习乐园"}
                </Button>
              </form>
            </CardContent>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};
