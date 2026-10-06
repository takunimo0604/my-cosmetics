"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "./toast";

type Mode = "login" | "signup" | "reset";

const fieldClass =
  "w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-stone-800 placeholder:text-stone-400 outline-none transition focus:border-rose-400 focus:ring-2 focus:ring-rose-200";

export default function AuthModal() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<{ email: string; name: string } | null>(
    null,
  );
  const [showInfo, setShowInfo] = useState(false);
  const signedIn = !!profile;

  useEffect(() => {
    if (!supabase) return;
    const toProfile = (
      u: { email?: string; user_metadata?: { name?: string } } | undefined,
    ) => (u ? { email: u.email ?? "", name: u.user_metadata?.name ?? "" } : null);
    supabase.auth
      .getSession()
      .then(({ data }) => setProfile(toProfile(data.session?.user)));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setProfile(toProfile(session?.user));
      if (!session) setShowInfo(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!open && !showInfo) return;
    const close = () => {
      setOpen(false);
      setShowInfo(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, showInfo]);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError("");
    setNotice("");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setNotice("");
    const data = new FormData(e.currentTarget);
    const email = String(data.get("email"));
    const password = String(data.get("password"));

    if (!supabase) {
      setError(
        "Supabase 환경 변수가 없습니다. .env.local에 NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정하고 서버를 다시 시작해 주세요.",
      );
      return;
    }
    if (mode === "reset") {
      setLoading(true);
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) return fail(error.message);
        setNotice("비밀번호 재설정 이메일이 발송되었습니다. 이메일을 확인해 주세요.");
        toast("success", "비밀번호 재설정 이메일을 보냈어요.");
      } finally {
        setLoading(false);
      }
      return;
    }
    if (mode === "signup" && password !== data.get("passwordConfirm")) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "signup") {
        const { data: res, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name: String(data.get("name")) } },
        });
        if (error) return fail(error.message);
        if (!res.session) {
          // 이메일 인증이 켜져 있으면 세션이 바로 생기지 않음
          setMode("login");
          setNotice("가입 확인 메일을 보냈습니다. 인증 후 로그인해주세요.");
          toast("success", "가입 확인 메일을 보냈어요.");
          return;
        }
        toast("success", "회원가입이 완료되었습니다.");
        setOpen(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) return fail(error.message);
        toast("success", "로그인되었습니다.");
        setOpen(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const fail = (message: string) => {
    setError(message);
    toast("error", message);
  };

  const handleSignOut = async () => {
    const { error } = (await supabase?.auth.signOut()) ?? {};
    if (error) toast("error", `로그아웃 실패: ${error.message}`);
    else toast("success", "로그아웃되었습니다.");
  };

  const isLogin = mode === "login";
  const isReset = mode === "reset";

  return (
    <>
      <div className="flex items-center gap-2">
        {signedIn && (
          <button
            type="button"
            onClick={() => setShowInfo(true)}
            className="rounded-full border border-stone-300 px-4 py-1.5 text-sm text-stone-700 transition hover:border-rose-400 hover:text-rose-500"
          >
            내 정보
          </button>
        )}
        <button
          type="button"
          onClick={signedIn ? handleSignOut : () => setOpen(true)}
          className="rounded-full border border-stone-300 px-4 py-1.5 text-sm text-stone-700 transition hover:border-rose-400 hover:text-rose-500"
        >
          {signedIn ? "로그아웃" : "로그인"}
        </button>
      </div>

      {showInfo &&
        profile &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-sm"
            onClick={() => setShowInfo(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="내 정보"
              className="relative w-full max-w-sm rounded-3xl bg-white p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                aria-label="닫기"
                onClick={() => setShowInfo(false)}
                className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full text-xl text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
              >
                ✕
              </button>
              <p className="text-xs tracking-[0.3em] text-rose-500">takunimo</p>
              <h2 className="mt-2 mb-6 text-2xl font-light">내 정보</h2>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-stone-400">이름</dt>
                  <dd className="mt-1 text-stone-800">{profile.name || "-"}</dd>
                </div>
                <div>
                  <dt className="text-stone-400">이메일</dt>
                  <dd className="mt-1 text-stone-800">{profile.email}</dd>
                </div>
              </dl>
            </div>
          </div>,
          document.body,
        )}

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 p-4 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={isReset ? "비밀번호 재설정" : isLogin ? "로그인" : "회원가입"}
              className="relative max-h-full w-full max-w-md overflow-y-auto rounded-3xl bg-white p-8 shadow-2xl sm:p-10"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                aria-label="닫기"
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full text-xl text-stone-400 transition hover:bg-stone-100 hover:text-stone-700"
              >
                ✕
              </button>

              <p className="text-xs tracking-[0.3em] text-rose-500">
                takunimo
              </p>
              <h2 className="mt-2 mb-8 text-2xl font-light">
                {isReset
                  ? "비밀번호 재설정"
                  : isLogin
                    ? "다시 만나서 반가워요"
                    : "새로운 시작을 환영해요"}
              </h2>

              <form
                key={mode}
                onSubmit={handleSubmit}
                className="space-y-4"
              >
                {mode === "signup" && (
                  <div>
                    <label
                      htmlFor="auth-name"
                      className="mb-2 block text-sm text-stone-600"
                    >
                      이름
                    </label>
                    <input
                      id="auth-name"
                      name="name"
                      type="text"
                      required
                      placeholder="홍길동"
                      className={fieldClass}
                    />
                  </div>
                )}
                <div>
                  <label
                    htmlFor="auth-email"
                    className="mb-2 block text-sm text-stone-600"
                  >
                    이메일
                  </label>
                  <input
                    id="auth-email"
                    name="email"
                    type="email"
                    required
                    placeholder="hello@example.com"
                    className={fieldClass}
                  />
                </div>
                {!isReset && (
                <div>
                  <label
                    htmlFor="auth-password"
                    className="mb-2 block text-sm text-stone-600"
                  >
                    비밀번호
                  </label>
                  <input
                    id="auth-password"
                    name="password"
                    type="password"
                    required
                    minLength={isLogin ? undefined : 8}
                    placeholder={isLogin ? "비밀번호" : "8자 이상"}
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    className={fieldClass}
                  />
                </div>
                )}
                {mode === "signup" && (
                  <div>
                    <label
                      htmlFor="auth-password-confirm"
                      className="mb-2 block text-sm text-stone-600"
                    >
                      비밀번호 확인
                    </label>
                    <input
                      id="auth-password-confirm"
                      name="passwordConfirm"
                      type="password"
                      required
                      placeholder="비밀번호 재입력"
                      autoComplete="new-password"
                      className={fieldClass}
                    />
                  </div>
                )}

                {notice && (
                  <p role="status" className="text-sm text-emerald-600">
                    {notice}
                  </p>
                )}
                {error && (
                  <p role="alert" className="text-sm text-rose-500">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-stone-900 px-6 py-3.5 font-medium text-white transition hover:bg-rose-500 disabled:opacity-60"
                >
                  {loading
                    ? "처리 중..."
                    : isReset
                      ? "비밀번호 재설정 이메일 받기"
                      : isLogin
                        ? "로그인"
                        : "회원가입"}
                </button>
              </form>

              {isLogin && (
                <p className="mt-4 text-center text-sm">
                  <button
                    type="button"
                    onClick={() => switchMode("reset")}
                    className="text-stone-500 underline-offset-4 hover:text-rose-500 hover:underline"
                  >
                    비밀번호를 잊으셨나요?
                  </button>
                </p>
              )}

              {isReset ? (
                <p className="mt-6 text-center text-sm">
                  <button
                    type="button"
                    onClick={() => switchMode("login")}
                    className="font-medium text-rose-500 underline-offset-4 hover:underline"
                  >
                    로그인 화면으로 돌아가기
                  </button>
                </p>
              ) : (
                <p className="mt-6 text-center text-sm text-stone-500">
                  {isLogin ? "계정이 없으신가요?" : "이미 계정이 있으신가요?"}{" "}
                  <button
                    type="button"
                    onClick={() => switchMode(isLogin ? "signup" : "login")}
                    className="font-medium text-rose-500 underline-offset-4 hover:underline"
                  >
                    {isLogin ? "회원가입" : "로그인"}
                  </button>
                </p>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
